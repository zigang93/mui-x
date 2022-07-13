import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import ClickAwayListener, { ClickAwayListenerProps } from '@mui/material/ClickAwayListener';
import { unstable_composeClasses as composeClasses } from '@mui/material';
import Grow, { GrowProps } from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper, { PopperProps } from '@mui/material/Popper';
import { styled } from '@mui/material/styles';
import { HTMLElementType } from '@mui/utils';
import { getDataGridUtilityClass, gridClasses } from '../../constants/gridClasses';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';

type MenuPosition =
  | 'bottom-end'
  | 'bottom-start'
  | 'bottom'
  | 'left-end'
  | 'left-start'
  | 'left'
  | 'right-end'
  | 'right-start'
  | 'right'
  | 'top-end'
  | 'top-start'
  | 'top'
  | undefined;

type OwnerState = { classes: DataGridProcessedProps['classes'] };

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['menu'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

const GridMenuRoot = styled(Popper, {
  name: 'MuiDataGrid',
  slot: 'Menu',
  overridesResolver: (props, styles) => styles.menu,
})(({ theme }) => ({
  zIndex: theme.zIndex.modal,
  [`& .${gridClasses.menuList}`]: {
    outline: 0,
  },
}));

export interface GridMenuProps extends Omit<PopperProps, 'onKeyDown'> {
  open: boolean;
  target: React.ReactNode;
  onClickAway: ClickAwayListenerProps['onClickAway'];
  position?: MenuPosition;
  onExited?: GrowProps['onExited'];
}

const transformOrigin = {
  'bottom-start': 'top left',
  'bottom-end': 'top right',
};

const GridMenu = (props: GridMenuProps) => {
  const { open, target, onClickAway, children, position, className, onExited, ...other } = props;
  const apiRef = useGridApiContext();
  const prevTarget = React.useRef(target);
  const prevOpen = React.useRef(open);
  const rootProps = useGridRootProps();
  const ownerState = { classes: rootProps.classes };
  const classes = useUtilityClasses(ownerState);

  React.useEffect(() => {
    if (prevOpen.current && prevTarget.current) {
      (prevTarget.current as HTMLElement).focus();
    }

    // Emit menuOpen or menuClose events
    const eventName = open ? 'menuOpen' : 'menuClose';
    apiRef.current.publishEvent(eventName, { target });

    prevOpen.current = open;
    prevTarget.current = target;
  }, [apiRef, open, target]);

  const handleExited = (popperOnExited: (() => {}) | undefined) => (node: HTMLElement) => {
    if (popperOnExited) {
      popperOnExited();
    }

    if (onExited) {
      onExited(node);
    }
  };

  return (
    <GridMenuRoot
      as={rootProps.components.BasePopper}
      className={clsx(className, classes.root)}
      open={open}
      anchorEl={target as any}
      transition
      placement={position}
      {...other}
      {...rootProps.componentsProps?.basePopper}
    >
      {({ TransitionProps, placement }) => (
        <ClickAwayListener onClickAway={onClickAway} mouseEvent="onMouseDown">
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: transformOrigin[placement as keyof typeof transformOrigin] }}
            onExited={handleExited(TransitionProps?.onExited)}
          >
            <Paper>{children}</Paper>
          </Grow>
        </ClickAwayListener>
      )}
    </GridMenuRoot>
  );
};

GridMenu.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  onClickAway: PropTypes.func.isRequired,
  onExited: PropTypes.func,
  /**
   * If `true`, the component is shown.
   */
  open: PropTypes.bool.isRequired,
  position: PropTypes.oneOf([
    'bottom-end',
    'bottom-start',
    'bottom',
    'left-end',
    'left-start',
    'left',
    'right-end',
    'right-start',
    'right',
    'top-end',
    'top-start',
    'top',
  ]),
  target: HTMLElementType,
} as any;

export { GridMenu };
