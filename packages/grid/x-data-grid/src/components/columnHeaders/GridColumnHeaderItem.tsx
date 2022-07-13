import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { unstable_composeClasses as composeClasses } from '@mui/material';
import { unstable_useId as useId } from '@mui/material/utils';
import { GridColumnHeaderEventLookup } from '../../models/events';
import { GridStateColDef } from '../../models/colDef/gridColDef';
import { GridSortDirection } from '../../models/gridSortModel';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { GridColumnHeaderSortIcon } from './GridColumnHeaderSortIcon';
import { GridColumnHeaderTitle } from './GridColumnHeaderTitle';
import {
  GridColumnHeaderSeparator,
  GridColumnHeaderSeparatorProps,
} from './GridColumnHeaderSeparator';
import { ColumnHeaderMenuIcon } from './ColumnHeaderMenuIcon';
import { GridColumnHeaderMenu } from '../menu/columnMenu/GridColumnHeaderMenu';
import { getDataGridUtilityClass } from '../../constants/gridClasses';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';

interface GridColumnHeaderItemProps {
  colIndex: number;
  column: GridStateColDef;
  columnMenuOpen: boolean;
  headerHeight: number;
  isDragging: boolean;
  isResizing: boolean;
  isLastColumn: boolean;
  extendRowFullWidth: boolean;
  sortDirection: GridSortDirection;
  sortIndex?: number;
  filterItemsCounter?: number;
  hasFocus?: boolean;
  tabIndex: 0 | -1;
  disableReorder?: boolean;
  separatorSide?: GridColumnHeaderSeparatorProps['side'];
}

type OwnerState = GridColumnHeaderItemProps & {
  showRightBorder: boolean;
  classes?: DataGridProcessedProps['classes'];
};

const useUtilityClasses = (ownerState: OwnerState) => {
  const { column, classes, isDragging, sortDirection, showRightBorder, filterItemsCounter } =
    ownerState;

  const isColumnSorted = sortDirection != null;
  const isColumnFiltered = filterItemsCounter != null && filterItemsCounter > 0;
  // todo refactor to a prop on col isNumeric or ?? ie: coltype===price wont work
  const isColumnNumeric = column.type === 'number';

  const slots = {
    root: [
      'columnHeader',
      column.headerAlign === 'left' && 'columnHeader--alignLeft',
      column.headerAlign === 'center' && 'columnHeader--alignCenter',
      column.headerAlign === 'right' && 'columnHeader--alignRight',
      column.sortable && 'columnHeader--sortable',
      isDragging && 'columnHeader--moving',
      isColumnSorted && 'columnHeader--sorted',
      isColumnFiltered && 'columnHeader--filtered',
      isColumnNumeric && 'columnHeader--numeric',
      showRightBorder && 'withBorder',
    ],
    draggableContainer: ['columnHeaderDraggableContainer'],
    titleContainer: ['columnHeaderTitleContainer'],
    titleContainerContent: ['columnHeaderTitleContainerContent'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

function GridColumnHeaderItem(props: GridColumnHeaderItemProps) {
  const {
    column,
    columnMenuOpen,
    colIndex,
    headerHeight,
    isResizing,
    isLastColumn,
    sortDirection,
    sortIndex,
    filterItemsCounter,
    hasFocus,
    tabIndex,
    extendRowFullWidth,
    disableReorder,
    separatorSide,
  } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const headerCellRef = React.useRef<HTMLDivElement>(null);
  const columnMenuId = useId();
  const columnMenuButtonId = useId();
  const iconButtonRef = React.useRef<HTMLButtonElement>(null);
  const [showColumnMenuIcon, setShowColumnMenuIcon] = React.useState(columnMenuOpen);
  const { hasScrollX, hasScrollY } = apiRef.current.getRootDimensions() ?? {
    hasScrollX: false,
    hasScrollY: false,
  };

  const isDraggable = React.useMemo(
    () => !rootProps.disableColumnReorder && !disableReorder && !column.disableReorder,
    [rootProps.disableColumnReorder, disableReorder, column.disableReorder],
  );

  let headerComponent: React.ReactNode = null;
  if (column.renderHeader) {
    headerComponent = column.renderHeader(apiRef.current.getColumnHeaderParams(column.field));
  }

  const publish = React.useCallback(
    (eventName: keyof GridColumnHeaderEventLookup) => (event: React.SyntheticEvent) => {
      // Ignore portal
      // See https://github.com/mui/mui-x/issues/1721
      if (!event.currentTarget.contains(event.target as Element)) {
        return;
      }
      apiRef.current.publishEvent(
        eventName,
        apiRef.current.getColumnHeaderParams(column.field),
        event as any,
      );
    },
    [apiRef, column.field],
  );

  const mouseEventsHandlers = {
    onClick: publish('columnHeaderClick'),
    onDoubleClick: publish('columnHeaderDoubleClick'),
    onMouseOver: publish('columnHeaderOver'), // TODO remove as it's not used
    onMouseOut: publish('columnHeaderOut'), // TODO remove as it's not used
    onMouseEnter: publish('columnHeaderEnter'), // TODO remove as it's not used
    onMouseLeave: publish('columnHeaderLeave'), // TODO remove as it's not used
    onKeyDown: publish('columnHeaderKeyDown'),
    onFocus: publish('columnHeaderFocus'),
    onBlur: publish('columnHeaderBlur'),
  };

  const draggableEventHandlers = isDraggable
    ? {
        onDragStart: publish('columnHeaderDragStart'),
        onDragEnter: publish('columnHeaderDragEnter'),
        onDragOver: publish('columnHeaderDragOver'),
        onDragEnd: publish('columnHeaderDragEnd'),
      }
    : null;

  const removeLastBorderRight = isLastColumn && hasScrollX && !hasScrollY;
  const showRightBorder = !isLastColumn
    ? rootProps.showColumnRightBorder
    : !removeLastBorderRight && !extendRowFullWidth;

  const ownerState = {
    ...props,
    classes: rootProps.classes,
    showRightBorder,
  };

  const classes = useUtilityClasses(ownerState);

  const width = column.computedWidth;

  let ariaSort: 'ascending' | 'descending' | 'none' = 'none';
  if (sortDirection != null) {
    ariaSort = sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  React.useEffect(() => {
    if (!showColumnMenuIcon) {
      setShowColumnMenuIcon(columnMenuOpen);
    }
  }, [showColumnMenuIcon, columnMenuOpen]);

  const handleExited = React.useCallback(() => {
    setShowColumnMenuIcon(false);
  }, []);

  const columnMenuIconButton = !rootProps.disableColumnMenu && !column.disableColumnMenu && (
    <ColumnHeaderMenuIcon
      column={column}
      columnMenuId={columnMenuId!}
      columnMenuButtonId={columnMenuButtonId!}
      open={showColumnMenuIcon}
      iconButtonRef={iconButtonRef}
    />
  );

  const sortingOrder: GridSortDirection[] = column.sortingOrder ?? rootProps.sortingOrder;

  const columnTitleIconButtons = (
    <React.Fragment>
      {!rootProps.disableColumnFilter && (
        <rootProps.components.ColumnHeaderFilterIconButton
          field={column.field}
          counter={filterItemsCounter}
          {...rootProps.componentsProps?.columnHeaderFilterIconButton}
        />
      )}

      {column.sortable && !column.hideSortIcons && (
        <GridColumnHeaderSortIcon
          direction={sortDirection}
          index={sortIndex}
          sortingOrder={sortingOrder}
        />
      )}
    </React.Fragment>
  );

  React.useLayoutEffect(() => {
    const columnMenuState = apiRef.current.state.columnMenu;
    if (hasFocus && !columnMenuState.open) {
      const focusableElement = headerCellRef.current!.querySelector<HTMLElement>('[tabindex="0"]');
      const elementToFocus = focusableElement || headerCellRef.current;
      elementToFocus?.focus();
      apiRef.current.columnHeadersContainerElementRef!.current!.scrollLeft = 0;
    }
  }, [apiRef, hasFocus]);

  const headerClassName =
    typeof column.headerClassName === 'function'
      ? column.headerClassName({ field: column.field, colDef: column })
      : column.headerClassName;

  const label = column.headerName ?? column.field;

  return (
    <div
      ref={headerCellRef}
      className={clsx(classes.root, headerClassName)}
      data-field={column.field}
      style={{
        width,
        minWidth: width,
        maxWidth: width,
      }}
      role="columnheader"
      tabIndex={tabIndex}
      aria-colindex={colIndex + 1}
      aria-sort={ariaSort}
      aria-label={column.renderHeader && headerComponent == null ? label : undefined}
      {...mouseEventsHandlers}
    >
      <div
        className={classes.draggableContainer}
        draggable={isDraggable}
        {...draggableEventHandlers}
      >
        <div className={classes.titleContainer}>
          <div className={classes.titleContainerContent}>
            {column.renderHeader ? (
              headerComponent
            ) : (
              <GridColumnHeaderTitle
                label={label}
                description={column.description}
                columnWidth={width}
              />
            )}
          </div>
          {columnTitleIconButtons}
        </div>
        {columnMenuIconButton}
      </div>
      <GridColumnHeaderSeparator
        resizable={!rootProps.disableColumnResize && !!column.resizable}
        resizing={isResizing}
        height={headerHeight}
        onMouseDown={publish('columnSeparatorMouseDown')}
        side={separatorSide}
      />
      <GridColumnHeaderMenu
        columnMenuId={columnMenuId!}
        columnMenuButtonId={columnMenuButtonId!}
        field={column.field}
        open={columnMenuOpen}
        target={iconButtonRef.current}
        ContentComponent={rootProps.components.ColumnMenu}
        contentComponentProps={rootProps.componentsProps?.columnMenu}
        onExited={handleExited}
      />
    </div>
  );
}

GridColumnHeaderItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  colIndex: PropTypes.number.isRequired,
  column: PropTypes.object.isRequired,
  columnMenuOpen: PropTypes.bool.isRequired,
  disableReorder: PropTypes.bool,
  extendRowFullWidth: PropTypes.bool.isRequired,
  filterItemsCounter: PropTypes.number,
  hasFocus: PropTypes.bool,
  headerHeight: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  isLastColumn: PropTypes.bool.isRequired,
  isResizing: PropTypes.bool.isRequired,
  separatorSide: PropTypes.oneOf(['left', 'right']),
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  sortIndex: PropTypes.number,
  tabIndex: PropTypes.oneOf([-1, 0]).isRequired,
} as any;

export { GridColumnHeaderItem };
