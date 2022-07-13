import * as React from 'react';

export const isEscapeKey = (key: string): boolean => key === 'Escape'; // TODO remove
export const isEnterKey = (key: string): boolean => key === 'Enter'; // TODO remove
export const isTabKey = (key: string): boolean => key === 'Tab'; // TODO remove

export const isSpaceKey = (key: string): boolean => key === ' ';

export const isArrowKeys = (key: string): boolean => key.indexOf('Arrow') === 0;

export const isHomeOrEndKeys = (key: string): boolean => key === 'Home' || key === 'End';

export const isPageKeys = (key: string): boolean => key.indexOf('Page') === 0;
export const isDeleteKeys = (key: string) => key === 'Delete' || key === 'Backspace';

// Non printable keys have a name, e.g. "ArrowRight", see the whole list:
// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
export const isPrintableKey = (key: string) => key.length === 1;

export const GRID_MULTIPLE_SELECTION_KEYS = ['Meta', 'Control', 'Shift'];
export const GRID_CELL_EXIT_EDIT_MODE_KEYS = ['Enter', 'Escape', 'Tab'];
export const GRID_CELL_EDIT_COMMIT_KEYS = ['Enter', 'Tab'];

export const isMultipleKey = (key: string): boolean =>
  GRID_MULTIPLE_SELECTION_KEYS.indexOf(key) > -1;

export const isCellEnterEditModeKeys = (key: string): boolean =>
  isEnterKey(key) || isDeleteKeys(key) || isPrintableKey(key);

export const isCellExitEditModeKeys = (key: string): boolean =>
  GRID_CELL_EXIT_EDIT_MODE_KEYS.indexOf(key) > -1;

export const isCellEditCommitKeys = (key: string): boolean =>
  GRID_CELL_EDIT_COMMIT_KEYS.indexOf(key) > -1;

export const isNavigationKey = (key: string) =>
  isHomeOrEndKeys(key) || isArrowKeys(key) || isPageKeys(key) || isSpaceKey(key);

export const isKeyboardEvent = (event: any): event is React.KeyboardEvent<HTMLElement> =>
  !!event.key;

export const isHideMenuKey = (key: React.KeyboardEvent['key']) => isTabKey(key) || isEscapeKey(key);
