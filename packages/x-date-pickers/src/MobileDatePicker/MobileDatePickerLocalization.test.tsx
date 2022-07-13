import * as React from 'react';
import { expect } from 'chai';
import fr from 'date-fns/locale/fr';
import TextField from '@mui/material/TextField';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { fireEvent, screen } from '@mui/monorepo/test/utils';
import { adapterToUse, createPickerRenderer } from '../../../../test/utils/pickers-utils';

describe('<MobileDatePicker /> localization', () => {
  const { render } = createPickerRenderer({ locale: fr });

  it('format for year view', () => {
    render(
      <MobileDatePicker
        renderInput={(params) => <TextField {...params} />}
        value={adapterToUse.date(new Date(2018, 0, 1))}
        onChange={() => {}}
        views={['year']}
      />,
    );

    expect(screen.getByRole('textbox')).to.have.value('2018');

    fireEvent.click(screen.getByLabelText(/Choose date/));
    expect(screen.getByMuiTest('datepicker-toolbar-date').textContent).to.equal('2018');
  });

  it('format for year+month view', () => {
    const value = adapterToUse.date(`2018-01-01T00:00:00.000`);
    render(
      <MobileDatePicker
        renderInput={(params) => <TextField {...params} />}
        value={value}
        onChange={() => {}}
        views={['year', 'month']}
      />,
    );

    expect(screen.getByRole('textbox')).to.have.value('janvier 2018');

    fireEvent.click(screen.getByLabelText(/Choose date/));
    expect(screen.getByMuiTest('datepicker-toolbar-date').textContent).to.equal('janvier');
  });

  it('format for year+month+day view', () => {
    render(
      <MobileDatePicker
        onChange={() => {}}
        renderInput={(params) => <TextField {...params} />}
        value={adapterToUse.date(new Date(2018, 0, 1))}
        views={['year', 'month', 'day']}
      />,
    );

    expect(screen.getByRole('textbox')).to.have.value('01/01/2018');

    fireEvent.click(screen.getByLabelText(/Choose date/));
    expect(screen.getByMuiTest('datepicker-toolbar-date').textContent).to.equal('1 janvier');
  });
});
