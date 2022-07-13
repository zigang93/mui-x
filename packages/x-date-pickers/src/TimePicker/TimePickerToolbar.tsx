import * as React from 'react';
import { useTheme, styled, Theme } from '@mui/material/styles';
import { unstable_composeClasses as composeClasses } from '@mui/material';
import { PickersToolbarText } from '../internals/components/PickersToolbarText';
import { PickersToolbarButton } from '../internals/components/PickersToolbarButton';
import { PickersToolbar, pickersToolbarClasses } from '../internals/components/PickersToolbar';
import { arrayIncludes } from '../internals/utils/utils';
import { useUtils } from '../internals/hooks/useUtils';
import { useMeridiemMode } from '../internals/hooks/date-helpers-hooks';
import { BaseToolbarProps } from '../internals/models/props/baseToolbarProps';
import {
  getTimePickerToolbarUtilityClass,
  timePickerToolbarClasses,
  TimePickerToolbarClasses,
} from './timePickerToolbarClasses';

export interface TimePickerToolbarProps<TDate> extends BaseToolbarProps<TDate, TDate | null> {
  classes?: Partial<TimePickerToolbarClasses>;
}

const useUtilityClasses = (ownerState: TimePickerToolbarProps<any> & { theme: Theme }) => {
  const { theme, isLandscape, classes } = ownerState;

  const slots = {
    root: ['root'],
    separator: ['separator'],
    hourMinuteLabel: [
      'hourMinuteLabel',
      isLandscape && 'hourMinuteLabelLandscape',
      theme.direction === 'rtl' && 'hourMinuteLabelReverse',
    ],
    ampmSelection: ['ampmSelection', isLandscape && 'ampmLandscape'],
    ampmLabel: ['ampmLabel'],
  };

  return composeClasses(slots, getTimePickerToolbarUtilityClass, classes);
};

const TimePickerToolbarRoot = styled(PickersToolbar, {
  name: 'MuiTimePickerToolbar',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})<{
  ownerState: TimePickerToolbarProps<any>;
}>({
  [`& .${pickersToolbarClasses.penIconButtonLandscape}`]: {
    marginTop: 'auto',
  },
});

const TimePickerToolbarSeparator = styled(PickersToolbarText, {
  name: 'MuiTimePickerToolbar',
  slot: 'Separator',
  overridesResolver: (props, styles) => styles.separator,
})({
  outline: 0,
  margin: '0 4px 0 2px',
  cursor: 'default',
});

const TimePickerToolbarHourMinuteLabel = styled('div', {
  name: 'MuiTimePickerToolbar',
  slot: 'HourMinuteLabel',
  overridesResolver: (props, styles) => styles.hourMinuteLabel,
})<{
  ownerState: TimePickerToolbarProps<any>;
}>(({ theme, ownerState }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  ...(ownerState.isLandscape && {
    marginTop: 'auto',
  }),
  ...(theme.direction === 'rtl' && {
    flexDirection: 'row-reverse',
  }),
}));

const TimePickerToolbarAmPmSelection = styled('div', {
  name: 'MuiTimePickerToolbar',
  slot: 'AmPmSelection',
  overridesResolver: (props, styles) => styles.ampmSelection,
})<{
  ownerState: TimePickerToolbarProps<any>;
}>(({ ownerState }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginRight: 'auto',
  marginLeft: 12,
  ...(ownerState.isLandscape && {
    margin: '4px 0 auto',
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexBasis: '100%',
  }),
  [`& .${timePickerToolbarClasses.ampmLabel}`]: {
    fontSize: 17,
  },
}));

/**
 * @ignore - internal component.
 */
export const TimePickerToolbar = <TDate extends unknown>(
  props: BaseToolbarProps<TDate, TDate | null>,
) => {
  const {
    ampm,
    ampmInClock,
    parsedValue,
    isLandscape,
    isMobileKeyboardViewOpen,
    onChange,
    openView,
    setOpenView,
    toggleMobileKeyboardView,
    toolbarTitle = 'Select time',
    views,
    disabled,
    readOnly,
    ...other
  } = props;
  const utils = useUtils<TDate>();
  const theme = useTheme();
  const showAmPmControl = Boolean(ampm && !ampmInClock);
  const { meridiemMode, handleMeridiemChange } = useMeridiemMode(parsedValue, ampm, onChange);

  const formatHours = (time: TDate) =>
    ampm ? utils.format(time, 'hours12h') : utils.format(time, 'hours24h');

  const ownerState = props;
  const classes = useUtilityClasses({ ...ownerState, theme });

  const separator = (
    <TimePickerToolbarSeparator
      tabIndex={-1}
      value=":"
      variant="h3"
      selected={false}
      className={classes.separator}
    />
  );

  return (
    <TimePickerToolbarRoot
      viewType="clock"
      landscapeDirection="row"
      toolbarTitle={toolbarTitle}
      isLandscape={isLandscape}
      isMobileKeyboardViewOpen={isMobileKeyboardViewOpen}
      toggleMobileKeyboardView={toggleMobileKeyboardView}
      ownerState={ownerState}
      className={classes.root}
      {...other}
    >
      <TimePickerToolbarHourMinuteLabel className={classes.hourMinuteLabel} ownerState={ownerState}>
        {arrayIncludes(views, 'hours') && (
          <PickersToolbarButton
            data-mui-test="hours"
            tabIndex={-1}
            variant="h3"
            onClick={() => setOpenView('hours')}
            selected={openView === 'hours'}
            value={parsedValue ? formatHours(parsedValue) : '--'}
          />
        )}
        {arrayIncludes(views, ['hours', 'minutes']) && separator}
        {arrayIncludes(views, 'minutes') && (
          <PickersToolbarButton
            data-mui-test="minutes"
            tabIndex={-1}
            variant="h3"
            onClick={() => setOpenView('minutes')}
            selected={openView === 'minutes'}
            value={parsedValue ? utils.format(parsedValue, 'minutes') : '--'}
          />
        )}
        {arrayIncludes(views, ['minutes', 'seconds']) && separator}
        {arrayIncludes(views, 'seconds') && (
          <PickersToolbarButton
            data-mui-test="seconds"
            variant="h3"
            onClick={() => setOpenView('seconds')}
            selected={openView === 'seconds'}
            value={parsedValue ? utils.format(parsedValue, 'seconds') : '--'}
          />
        )}
      </TimePickerToolbarHourMinuteLabel>
      {showAmPmControl && (
        <TimePickerToolbarAmPmSelection className={classes.ampmSelection} ownerState={ownerState}>
          <PickersToolbarButton
            disableRipple
            variant="subtitle2"
            data-mui-test="toolbar-am-btn"
            selected={meridiemMode === 'am'}
            typographyClassName={classes.ampmLabel}
            value={utils.getMeridiemText('am')}
            onClick={readOnly ? undefined : () => handleMeridiemChange('am')}
            disabled={disabled}
          />
          <PickersToolbarButton
            disableRipple
            variant="subtitle2"
            data-mui-test="toolbar-pm-btn"
            selected={meridiemMode === 'pm'}
            typographyClassName={classes.ampmLabel}
            value={utils.getMeridiemText('pm')}
            onClick={readOnly ? undefined : () => handleMeridiemChange('pm')}
            disabled={disabled}
          />
        </TimePickerToolbarAmPmSelection>
      )}
    </TimePickerToolbarRoot>
  );
};
