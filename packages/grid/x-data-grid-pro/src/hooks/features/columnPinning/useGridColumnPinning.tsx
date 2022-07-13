import * as React from 'react';
import MuiDivider from '@mui/material/Divider';
import {
  useGridSelector,
  gridVisibleColumnDefinitionsSelector,
  gridColumnsTotalWidthSelector,
  gridColumnPositionsSelector,
  gridVisibleColumnFieldsSelector,
  gridClasses,
  useGridApiMethod,
  useGridApiEventHandler,
  GridEventListener,
  gridColumnFieldsSelector,
} from '@mui/x-data-grid';
import {
  useGridRegisterPipeProcessor,
  GridPipeProcessor,
  GridRestoreStatePreProcessingContext,
  GridStateInitializer,
} from '@mui/x-data-grid/internals';
import { GridApiPro } from '../../../models/gridApiPro';
import { GridInitialStatePro, GridStatePro } from '../../../models/gridStatePro';
import { DataGridProProcessedProps } from '../../../models/dataGridProProps';
import { GridColumnPinningMenuItems } from '../../../components/GridColumnPinningMenuItems';
import {
  GridColumnPinningApi,
  GridPinnedPosition,
  GridPinnedColumns,
} from './gridColumnPinningInterface';
import { gridPinnedColumnsSelector } from './gridColumnPinningSelector';
import { filterColumns } from '../../../components/DataGridProVirtualScroller';

const Divider = () => <MuiDivider onClick={(event) => event.stopPropagation()} />;

export const columnPinningStateInitializer: GridStateInitializer<
  Pick<DataGridProProcessedProps, 'pinnedColumns' | 'initialState' | 'disableColumnPinning'>
> = (state, props, apiRef) => {
  apiRef.current.unstable_caches.columnPinning = {
    orderedFieldsBeforePinningColumns: null,
  };

  let model: GridPinnedColumns;
  if (props.disableColumnPinning) {
    model = {};
  } else if (props.pinnedColumns) {
    model = props.pinnedColumns;
  } else if (props.initialState?.pinnedColumns) {
    model = props.initialState?.pinnedColumns;
  } else {
    model = {};
  }

  return {
    ...state,
    pinnedColumns: model,
  };
};

const mergeStateWithPinnedColumns =
  (pinnedColumns: GridPinnedColumns) =>
  (state: GridStatePro): GridStatePro => ({ ...state, pinnedColumns });

export const useGridColumnPinning = (
  apiRef: React.MutableRefObject<GridApiPro>,
  props: Pick<
    DataGridProProcessedProps,
    'disableColumnPinning' | 'pinnedColumns' | 'onPinnedColumnsChange'
  >,
): void => {
  const pinnedColumns = useGridSelector(apiRef, gridPinnedColumnsSelector);

  // Each visible row (not to be confused with a filter result) is composed of a central .MuiDataGrid-row element
  // and up to two additional .MuiDataGrid-row's, one for the columns pinned to the left and another
  // for those on the right side. When hovering any of these elements, the :hover styles are applied only to
  // the row element that was actually hovered, not its additional siblings. To make it look like a contiguous row,
  // this method adds/removes the .Mui-hovered class to all of the row elements inside one visible row.
  const updateHoveredClassOnSiblingRows = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (props.disableColumnPinning) {
        return;
      }

      if (!Array.isArray(pinnedColumns.left) && !Array.isArray(pinnedColumns.right)) {
        return;
      }

      const nbLeftPinnedColumns = pinnedColumns.left?.length ?? 0;
      const nbRightPinnedColumns = pinnedColumns.right?.length ?? 0;
      if (nbLeftPinnedColumns + nbRightPinnedColumns === 0) {
        return;
      }

      const index = event.currentTarget.dataset.rowindex;
      const rowElements = apiRef.current.windowRef!.current!.querySelectorAll(
        `.${gridClasses.row}[data-rowindex="${index}"]`,
      );
      rowElements.forEach((row) => {
        // Ignore rows from other grid inside the hovered row
        if (row.closest(`.${gridClasses.virtualScroller}`) === apiRef.current.windowRef!.current!) {
          if (event.type === 'mouseenter') {
            row.classList.add('Mui-hovered');
          } else {
            row.classList.remove('Mui-hovered');
          }
        }
      });
    },
    [apiRef, pinnedColumns.left, pinnedColumns.right, props.disableColumnPinning],
  );

  const handleMouseEnter = React.useCallback<GridEventListener<'rowMouseEnter'>>(
    (params, event) => {
      updateHoveredClassOnSiblingRows(event);
    },
    [updateHoveredClassOnSiblingRows],
  );

  const handleMouseLeave = React.useCallback<GridEventListener<'rowMouseLeave'>>(
    (params, event) => {
      updateHoveredClassOnSiblingRows(event);
    },
    [updateHoveredClassOnSiblingRows],
  );

  useGridApiEventHandler(apiRef, 'rowMouseEnter', handleMouseEnter);
  useGridApiEventHandler(apiRef, 'rowMouseLeave', handleMouseLeave);

  /**
   * PRE-PROCESSING
   */
  const calculateScrollLeft = React.useCallback<GridPipeProcessor<'scrollToIndexes'>>(
    (initialValue, params) => {
      if (props.disableColumnPinning) {
        return initialValue;
      }

      const visibleColumnFields = gridVisibleColumnFieldsSelector(apiRef);
      const [leftPinnedColumns, rightPinnedColumns] = filterColumns(
        pinnedColumns,
        visibleColumnFields,
      );

      if (!params.colIndex || (leftPinnedColumns.length === 0 && rightPinnedColumns.length === 0)) {
        return initialValue;
      }

      const visibleColumns = gridVisibleColumnDefinitionsSelector(apiRef);
      const columnsTotalWidth = gridColumnsTotalWidthSelector(apiRef);
      const columnPositions = gridColumnPositionsSelector(apiRef);
      const clientWidth = apiRef.current.windowRef!.current!.clientWidth;
      const scrollLeft = apiRef.current.windowRef!.current!.scrollLeft;
      const offsetWidth = visibleColumns[params.colIndex].computedWidth;
      const offsetLeft = columnPositions[params.colIndex];

      const leftPinnedColumnsWidth = columnPositions[leftPinnedColumns.length];
      const rightPinnedColumnsWidth =
        columnsTotalWidth - columnPositions[columnPositions.length - rightPinnedColumns.length];

      const elementBottom = offsetLeft + offsetWidth;
      if (elementBottom - (clientWidth - rightPinnedColumnsWidth) > scrollLeft) {
        const left = elementBottom - (clientWidth - rightPinnedColumnsWidth);
        return { ...initialValue, left };
      }
      if (offsetLeft < scrollLeft + leftPinnedColumnsWidth) {
        const left = offsetLeft - leftPinnedColumnsWidth;
        return { ...initialValue, left };
      }
      return initialValue;
    },
    [apiRef, pinnedColumns, props.disableColumnPinning],
  );

  const addColumnMenuButtons = React.useCallback<GridPipeProcessor<'columnMenu'>>(
    (initialValue, column) => {
      if (props.disableColumnPinning) {
        return initialValue;
      }

      if (column.pinnable === false) {
        return initialValue;
      }

      return [...initialValue, <Divider />, <GridColumnPinningMenuItems />];
    },
    [props.disableColumnPinning],
  );

  const checkIfCanBeReordered = React.useCallback<GridPipeProcessor<'canBeReordered'>>(
    (initialValue, { targetIndex }) => {
      const visibleColumnFields = gridVisibleColumnFieldsSelector(apiRef);
      const [leftPinnedColumns, rightPinnedColumns] = filterColumns(
        pinnedColumns,
        visibleColumnFields,
      );

      if (leftPinnedColumns.length === 0 && rightPinnedColumns.length === 0) {
        return initialValue;
      }

      if (leftPinnedColumns.length > 0 && targetIndex < leftPinnedColumns.length) {
        return false;
      }

      if (rightPinnedColumns.length > 0) {
        const visibleColumns = gridVisibleColumnDefinitionsSelector(apiRef);
        const firstRightPinnedColumnIndex = visibleColumns.length - rightPinnedColumns.length;
        return targetIndex >= firstRightPinnedColumnIndex ? false : initialValue;
      }

      return initialValue;
    },
    [apiRef, pinnedColumns],
  );

  const stateExportPreProcessing = React.useCallback<GridPipeProcessor<'exportState'>>(
    (prevState) => {
      const pinnedColumnsToExport = gridPinnedColumnsSelector(apiRef.current.state);
      if (
        (!pinnedColumnsToExport.left || pinnedColumnsToExport.left.length === 0) &&
        (!pinnedColumnsToExport.right || pinnedColumnsToExport.right.length === 0)
      ) {
        return prevState;
      }

      return {
        ...prevState,
        pinnedColumns: pinnedColumnsToExport,
      };
    },
    [apiRef],
  );

  const stateRestorePreProcessing = React.useCallback<GridPipeProcessor<'restoreState'>>(
    (params, context: GridRestoreStatePreProcessingContext<GridInitialStatePro>) => {
      const newPinnedColumns = context.stateToRestore.pinnedColumns;
      if (newPinnedColumns != null) {
        apiRef.current.setState(mergeStateWithPinnedColumns(newPinnedColumns));
      }

      return params;
    },
    [apiRef],
  );

  useGridRegisterPipeProcessor(apiRef, 'scrollToIndexes', calculateScrollLeft);
  useGridRegisterPipeProcessor(apiRef, 'columnMenu', addColumnMenuButtons);
  useGridRegisterPipeProcessor(apiRef, 'canBeReordered', checkIfCanBeReordered);
  useGridRegisterPipeProcessor(apiRef, 'exportState', stateExportPreProcessing);
  useGridRegisterPipeProcessor(apiRef, 'restoreState', stateRestorePreProcessing);

  apiRef.current.unstable_registerControlState({
    stateId: 'pinnedColumns',
    propModel: props.pinnedColumns,
    propOnChange: props.onPinnedColumnsChange,
    stateSelector: gridPinnedColumnsSelector,
    changeEvent: 'pinnedColumnsChange',
  });

  const checkIfEnabled = React.useCallback(
    (methodName) => {
      if (props.disableColumnPinning) {
        throw new Error(
          `MUI: You cannot call \`apiRef.current.${methodName}\` when \`disableColumnPinning\` is true.`,
        );
      }
    },
    [props.disableColumnPinning],
  );

  const pinColumn = React.useCallback<GridColumnPinningApi['pinColumn']>(
    (field: string, side: GridPinnedPosition) => {
      checkIfEnabled('pinColumn');

      if (apiRef.current.isColumnPinned(field) === side) {
        return;
      }

      const otherSide =
        side === GridPinnedPosition.right ? GridPinnedPosition.left : GridPinnedPosition.right;

      const newPinnedColumns = {
        [side]: [...(pinnedColumns[side] || []), field],
        [otherSide]: (pinnedColumns[otherSide] || []).filter((column) => column !== field),
      };

      apiRef.current.setPinnedColumns(newPinnedColumns);
    },
    [apiRef, checkIfEnabled, pinnedColumns],
  );

  const unpinColumn = React.useCallback<GridColumnPinningApi['unpinColumn']>(
    (field: string) => {
      checkIfEnabled('unpinColumn');
      apiRef.current.setPinnedColumns({
        left: (pinnedColumns.left || []).filter((column) => column !== field),
        right: (pinnedColumns.right || []).filter((column) => column !== field),
      });
    },
    [apiRef, checkIfEnabled, pinnedColumns.left, pinnedColumns.right],
  );

  const getPinnedColumns = React.useCallback<GridColumnPinningApi['getPinnedColumns']>(() => {
    checkIfEnabled('getPinnedColumns');
    return gridPinnedColumnsSelector(apiRef.current.state);
  }, [apiRef, checkIfEnabled]);

  const setPinnedColumns = React.useCallback<GridColumnPinningApi['setPinnedColumns']>(
    (newPinnedColumns) => {
      checkIfEnabled('setPinnedColumns');
      apiRef.current.setState(mergeStateWithPinnedColumns(newPinnedColumns));
      apiRef.current.forceUpdate();
    },
    [apiRef, checkIfEnabled],
  );

  const isColumnPinned = React.useCallback<GridColumnPinningApi['isColumnPinned']>(
    (field) => {
      checkIfEnabled('isColumnPinned');
      const leftPinnedColumns = pinnedColumns.left || [];
      if (leftPinnedColumns.includes(field)) {
        return GridPinnedPosition.left;
      }
      const rightPinnedColumns = pinnedColumns.right || [];
      if (rightPinnedColumns.includes(field)) {
        return GridPinnedPosition.right;
      }
      return false;
    },
    [pinnedColumns.left, pinnedColumns.right, checkIfEnabled],
  );

  const columnPinningApi: GridColumnPinningApi = {
    pinColumn,
    unpinColumn,
    getPinnedColumns,
    setPinnedColumns,
    isColumnPinned,
  };
  useGridApiMethod(apiRef, columnPinningApi, 'columnPinningApi');

  const handleColumnOrderChange = React.useCallback<GridEventListener<'columnOrderChange'>>(
    (params) => {
      if (!apiRef.current.unstable_caches.columnPinning.orderedFieldsBeforePinningColumns) {
        return;
      }

      const { field, targetIndex, oldIndex } = params;
      const delta = targetIndex > oldIndex ? 1 : -1;

      const latestColumnFields = gridColumnFieldsSelector(apiRef);

      /**
       * When a column X is reordered to somewhere else, the position where this column X is dropped
       * on must be moved to left or right to make room for it. The ^^^ below represents the column
       * which gave space to receive X.
       *
       * | X | B | C | D | -> | B | C | D | X | (e.g. X moved to after D, so delta=1)
       *              ^^^              ^^^
       *
       * | A | B | C | X | -> | X | A | B | C | (e.g. X moved before A, so delta=-1)
       *  ^^^                      ^^^
       *
       * If column P is pinned, it will not move to provide space. However, it will jump to the next
       * non-pinned column.
       *
       * | X | B | P | D | -> | B | D | P | X | (e.g. X moved to after D, with P pinned)
       *              ^^^          ^^^
       */
      const siblingField = latestColumnFields[targetIndex - delta];

      const newOrderedFieldsBeforePinningColumns = [
        ...apiRef.current.unstable_caches.columnPinning.orderedFieldsBeforePinningColumns,
      ];

      // The index to start swapping fields
      let i = newOrderedFieldsBeforePinningColumns.findIndex((column) => column === field);
      // The index of the field to swap with
      let j = i + delta;

      // When to stop swapping fields.
      // We stop one field before because the swap is done with i + 1 (if delta=1)
      const stop = newOrderedFieldsBeforePinningColumns.findIndex(
        (column) => column === siblingField,
      );

      while (delta > 0 ? i < stop : i > stop) {
        // If the field to swap with is a pinned column, jump to the next
        while (apiRef.current.isColumnPinned(newOrderedFieldsBeforePinningColumns[j])) {
          j += delta;
        }

        const temp = newOrderedFieldsBeforePinningColumns[i];
        newOrderedFieldsBeforePinningColumns[i] = newOrderedFieldsBeforePinningColumns[j];
        newOrderedFieldsBeforePinningColumns[j] = temp;

        i = j;
        j = i + delta;
      }

      apiRef.current.unstable_caches.columnPinning.orderedFieldsBeforePinningColumns =
        newOrderedFieldsBeforePinningColumns;
    },

    [apiRef],
  );

  useGridApiEventHandler(apiRef, 'columnOrderChange', handleColumnOrderChange);

  React.useEffect(() => {
    if (props.pinnedColumns) {
      apiRef.current.setPinnedColumns(props.pinnedColumns);
    }
  }, [apiRef, props.pinnedColumns]);
};
