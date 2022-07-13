import * as React from 'react';
import { expect } from 'chai';
import deLocale from 'date-fns/locale/de';
import enLocale from 'date-fns/locale/en-US';
import TextField from '@mui/material/TextField';
import { DesktopDatePicker, DesktopDatePickerProps } from '@mui/x-date-pickers/DesktopDatePicker';
import { fireEvent, screen } from '@mui/monorepo/test/utils';
import { adapterToUse, createPickerRenderer } from '../../../../test/utils/pickers-utils';

describe('<DesktopDatePicker /> localization', () => {
  const tests = [
    {
      locale: 'en-US',
      valid: 'January 2020',
      invalid: 'Januar 2020',
      dateFnsLocale: enLocale,
    },
    {
      locale: 'de',
      valid: 'Januar 2020',
      invalid: 'Janua 2020',
      dateFnsLocale: deLocale,
    },
  ];

  tests.forEach(({ valid, invalid, locale, dateFnsLocale }) => {
    describe(`input validation ${locale}`, () => {
      const { render: localizedRender } = createPickerRenderer({ locale: dateFnsLocale });

      interface FormProps {
        Picker: React.ElementType<DesktopDatePickerProps<any, any>>;
        PickerProps: Partial<DesktopDatePickerProps<any, any>>;
      }

      const Form = (props: FormProps) => {
        const { Picker, PickerProps } = props;
        const [value, setValue] = React.useState<unknown>(adapterToUse.date('01/01/2020'));

        return (
          <Picker
            onChange={setValue}
            renderInput={(inputProps) => <TextField {...inputProps} />}
            value={value}
            {...PickerProps}
          />
        );
      };

      it(`should set invalid`, () => {
        localizedRender(
          <Form Picker={DesktopDatePicker} PickerProps={{ views: ['month', 'year'] }} />,
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: invalid } });

        expect(input).to.have.attribute('aria-invalid', 'true');
      });

      it(`should set to valid when was invalid`, () => {
        localizedRender(
          <Form Picker={DesktopDatePicker} PickerProps={{ views: ['month', 'year'] }} />,
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: invalid } });
        fireEvent.change(input, { target: { value: valid } });

        expect(input).to.have.attribute('aria-invalid', 'false');
      });
    });
  });
});
