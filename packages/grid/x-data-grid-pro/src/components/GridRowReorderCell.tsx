import * as React from 'react';
import { unstable_composeClasses as composeClasses } from '@mui/material';
import {
  GridRenderCellParams,
  GridRowEventLookup,
  gridRowTreeDepthSelector,
  gridSortModelSelector,
  useGridApiContext,
  useGridSelector,
  getDataGridUtilityClass,
  gridEditRowsStateSelector,
} from '@mui/x-data-grid';
import { DataGridProProcessedProps } from '../models/dataGridProProps';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';

type OwnerState = {
  classes?: DataGridProProcessedProps['classes'];
  isDraggable: boolean;
};

const useUtilityClasses = (ownerState: OwnerState) => {
  const { isDraggable, classes } = ownerState;

  const slots = {
    root: ['rowReorderCell', isDraggable && 'rowReorderCell--draggable'],
    placeholder: ['rowReorderCellPlaceholder'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

const GridRowReorderCell = (params: GridRenderCellParams) => {
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const sortModel = useGridSelector(apiRef, gridSortModelSelector);
  const treeDepth = useGridSelector(apiRef, gridRowTreeDepthSelector);
  const editRowsState = useGridSelector(apiRef, gridEditRowsStateSelector);
  // eslint-disable-next-line no-underscore-dangle
  const cellValue = params.row.__reorder__ || params.id;

  // TODO: remove sortModel and treeDepth checks once row reorder is compatible
  const isDraggable = React.useMemo(
    () =>
      !!rootProps.rowReordering &&
      !sortModel.length &&
      treeDepth === 1 &&
      Object.keys(editRowsState).length === 0,
    [rootProps.rowReordering, sortModel, treeDepth, editRowsState],
  );

  const ownerState = { isDraggable, classes: rootProps.classes };
  const classes = useUtilityClasses(ownerState);

  const publish = React.useCallback(
    (
        eventName: keyof GridRowEventLookup,
        propHandler?: React.MouseEventHandler<HTMLDivElement> | undefined,
      ): React.MouseEventHandler<HTMLDivElement> =>
      (event) => {
        // Ignore portal
        // The target is not an element when triggered by a Select inside the cell
        // See https://github.com/mui/material-ui/issues/10534
        if (
          (event.target as any).nodeType === 1 &&
          !event.currentTarget.contains(event.target as Element)
        ) {
          return;
        }

        // The row might have been deleted
        if (!apiRef.current.getRow(params.id)) {
          return;
        }

        apiRef.current.publishEvent(eventName, apiRef.current.getRowParams(params.id), event);

        if (propHandler) {
          propHandler(event);
        }
      },
    [apiRef, params.id],
  );

  const draggableEventHandlers = isDraggable
    ? {
        onDragStart: publish('rowDragStart'),
        onDragOver: publish('rowDragOver'),
        onDragEnd: publish('rowDragEnd'),
      }
    : null;

  return (
    <div className={classes.root} draggable={isDraggable} {...draggableEventHandlers}>
      <rootProps.components.RowReorderIcon />
      <div className={classes.placeholder}>{cellValue}</div>
    </div>
  );
};

export { GridRowReorderCell };

export const renderRowReorderCell = (params: GridRenderCellParams) => (
  <GridRowReorderCell {...params} />
);
