import * as React from 'react';
import clsx from 'clsx';
import { unstable_composeClasses as composeClasses } from '@mui/material';
import { styled, SxProps, Theme } from '@mui/material/styles';
import { gridClasses, getDataGridUtilityClass } from '../../constants/gridClasses';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';

type OwnerState = {
  classes?: DataGridProcessedProps['classes'];
  isDragging: boolean;
  hasScrollX: boolean;
};

const useUtilityClasses = (ownerState: OwnerState) => {
  const { isDragging, hasScrollX, classes } = ownerState;

  const slots = {
    root: [
      'columnHeadersInner',
      isDragging && 'columnHeaderDropZone',
      hasScrollX && 'columnHeadersInner--scrollable',
    ],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

const GridColumnHeadersInnerRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'columnHeadersInner',
  overridesResolver: (props, styles) => [
    { [`&.${gridClasses.columnHeaderDropZone}`]: styles.columnHeaderDropZone },
    styles.columnHeadersInner,
  ],
})(() => ({
  display: 'flex',
  alignItems: 'center',
  [`&.${gridClasses.columnHeaderDropZone} .${gridClasses.columnHeaderDraggableContainer}`]: {
    cursor: 'move',
  },
  [`&.${gridClasses['columnHeadersInner--scrollable']} .${gridClasses.columnHeader}:last-child`]: {
    borderRight: 'none',
  },
}));

interface GridColumnHeadersInnerProps extends React.HTMLAttributes<HTMLDivElement> {
  isDragging: boolean;
  sx?: SxProps<Theme>;
}

export const GridColumnHeadersInner = React.forwardRef<HTMLDivElement, GridColumnHeadersInnerProps>(
  function GridColumnHeadersInner(props, ref) {
    const { isDragging, className, ...other } = props;
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();

    const ownerState = {
      isDragging,
      hasScrollX: apiRef.current.getRootDimensions()?.hasScrollX ?? false,
      classes: rootProps.classes,
    };
    const classes = useUtilityClasses(ownerState);

    return (
      <GridColumnHeadersInnerRoot ref={ref} className={clsx(className, classes.root)} {...other} />
    );
  },
);
