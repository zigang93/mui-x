import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { unstable_composeClasses as composeClasses } from '@mui/material';
import { styled, SxProps, Theme } from '@mui/material/styles';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { getDataGridUtilityClass } from '../constants/gridClasses';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { DataGridProcessedProps } from '../models/props/DataGridProps';

interface SelectedRowCountProps {
  selectedRowCount: number;
}

type GridSelectedRowCountProps = React.HTMLAttributes<HTMLDivElement> &
  SelectedRowCountProps & {
    sx?: SxProps<Theme>;
  };

type OwnerState = { classes: DataGridProcessedProps['classes'] };

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['selectedRowCount'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

const GridSelectedRowCountRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'SelectedRowCount',
  overridesResolver: (props, styles) => styles.selectedRowCount,
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  margin: theme.spacing(0, 2),
  visibility: 'hidden',
  width: 0,
  height: 0,
  [theme.breakpoints.up('sm')]: {
    visibility: 'visible',
    width: 'auto',
    height: 'auto',
  },
}));

const GridSelectedRowCount = React.forwardRef<HTMLDivElement, GridSelectedRowCountProps>(
  function GridSelectedRowCount(props, ref) {
    const { className, selectedRowCount, ...other } = props;
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
    const ownerState = { classes: rootProps.classes };
    const classes = useUtilityClasses(ownerState);
    const rowSelectedText = apiRef.current.getLocaleText('footerRowSelected')(selectedRowCount);

    return (
      <GridSelectedRowCountRoot ref={ref} className={clsx(classes.root, className)} {...other}>
        {rowSelectedText}
      </GridSelectedRowCountRoot>
    );
  },
);

GridSelectedRowCount.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  selectedRowCount: PropTypes.number.isRequired,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;

export { GridSelectedRowCount };
