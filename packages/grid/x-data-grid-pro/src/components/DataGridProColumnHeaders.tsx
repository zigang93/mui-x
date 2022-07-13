import * as React from 'react';
import { unstable_composeClasses as composeClasses } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useEventCallback } from '@mui/material/utils';
import {
  getDataGridUtilityClass,
  gridClasses,
  useGridSelector,
  useGridApiEventHandler,
  gridVisibleColumnFieldsSelector,
  GridColumnHeaderSeparatorSides,
} from '@mui/x-data-grid';
import {
  GridColumnHeaders,
  GridColumnHeadersInner,
  useGridColumnHeaders,
} from '@mui/x-data-grid/internals';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { DataGridProProcessedProps } from '../models/dataGridProProps';
import {
  gridPinnedColumnsSelector,
  GridPinnedPosition,
  GridPinnedColumns,
} from '../hooks/features/columnPinning';
import { filterColumns } from './DataGridProVirtualScroller';

type OwnerState = {
  classes?: DataGridProProcessedProps['classes'];
  leftPinnedColumns: GridPinnedColumns['left'];
  rightPinnedColumns: GridPinnedColumns['right'];
};

const useUtilityClasses = (ownerState: OwnerState) => {
  const { leftPinnedColumns, rightPinnedColumns, classes } = ownerState;

  const slots = {
    leftPinnedColumns: [
      'pinnedColumnHeaders',
      leftPinnedColumns && leftPinnedColumns.length > 0 && `pinnedColumnHeaders--left`,
    ],
    rightPinnedColumns: [
      'pinnedColumnHeaders',
      rightPinnedColumns && rightPinnedColumns.length > 0 && `pinnedColumnHeaders--right`,
    ],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

interface GridColumnHeadersPinnedColumnHeadersProps {
  side: GridPinnedPosition;
}

// Inspired by https://github.com/material-components/material-components-ios/blob/bca36107405594d5b7b16265a5b0ed698f85a5ee/components/Elevation/src/UIColor%2BMaterialElevation.m#L61
const getOverlayAlpha = (elevation: number) => {
  let alphaValue;
  if (elevation < 1) {
    alphaValue = 5.11916 * elevation ** 2;
  } else {
    alphaValue = 4.5 * Math.log(elevation + 1) + 2;
  }
  return alphaValue / 100;
};

const GridColumnHeadersPinnedColumnHeaders = styled('div', {
  name: 'MuiDataGrid',
  slot: 'PinnedColumnHeaders',
  overridesResolver: (props, styles) => [
    { [`&.${gridClasses['pinnedColumnHeaders--left']}`]: styles['pinnedColumnHeaders--left'] },
    { [`&.${gridClasses['pinnedColumnHeaders--right']}`]: styles['pinnedColumnHeaders--right'] },
    styles.pinnedColumnHeaders,
  ],
})<{ ownerState: GridColumnHeadersPinnedColumnHeadersProps }>(({ theme, ownerState }) => ({
  position: 'absolute',
  overflow: 'hidden',
  height: '100%',
  zIndex: 1,
  display: 'flex',
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.default,
  ...(theme.palette.mode === 'dark' && {
    backgroundImage: `linear-gradient(${alpha('#fff', getOverlayAlpha(2))}, ${alpha(
      '#fff',
      getOverlayAlpha(2),
    )})`,
  }),
  ...(ownerState.side === GridPinnedPosition.left && { left: 0 }),
  ...(ownerState.side === GridPinnedPosition.right && { right: 0 }),
}));

interface DataGridProColumnHeadersProps extends React.HTMLAttributes<HTMLDivElement> {
  innerRef?: React.Ref<HTMLDivElement>;
}

export const DataGridProColumnHeaders = React.forwardRef<
  HTMLDivElement,
  DataGridProColumnHeadersProps
>(function DataGridProColumnHeaders(props, ref) {
  const { style, className, innerRef, ...other } = props;
  const rootProps = useGridRootProps();
  const apiRef = useGridApiContext();
  const visibleColumnFields = useGridSelector(apiRef, gridVisibleColumnFieldsSelector);
  const [scrollbarSize, setScrollbarSize] = React.useState(0);

  const handleContentSizeChange = useEventCallback(() => {
    const rootDimensions = apiRef.current.getRootDimensions();
    if (!rootDimensions) {
      return;
    }

    const newScrollbarSize = rootDimensions.hasScrollY ? rootDimensions.scrollBarSize : 0;
    if (scrollbarSize !== newScrollbarSize) {
      setScrollbarSize(newScrollbarSize);
    }
  });

  useGridApiEventHandler(apiRef, 'virtualScrollerContentSizeChange', handleContentSizeChange);

  const pinnedColumns = useGridSelector(apiRef, gridPinnedColumnsSelector);
  const [leftPinnedColumns, rightPinnedColumns] = filterColumns(pinnedColumns, visibleColumnFields);

  const { isDragging, renderContext, getRootProps, getInnerProps, getColumns } =
    useGridColumnHeaders({
      innerRef,
      minColumnIndex: leftPinnedColumns.length,
    });

  const ownerState = { leftPinnedColumns, rightPinnedColumns, classes: rootProps.classes };
  const classes = useUtilityClasses(ownerState);

  const leftRenderContext =
    renderContext && leftPinnedColumns.length
      ? {
          ...renderContext,
          firstColumnIndex: 0,
          lastColumnIndex: leftPinnedColumns.length,
        }
      : null;

  const rightRenderContext =
    renderContext && rightPinnedColumns.length
      ? {
          ...renderContext,
          firstColumnIndex: visibleColumnFields.length - rightPinnedColumns.length,
          lastColumnIndex: visibleColumnFields.length,
        }
      : null;

  return (
    <GridColumnHeaders ref={ref} className={className} {...getRootProps(other)}>
      {leftRenderContext && (
        <GridColumnHeadersPinnedColumnHeaders
          className={classes.leftPinnedColumns}
          ownerState={{ side: GridPinnedPosition.left }}
        >
          {getColumns(
            {
              renderContext: leftRenderContext,
              minFirstColumn: leftRenderContext.firstColumnIndex,
              maxLastColumn: leftRenderContext.lastColumnIndex,
            },
            { disableReorder: true },
          )}
        </GridColumnHeadersPinnedColumnHeaders>
      )}
      <GridColumnHeadersInner isDragging={isDragging} {...getInnerProps()}>
        {getColumns({
          renderContext,
          minFirstColumn: leftPinnedColumns.length,
          maxLastColumn: visibleColumnFields.length - rightPinnedColumns.length,
        })}
      </GridColumnHeadersInner>
      {rightRenderContext && (
        <GridColumnHeadersPinnedColumnHeaders
          ownerState={{ side: GridPinnedPosition.right }}
          className={classes.rightPinnedColumns}
          style={{ paddingRight: scrollbarSize }}
        >
          {getColumns(
            {
              renderContext: rightRenderContext,
              minFirstColumn: rightRenderContext.firstColumnIndex,
              maxLastColumn: rightRenderContext.lastColumnIndex,
            },
            { disableReorder: true, separatorSide: GridColumnHeaderSeparatorSides.Left },
          )}
        </GridColumnHeadersPinnedColumnHeaders>
      )}
    </GridColumnHeaders>
  );
});
