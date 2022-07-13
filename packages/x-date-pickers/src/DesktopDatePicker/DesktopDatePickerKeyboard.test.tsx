import * as React from 'react';
import { expect } from 'chai';
import { spy } from 'sinon';
import { isWeekend } from 'date-fns';
import TextField from '@mui/material/TextField';
import { fireEvent, screen } from '@mui/monorepo/test/utils';
import { DesktopDatePicker, DesktopDatePickerProps } from '@mui/x-date-pickers/DesktopDatePicker';
import { adapterToUse, createPickerRenderer } from '../../../../test/utils/pickers-utils';
import { MakeOptional } from '../internals/models/helpers';

function TestKeyboardDatePicker(
  PickerProps: MakeOptional<DesktopDatePickerProps<any, any>, 'value' | 'onChange' | 'renderInput'>,
) {
  const { onChange: propsOnChange, value: propsValue, ...other } = PickerProps;
  const [value, setValue] = React.useState<unknown>(
    propsValue ?? adapterToUse.date(new Date(2019, 0, 1)),
  );

  return (
    <DesktopDatePicker
      value={value}
      onChange={(newDate) => {
        propsOnChange?.(newDate);
        setValue(newDate);
      }}
      renderInput={(props) => <TextField placeholder="10/10/2018" {...props} />}
      {...other}
    />
  );
}

describe('<DesktopDatePicker /> keyboard interactions', () => {
  const { render } = createPickerRenderer({ clock: 'fake' });

  it('closes on Escape press', () => {
    const handleClose = spy();
    render(
      <DesktopDatePicker
        onChange={() => {}}
        renderInput={(params) => <TextField {...params} />}
        value={null}
        open
        onClose={handleClose}
      />,
    );

    // eslint-disable-next-line material-ui/disallow-active-element-as-key-event-target -- don't care
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });

    expect(handleClose.callCount).to.equal(1);
  });

  describe('input', () => {
    it('allows to change selected date from the input according to `format`', () => {
      const onChangeMock = spy();
      render(
        <TestKeyboardDatePicker
          onChange={onChangeMock}
          inputFormat={['moment', 'dayjs'].includes(adapterToUse.lib) ? 'DD/MM/YYYY' : 'dd/MM/yyyy'}
        />,
      );

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '10/11/2018' },
      });

      expect(screen.getByRole('textbox')).to.have.value('10/11/2018');
      expect(onChangeMock.callCount).to.equal(1);
    });

    it("doesn't accept invalid date format", () => {
      render(<TestKeyboardDatePicker />);

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '01' },
      });
      expect(screen.getByRole('textbox')).to.have.attr('aria-invalid', 'true');
    });

    it('removes invalid state when chars are cleared from invalid input', () => {
      render(<TestKeyboardDatePicker />);

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '01' },
      });
      expect(screen.getByRole('textbox')).to.have.attr('aria-invalid', 'true');
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '' },
      });
      expect(screen.getByRole('textbox')).to.have.attr('aria-invalid', 'false');
    });

    it('renders correct format helper text and placeholder', () => {
      render(
        <TestKeyboardDatePicker
          mask="____"
          inputFormat="yyyy"
          renderInput={(params) => (
            <TextField {...params} id="test" helperText={params?.inputProps?.placeholder} />
          )}
        />,
      );

      const helperText = document.getElementById('test-helper-text');
      expect(helperText).to.have.text('yyyy');

      expect(screen.getByRole('textbox')).to.have.attr('placeholder', 'yyyy');
    });

    it('correctly input dates according to the input mask', () => {
      render(<TestKeyboardDatePicker />);
      const input = screen.getByRole('textbox');

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '011' },
      });
      expect(input).to.have.value('01/1');

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '01102019' },
      });
      expect(input).to.have.value('01/10/2019');
    });

    it('prop `disableMaskedInput` – disables mask and allows to input anything to the field', () => {
      render(<TestKeyboardDatePicker disableMaskedInput />);

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'any text' },
      });

      const input = screen.getByRole('textbox');
      expect(input).to.have.value('any text');
      expect(input).to.have.attr('aria-invalid', 'true');
    });

    it('prop `disableMaskedInput` – correctly parses date string when mask is disabled', () => {
      const onChangeMock = spy();
      render(<TestKeyboardDatePicker onChange={onChangeMock} disableMaskedInput />);

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '01/10/2019' },
      });

      const input = screen.getByRole('textbox');
      expect(input).to.have.value('01/10/2019');
      expect(input).to.have.attribute('aria-invalid', 'false');
      expect(onChangeMock.callCount).to.equal(1);
    });
  });

  describe('input validation', () => {
    [
      { expectedError: 'invalidDate', props: { disableMaskedInput: true }, input: 'invalidText' },
      { expectedError: 'disablePast', props: { disablePast: true }, input: '01/01/1900' },
      { expectedError: 'disableFuture', props: { disableFuture: true }, input: '01/01/2050' },
      {
        expectedError: 'minDate',
        props: { minDate: adapterToUse.date(new Date(2000, 0, 1)) },
        input: '01/01/1990',
      },
      {
        expectedError: 'maxDate',
        props: { maxDate: adapterToUse.date(new Date(2000, 0, 1)) },
        input: '01/01/2010',
      },
      {
        expectedError: 'shouldDisableDate',
        props: { shouldDisableDate: isWeekend },
        input: '04/25/2020',
      },
    ].forEach(({ props, input, expectedError }) => {
      it(`dispatches ${expectedError} error`, () => {
        const onErrorMock = spy();
        // we are running validation on value change
        function DatePickerInput() {
          const [date, setDate] = React.useState<number | Date | null>(null);

          return (
            <DesktopDatePicker
              value={date}
              onError={onErrorMock}
              onChange={(newDate) => setDate(newDate)}
              renderInput={(inputProps) => <TextField {...inputProps} />}
              {...props}
            />
          );
        }

        render(<DatePickerInput />);

        fireEvent.change(screen.getByRole('textbox'), {
          target: {
            value: input,
          },
        });

        expect(onErrorMock.callCount).to.equal(1);
        expect(onErrorMock.args[0][0]).to.equal(expectedError);
      });
    });
  });

  it('Opens calendar by keydown on the open button', () => {
    render(<TestKeyboardDatePicker />);
    const openButton = screen.getByLabelText(/choose date/i);

    // A native button implies Enter and Space keydown behavior
    // These keydown events only trigger click behavior if they're trusted (programmatically dispatched events aren't trusted).
    // If this breaks, make sure to add tests for
    // - fireEvent.keyDown(targetDay, { key: 'Enter' })
    // - fireEvent.keyUp(targetDay, { key: 'Space' })
    expect(openButton.tagName).to.equal('BUTTON');

    fireEvent.click(openButton);

    expect(screen.queryByRole('dialog')).toBeVisible();
  });
});
