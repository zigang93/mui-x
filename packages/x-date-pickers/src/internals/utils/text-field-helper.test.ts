import { expect } from 'chai';
import { adapterToUse } from '../../../../../test/utils/pickers-utils';
import { maskedDateFormatter, checkMaskIsValidForCurrentFormat } from './text-field-helper';

describe('text-field-helper', () => {
  it('maskedDateFormatter for date', () => {
    const formatterFn = maskedDateFormatter('__/__/____', /[\d]/gi);

    expect(formatterFn('21')).to.equal('21/');
    expect(formatterFn('21/1')).to.equal('21/1');
    expect(formatterFn('211/')).to.equal('21/1');
    expect(formatterFn('21/12')).to.equal('21/12/');
    expect(formatterFn('21/12/21')).to.equal('21/12/21');
    expect(formatterFn('21/12/2010')).to.equal('21/12/2010');
    expect(formatterFn('21-12-2010')).to.equal('21/12/2010');
    expect(formatterFn('2f')).to.equal('2');
    expect(formatterFn('21/1g2/2010')).to.equal('21/12/2010');
  });

  it('maskedDateFormatter for time', () => {
    const formatterFn = maskedDateFormatter('__:__ _M', /[\dap]/gi);

    expect(formatterFn('10')).to.equal('10:');
    expect(formatterFn('10:00')).to.equal('10:00 ');
    expect(formatterFn('10:00 A')).to.equal('10:00 AM');
  });

  [
    // Time picker
    // - with ampm = true
    { mask: '__:__ _m', format: adapterToUse.formats.fullTime12h, isValid: true },
    // - with ampm=false
    { mask: '__:__', format: adapterToUse.formats.fullTime24h, isValid: true },
    // Date Picker
    {
      mask: '__/__/____',
      format: adapterToUse.formats.keyboardDate,
      isValid: true,
    },
    // - with year only
    {
      mask: '____',
      format: adapterToUse.formats.year,
      isValid: true,
    },
    // DateTimePicker
    // - with ampm=true
    {
      mask: '__/__/____ __:__ _m',
      format: adapterToUse.formats.keyboardDateTime12h,
      isValid: true,
    },
    // - with ampm=false
    {
      mask: '__/__/____ __:__',
      format: adapterToUse.formats.keyboardDateTime24h,
      isValid: true,
    },
    // Test rejections
    { mask: '__.__.____', format: adapterToUse.formats.keyboardDate, isValid: false },
    { mask: '__:__ _m', format: adapterToUse.formats.fullTime, isValid: false },
    { mask: '__/__/____ __:__ _m', format: adapterToUse.formats.keyboardDateTime, isValid: false },
    { mask: '__/__/____', format: 'MM/dd/yyyy', isValid: adapterToUse.lib === 'date-fns' }, // only pass with date-fns
    { mask: '__/__/____', format: 'MMMM yyyy', isValid: false },
  ].forEach(({ mask, format, isValid }, index) => {
    it(`checkMaskIsValidFormat returns ${isValid} for mask #${index} '${mask}' and format ${format}`, () => {
      const runMaskValidation = () =>
        checkMaskIsValidForCurrentFormat(mask, format, /[\dap]/gi, adapterToUse);

      if (isValid) {
        expect(runMaskValidation()).to.be.equal(true);
      } else {
        expect(runMaskValidation).toWarnDev('Falling down to uncontrolled no-mask input.');
      }
    });
  });
});
