import * as React from 'react';
import {
  GridApi,
  DataGridProProps,
  useGridApiRef,
  DataGridPro,
  GridRenderEditCellParams,
  GridValueSetterParams,
  GridPreProcessEditCellProps,
  GridRowModes,
} from '@mui/x-data-grid-pro';
// @ts-ignore Remove once the test utils are typed
import { createRenderer, fireEvent, act } from '@mui/monorepo/test/utils';
import { expect } from 'chai';
import { getCell, getRow } from 'test/utils/helperFn';
import { spy } from 'sinon';
import { getData } from 'storybook/src/data/data-service';

const nativeSetTimeout = setTimeout;

describe('<DataGridPro /> - Row Editing', () => {
  const { render, clock } = createRenderer();

  let apiRef: React.MutableRefObject<GridApi>;

  const defaultData = getData(4, 4);

  const CustomEditComponent = ({ hasFocus }: GridRenderEditCellParams) => {
    const ref = React.useRef<HTMLInputElement>(null);
    React.useLayoutEffect(() => {
      if (hasFocus) {
        ref.current!.focus();
      }
    }, [hasFocus]);
    return <input ref={ref} />;
  };

  const renderEditCell1 = spy((props: GridRenderEditCellParams) => (
    <CustomEditComponent {...props} />
  ));

  const renderEditCell2 = spy((props: GridRenderEditCellParams) => (
    <CustomEditComponent {...props} />
  ));

  let column1Props: any = {};
  let column2Props: any = {};

  const TestCase = (props: Partial<DataGridProProps>) => {
    apiRef = useGridApiRef();
    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPro
          apiRef={apiRef}
          editMode="row"
          disableVirtualization
          experimentalFeatures={{ newEditingApi: true }}
          {...defaultData}
          columns={defaultData.columns.map((column) => {
            if (column.field === 'currencyPair') {
              return {
                ...column,
                renderEditCell: renderEditCell1,
                editable: true,
                ...column1Props,
              };
            }
            if (column.field === 'price1M') {
              return {
                ...column,
                renderEditCell: renderEditCell2,
                editable: true,
                ...column2Props,
              };
            }
            return column;
          })}
          {...props}
        />
      </div>
    );
  };

  afterEach(() => {
    renderEditCell1.resetHistory();
    renderEditCell2.resetHistory();
    column1Props = {};
    column2Props = {};
  });

  describe('apiRef', () => {
    describe('startRowEditMode', () => {
      it('should throw when the row is already in edit mode', () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(() => {
          apiRef.current.startRowEditMode({ id: 0 });
        }).to.throw('MUI: The row with id=0 is not in view mode.');
      });

      it('should update the CSS class of all editable cells', () => {
        render(<TestCase />);
        expect(getCell(0, 1).className).not.to.contain('MuiDataGrid-cell--editing');
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(getCell(0, 1).className).to.contain('MuiDataGrid-cell--editing');
        expect(getCell(0, 2).className).to.contain('MuiDataGrid-cell--editing');
        expect(getCell(0, 3).className).not.to.contain('MuiDataGrid-cell--editing');
      });

      it('should update the CSS class of the row', () => {
        render(<TestCase />);
        expect(getRow(0).className).not.to.contain('MuiDataGrid-row--editing');
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(getRow(0).className).to.contain('MuiDataGrid-row--editing');
      });

      it('should render the components given in renderEditCell', () => {
        render(<TestCase />);
        expect(renderEditCell1.callCount).to.equal(0);
        expect(renderEditCell2.callCount).to.equal(0);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(renderEditCell1.callCount).not.to.equal(0);
        expect(renderEditCell2.callCount).not.to.equal(0);
      });

      it('should pass props to renderEditCell', () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(renderEditCell1.lastCall.args[0].value).to.equal('USDGBP');
        expect(renderEditCell1.lastCall.args[0].error).to.equal(false);
        expect(renderEditCell1.lastCall.args[0].isProcessingProps).to.equal(false);
        expect(renderEditCell2.lastCall.args[0].value).to.equal(1);
        expect(renderEditCell2.lastCall.args[0].error).to.equal(false);
        expect(renderEditCell2.lastCall.args[0].isProcessingProps).to.equal(false);
      });

      it('should empty the value if deleteValue is true', () => {
        render(<TestCase />);
        act(() =>
          apiRef.current.startRowEditMode({
            id: 0,
            fieldToFocus: 'currencyPair',
            deleteValue: true,
          }),
        );
        expect(renderEditCell1.lastCall.args[0].value).to.equal('');
        expect(renderEditCell2.lastCall.args[0].value).to.equal(1);
      });
    });

    describe('setEditCellValue', () => {
      it('should update the value prop given to renderEditCell', async () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(renderEditCell1.lastCall.args[0].value).to.equal('USDGBP');
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'usdgbp' });
        expect(renderEditCell1.lastCall.args[0].value).to.equal('usdgbp');
      });

      it('should pass to renderEditCell the row with the values updated', async () => {
        column1Props.valueSetter = ({ value, row }: GridValueSetterParams) => ({
          ...row,
          currencyPair: value.trim(),
        });
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(renderEditCell1.lastCall.args[0].row).to.deep.equal(defaultData.rows[0]);
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: ' usdgbp ' });
        await apiRef.current.setEditCellValue({ id: 0, field: 'price1M', value: 100 });
        expect(renderEditCell1.lastCall.args[0].row).to.deep.equal({
          ...defaultData.rows[0],
          currencyPair: 'usdgbp',
          price1M: 100,
        });
      });

      it('should pass the new value through the value parser if defined', async () => {
        column1Props.valueParser = spy((value) => value.toLowerCase());
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(column1Props.valueParser.callCount).to.equal(0);
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        expect(column1Props.valueParser.callCount).to.equal(1);
        expect(renderEditCell1.lastCall.args[0].value).to.equal('usd gbp');
      });

      it('should return true if no preProcessEditCellProps is defined', async () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(
          await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' }),
        ).to.equal(true);
      });

      it('should set isProcessingProps to true before calling preProcessEditCellProps', async () => {
        column1Props.preProcessEditCellProps = spy(
          ({ props }: GridPreProcessEditCellProps) => props,
        );
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        expect(renderEditCell1.lastCall.args[0].isProcessingProps).to.equal(true);
      });

      it('should call all preProcessEditCellProps with the correct params', async () => {
        column1Props.preProcessEditCellProps = spy(
          ({ props }: GridPreProcessEditCellProps) => props,
        );
        column2Props.preProcessEditCellProps = spy(
          ({ props }: GridPreProcessEditCellProps) => props,
        );
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });

        const args1 = column1Props.preProcessEditCellProps.lastCall.args[0];
        expect(args1.id).to.equal(0);
        expect(args1.row).to.deep.equal(defaultData.rows[0]);
        expect(args1.hasChanged).to.equal(true);
        expect(args1.props).to.deep.equal({
          value: 'USD GBP',
          error: false,
          isProcessingProps: true,
        });

        const args2 = column2Props.preProcessEditCellProps.lastCall.args[0];
        expect(args2.id).to.equal(0);
        expect(args2.row).to.deep.equal(defaultData.rows[0]);
        expect(args2.hasChanged).to.equal(false);
        expect(args2.props).to.deep.equal({
          value: 1,
          error: false,
          isProcessingProps: true,
        });
      });

      it('should pass to renderEditCell the props returned by preProcessEditCellProps', async () => {
        column1Props.preProcessEditCellProps = ({ props }: GridPreProcessEditCellProps) => ({
          ...props,
          foo: 'bar',
        });
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(renderEditCell1.lastCall.args[0].foo).to.equal(undefined);
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        expect(renderEditCell1.lastCall.args[0].foo).to.equal('bar');
      });

      it('should not pass to renderEditCell the value returned by preProcessEditCellProps', async () => {
        column1Props.preProcessEditCellProps = ({ props }: GridPreProcessEditCellProps) => ({
          ...props,
          value: 'foobar',
        });
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(renderEditCell1.lastCall.args[0].value).to.equal('USDGBP');
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        expect(renderEditCell1.lastCall.args[0].value).to.equal('USD GBP');
      });

      it('should set isProcessingProps to false after calling preProcessEditCellProps', async () => {
        column1Props.preProcessEditCellProps = ({ props }: GridPreProcessEditCellProps) => props;
        column2Props.preProcessEditCellProps = ({ props }: GridPreProcessEditCellProps) => props;
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        const promise = apiRef.current.setEditCellValue({
          id: 0,
          field: 'currencyPair',
          value: 'USD GBP',
        }) as Promise<boolean>;
        expect(renderEditCell1.lastCall.args[0].isProcessingProps).to.equal(true);
        expect(renderEditCell2.lastCall.args[0].isProcessingProps).to.equal(true);
        return promise.then(() => {
          expect(renderEditCell1.lastCall.args[0].isProcessingProps).to.equal(false);
          expect(renderEditCell2.lastCall.args[0].isProcessingProps).to.equal(false);
        });
      });

      it('should return false if preProcessEditCellProps sets an error', async () => {
        column1Props.preProcessEditCellProps = ({ props }: GridPreProcessEditCellProps) => ({
          ...props,
          error: true,
        });
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(
          await apiRef.current.setEditCellValue({
            id: 0,
            field: 'currencyPair',
            value: 'USD GBP',
          }),
        ).to.equal(false);
      });

      it('should return false if the cell left the edit mode while calling preProcessEditCellProps', async () => {
        column1Props.preProcessEditCellProps = ({ props }: GridPreProcessEditCellProps) =>
          new Promise((resolve) => {
            // Simulates the user cancelling the editing while processing the props
            apiRef.current.stopRowEditMode({
              id: 0,
              ignoreModifications: true,
            });
            resolve(props);
          });
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(
          await apiRef.current.setEditCellValue({
            id: 0,
            field: 'currencyPair',
            value: 'USD GBP',
          }),
        ).to.equal(false);
      });

      describe('with debounceMs > 0', () => {
        clock.withFakeTimers();

        it('should debounce multiple changes if debounceMs > 0', () => {
          render(<TestCase />);
          act(() => apiRef.current.startRowEditMode({ id: 0 }));
          expect(renderEditCell1.lastCall.args[0].value).to.equal('USDGBP');
          renderEditCell1.resetHistory();
          apiRef.current.setEditCellValue({
            id: 0,
            field: 'currencyPair',
            value: 'USD',
            debounceMs: 100,
          });
          expect(renderEditCell1.callCount).to.equal(0);
          apiRef.current.setEditCellValue({
            id: 0,
            field: 'currencyPair',
            value: 'USD GBP',
            debounceMs: 100,
          });
          expect(renderEditCell1.callCount).to.equal(0);
          clock.tick(100);
          expect(renderEditCell1.callCount).not.to.equal(0);
          expect(renderEditCell1.lastCall.args[0].value).to.equal('USD GBP');
        });
      });
    });

    describe('stopRowEditMode', () => {
      it('should reject when the cell is not in edit mode', async () => {
        render(<TestCase />);
        expect(() => apiRef.current.stopRowEditMode({ id: 0 })).to.throw(
          'MUI: The row with id=0 is not in edit mode.',
        );
      });

      it('should update the row with the new value stored', async () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(getCell(0, 1).textContent).to.equal('USD GBP');
      });

      it('should not update the row if ignoreModifications=true', async () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        act(() => apiRef.current.stopRowEditMode({ id: 0, ignoreModifications: true }));
        expect(getCell(0, 1).textContent).to.equal('USDGBP');
      });

      it('should do nothing if props are still being processed and ignoreModifications=false', async () => {
        column1Props.preProcessEditCellProps = ({ props }: GridPreProcessEditCellProps) =>
          new Promise((resolve) => {
            // Simulates the user stopping the editing while processing the props
            act(() => apiRef.current.stopRowEditMode({ id: 0 }));
            resolve(props);
          });
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        expect(getCell(0, 1).className).to.contain('MuiDataGrid-cell--editing');
      });

      it('should do nothing if props of any column contain error=true', async () => {
        column1Props.preProcessEditCellProps = ({ props }: GridPreProcessEditCellProps) => ({
          ...props,
          error: true,
        });
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(getCell(0, 1).className).to.contain('MuiDataGrid-cell--editing');
      });

      it('should allow a 2nd call if the first call was when error=true', async () => {
        column1Props.preProcessEditCellProps = ({ props }: GridPreProcessEditCellProps) => ({
          ...props,
          error: props.value.length === 0,
        });
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));

        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: '' });
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(getCell(0, 1).className).to.contain('MuiDataGrid-cell--editing');

        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(getCell(0, 1).className).not.to.contain('MuiDataGrid-cell--editing');
      });

      it('should update the CSS class of the cell', async () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(getCell(0, 1).className).to.contain('MuiDataGrid-cell--editing');
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(getCell(0, 1).className).not.to.contain('MuiDataGrid-cell--editing');
      });

      it('should call processRowUpdate before updating the row', async () => {
        const processRowUpdate = spy((row) => ({ ...row, currencyPair: 'USD-GBP' }));
        render(<TestCase processRowUpdate={processRowUpdate} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        await new Promise((resolve) => nativeSetTimeout(resolve));
        expect(processRowUpdate.callCount).to.equal(1);
        expect(getCell(0, 1).textContent).to.equal('USD-GBP');
      });

      it('should call processRowUpdate with the new and old row', async () => {
        const processRowUpdate = spy((newRow, oldRow) => ({ ...oldRow, ...newRow }));
        render(<TestCase processRowUpdate={processRowUpdate} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(processRowUpdate.lastCall.args[0]).to.deep.equal({
          ...defaultData.rows[0],
          currencyPair: 'USD GBP',
        });
        expect(processRowUpdate.lastCall.args[1]).to.deep.equal(defaultData.rows[0]);
      });

      it('should stay in edit mode if processRowUpdate throws an error', () => {
        const processRowUpdate = () => {
          throw new Error('Something went wrong');
        };
        render(<TestCase processRowUpdate={processRowUpdate} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        expect(() => act(() => apiRef.current.stopRowEditMode({ id: 0 }))).toErrorDev(
          'MUI: A call to `processRowUpdate` threw an error which was not handled because `onProcessRowUpdateError` is missing.',
        );
        expect(getCell(0, 1).className).to.contain('MuiDataGrid-cell--editing');
      });

      it('should call onProcessRowUpdateError if processRowUpdate throws an error', () => {
        const error = new Error('Something went wrong');
        const processRowUpdate = () => {
          throw error;
        };
        const onProcessRowUpdateError = spy();
        render(
          <TestCase
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={onProcessRowUpdateError}
          />,
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(onProcessRowUpdateError.lastCall.args[0]).to.equal(error);
      });

      it('should call onProcessRowUpdateError if processRowUpdate rejects', async () => {
        const error = new Error('Something went wrong');
        const processRowUpdate = () => {
          throw error;
        };
        const onProcessRowUpdateError = spy();
        render(
          <TestCase
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={onProcessRowUpdateError}
          />,
        );
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        await new Promise((resolve) => nativeSetTimeout(resolve));
        expect(onProcessRowUpdateError.lastCall.args[0]).to.equal(error);
      });

      it('should pass the new value through all value setters before calling processRowUpdate', async () => {
        column1Props.valueSetter = spy(({ value, row }) => ({ ...row, _currencyPair: value }));
        column2Props.valueSetter = spy(({ value, row }) => ({ ...row, _price1M: value }));
        const processRowUpdate = spy((newRow) => newRow);
        render(<TestCase processRowUpdate={processRowUpdate} />);
        act(() => apiRef.current.startRowEditMode({ id: 0 }));
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        act(() => apiRef.current.stopRowEditMode({ id: 0 }));
        expect(processRowUpdate.lastCall.args[0]).to.deep.equal({
          ...defaultData.rows[0],
          currencyPair: 'USDGBP',
          _currencyPair: 'USD GBP',
          price1M: 1,
          _price1M: 1,
        });
        expect(column1Props.valueSetter.lastCall.args[0]).to.deep.equal({
          value: 'USD GBP',
          row: defaultData.rows[0],
        });
        expect(column2Props.valueSetter.lastCall.args[0]).to.deep.equal({
          value: 1,
          row: { ...defaultData.rows[0], currencyPair: 'USDGBP', _currencyPair: 'USD GBP' }, // Ensure that the row contains the values from the previous setter
        });
      });

      it('should move focus to the cell below when cellToFocusAfter=below', () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0, fieldToFocus: 'currencyPair' }));
        expect(getCell(0, 1).querySelector('input')).toHaveFocus();
        act(() =>
          apiRef.current.stopRowEditMode({
            id: 0,
            field: 'currencyPair',
            cellToFocusAfter: 'below',
          }),
        );
        expect(getCell(1, 1)).toHaveFocus();
      });

      it('should move focus to the cell below when cellToFocusAfter=right', () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0, fieldToFocus: 'currencyPair' }));
        expect(getCell(0, 1).querySelector('input')).toHaveFocus();
        act(() =>
          apiRef.current.stopRowEditMode({
            id: 0,
            field: 'currencyPair',
            cellToFocusAfter: 'right',
          }),
        );
        expect(getCell(0, 2)).toHaveFocus();
      });

      it('should move focus to the cell below when cellToFocusAfter=left', () => {
        render(<TestCase />);
        act(() => apiRef.current.startRowEditMode({ id: 0, fieldToFocus: 'price1M' }));
        expect(getCell(0, 2).querySelector('input')).toHaveFocus();
        act(() =>
          apiRef.current.stopRowEditMode({ id: 0, field: 'price1M', cellToFocusAfter: 'left' }),
        );
        expect(getCell(0, 1)).toHaveFocus();
      });

      describe('with pending value mutation', () => {
        clock.withFakeTimers();

        it('should run all pending value mutations before calling processRowUpdate', async () => {
          const processRowUpdate = spy((newRow) => newRow);
          render(<TestCase processRowUpdate={processRowUpdate} />);
          act(() => apiRef.current.startRowEditMode({ id: 0 }));
          apiRef.current.setEditCellValue({
            id: 0,
            field: 'currencyPair',
            value: 'USD GBP',
            debounceMs: 100,
          });
          act(() => apiRef.current.stopRowEditMode({ id: 0 }));
          expect(renderEditCell1.lastCall.args[0].value).to.equal('USD GBP');
          expect(processRowUpdate.lastCall.args[0].currencyPair).to.equal('USD GBP');
        });
      });
    });
  });

  describe('start edit mode', () => {
    describe('by double-click', () => {
      it(`should publish 'rowEditStart' with reason=cellDoubleClick`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStart', listener);
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        expect(listener.lastCall.args[0].reason).to.equal('cellDoubleClick');
      });

      it(`should not publish 'rowEditStart' if the cell is not editable`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStart', listener);
        const cell = getCell(0, 0);
        fireEvent.doubleClick(cell);
        expect(listener.callCount).to.equal(0);
      });

      it('should call startRowEditMode', () => {
        render(<TestCase />);
        const spiedStartRowEditMode = spy(apiRef.current, 'startRowEditMode');
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        expect(spiedStartRowEditMode.callCount).to.equal(1);
      });
    });

    describe('by pressing Enter', () => {
      it(`should publish 'rowEditStart' with reason=enterKeyDown`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStart', listener);
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.keyDown(cell, { key: 'Enter' });
        expect(listener.lastCall.args[0].reason).to.equal('enterKeyDown');
      });

      it(`should not publish 'rowEditStart' if the cell is not editable`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStart', listener);
        const cell = getCell(0, 0);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.keyDown(cell, { key: 'Enter' });
        expect(listener.callCount).to.equal(0);
      });

      it('should call startRowEditMode passing fieldToFocus', () => {
        render(<TestCase />);
        const spiedStartRowEditMode = spy(apiRef.current, 'startRowEditMode');
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.keyDown(cell, { key: 'Enter' });
        expect(spiedStartRowEditMode.callCount).to.equal(1);
        expect(spiedStartRowEditMode.lastCall.args[0]).to.deep.equal({
          id: 0,
          fieldToFocus: 'currencyPair',
        });
      });
    });

    describe('by pressing Delete', () => {
      it(`should publish 'rowEditStart' with reason=deleteKeyDown`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStart', listener);
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.keyDown(cell, { key: 'Delete' });
        expect(listener.lastCall.args[0].reason).to.equal('deleteKeyDown');
      });

      it(`should not publish 'rowEditStart' if the cell is not editable`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStart', listener);
        const cell = getCell(0, 0);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.keyDown(cell, { key: 'Delete' });
        expect(listener.callCount).to.equal(0);
      });

      it('should call startRowEditMode passing fieldToFocus and deleteValue', () => {
        render(<TestCase />);
        const spiedStartRowEditMode = spy(apiRef.current, 'startRowEditMode');
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.keyDown(cell, { key: 'Delete' });
        expect(spiedStartRowEditMode.callCount).to.equal(1);
        expect(spiedStartRowEditMode.lastCall.args[0]).to.deep.equal({
          id: 0,
          fieldToFocus: 'currencyPair',
          deleteValue: true,
        });
      });
    });

    describe('by pressing a printable character', () => {
      it(`should publish 'rowEditStart' with reason=printableKeyDown`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStart', listener);
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.keyDown(cell, { key: 'a' });
        expect(listener.lastCall.args[0].reason).to.equal('printableKeyDown');
      });

      it(`should not publish 'rowEditStart' if the cell is not editable`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStart', listener);
        const cell = getCell(0, 0);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.keyDown(cell, { key: 'a' });
        expect(listener.callCount).to.equal(0);
      });

      ['ctrlKey', 'metaKey', 'altKey'].forEach((key) => {
        it(`should not publish 'rowEditStart' if ${key} is pressed`, () => {
          render(<TestCase />);
          const listener = spy();
          apiRef.current.subscribeEvent('rowEditStart', listener);
          const cell = getCell(0, 1);
          fireEvent.mouseUp(cell);
          fireEvent.click(cell);
          fireEvent.keyDown(cell, { key: 'a', [key]: true });
          expect(listener.callCount).to.equal(0);
        });
      });

      it(`should call startRowEditMode if shiftKey is pressed with a letter`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStart', listener);
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.keyDown(cell, { key: 'a', shiftKey: true });
        expect(listener.callCount).to.equal(1);
      });

      it(`should call startRowEditMode if ctrl+V is pressed`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStart', listener);
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.keyDown(cell, { key: 'v', ctrlKey: true });
        expect(listener.callCount).to.equal(1);
      });

      it(`should call startRowEditMode if meta+V is pressed`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStart', listener);
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.keyDown(cell, { key: 'v', metaKey: true });
        expect(listener.callCount).to.equal(1);
      });

      it('should call startRowEditMode passing fieldToFocus and deleteValue', () => {
        render(<TestCase />);
        const spiedStartRowEditMode = spy(apiRef.current, 'startRowEditMode');
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.keyDown(cell, { key: 'a' });
        expect(spiedStartRowEditMode.callCount).to.equal(1);
        expect(spiedStartRowEditMode.lastCall.args[0]).to.deep.equal({
          id: 0,
          fieldToFocus: 'currencyPair',
          deleteValue: true,
        });
      });

      it(`should ignore keydown event until the IME is confirmed with a letter`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStop', listener);
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        const input = cell.querySelector('input')!;
        fireEvent.change(input, { target: { value: 'あ' } });
        fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
        expect(listener.callCount).to.equal(0);
        fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });
        expect(listener.callCount).to.equal(1);
        expect(input.value).to.equal('あ');
        expect(listener.lastCall.args[0].reason).to.equal('enterKeyDown');
      });

      it(`should ignore keydown event until the IME is confirmed with multiple letters`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStop', listener);
        const cell = getCell(0, 1);
        fireEvent.doubleClick(cell);
        const input = cell.querySelector('input')!;
        fireEvent.change(input, { target: { value: 'ありがとう' } });
        fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
        expect(listener.callCount).to.equal(0);
        fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });
        expect(listener.callCount).to.equal(1);
        expect(input.value).to.equal('ありがとう');
        expect(listener.lastCall.args[0].reason).to.equal('enterKeyDown');
      });
    });
  });

  describe('stop edit mode', () => {
    describe('by clicking outside the cell', () => {
      clock.withFakeTimers();

      it(`should publish 'rowEditStop' with reason=rowFocusOut`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStop', listener);
        fireEvent.doubleClick(getCell(0, 1));
        expect(listener.callCount).to.equal(0);
        fireEvent.click(getCell(1, 1));
        clock.runToLast();
        expect(listener.lastCall.args[0].reason).to.equal('rowFocusOut');
      });

      it('should call stopRowEditMode with ignoreModifications=false and no cellToFocusAfter', () => {
        render(<TestCase />);
        const spiedStopRowEditMode = spy(apiRef.current, 'stopRowEditMode');
        fireEvent.doubleClick(getCell(0, 1));
        fireEvent.click(getCell(1, 1));
        clock.runToLast();
        expect(spiedStopRowEditMode.callCount).to.equal(1);
        expect(spiedStopRowEditMode.lastCall.args[0]).to.deep.equal({
          id: 0,
          ignoreModifications: false,
          field: 'currencyPair',
          cellToFocusAfter: undefined,
        });
      });

      it('should call stopRowEditMode with ignoreModifications=true if the props are being processed', () => {
        column1Props.preProcessEditCellProps = ({ props }: GridPreProcessEditCellProps) =>
          new Promise((resolve) => resolve(props));
        render(<TestCase />);
        const spiedStopRowEditMode = spy(apiRef.current, 'stopRowEditMode');
        fireEvent.doubleClick(getCell(0, 1));
        apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        fireEvent.click(getCell(1, 1));
        clock.runToLast();
        expect(spiedStopRowEditMode.callCount).to.equal(1);
        expect(spiedStopRowEditMode.lastCall.args[0].ignoreModifications).to.equal(true);
      });
    });

    describe('by pressing Escape', () => {
      it(`should publish 'rowEditStop' with reason=escapeKeyDown`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStop', listener);
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.doubleClick(cell);
        expect(listener.callCount).to.equal(0);
        fireEvent.keyDown(cell.querySelector('input'), { key: 'Escape' });
        expect(listener.lastCall.args[0].reason).to.equal('escapeKeyDown');
      });

      it('should call stopRowEditMode with ignoreModifications=true', () => {
        render(<TestCase />);
        const spiedStopRowEditMode = spy(apiRef.current, 'stopRowEditMode');
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.doubleClick(cell);
        fireEvent.keyDown(cell.querySelector('input'), { key: 'Escape' });
        expect(spiedStopRowEditMode.callCount).to.equal(1);
        expect(spiedStopRowEditMode.lastCall.args[0]).to.deep.equal({
          id: 0,
          ignoreModifications: true,
          field: 'currencyPair',
          cellToFocusAfter: undefined,
        });
      });
    });

    describe('by pressing Enter', () => {
      it(`should publish 'rowEditStop' with reason=enterKeyDown`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStop', listener);
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.doubleClick(cell);
        expect(listener.callCount).to.equal(0);
        fireEvent.keyDown(cell.querySelector('input'), { key: 'Enter' });
        expect(listener.lastCall.args[0].reason).to.equal('enterKeyDown');
      });

      it('should call stopRowEditMode with ignoreModifications=false and cellToFocusAfter=below', () => {
        render(<TestCase />);
        const spiedStopRowEditMode = spy(apiRef.current, 'stopRowEditMode');
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.doubleClick(cell);
        fireEvent.keyDown(cell.querySelector('input'), { key: 'Enter' });
        expect(spiedStopRowEditMode.callCount).to.equal(1);
        expect(spiedStopRowEditMode.lastCall.args[0]).to.deep.equal({
          id: 0,
          ignoreModifications: false,
          field: 'currencyPair',
          cellToFocusAfter: 'below',
        });
      });

      it('should call stopRowEditMode with ignoreModifications=true if the props are being processed', () => {
        column1Props.preProcessEditCellProps = ({ props }: GridPreProcessEditCellProps) =>
          new Promise((resolve) => resolve(props));
        render(<TestCase />);
        const spiedStopRowEditMode = spy(apiRef.current, 'stopRowEditMode');
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.doubleClick(cell);
        apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        fireEvent.keyDown(cell.querySelector('input'), { key: 'Enter' });
        expect(spiedStopRowEditMode.callCount).to.equal(1);
        expect(spiedStopRowEditMode.lastCall.args[0].ignoreModifications).to.equal(true);
      });
    });

    describe('by pressing Tab', () => {
      it(`should publish 'rowEditStop' with reason=tabKeyDown if on the last column`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStop', listener);
        const cell = getCell(0, 2);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.doubleClick(cell);
        expect(listener.callCount).to.equal(0);
        fireEvent.keyDown(cell.querySelector('input'), { key: 'Tab' });
        expect(listener.lastCall.args[0].reason).to.equal('tabKeyDown');
      });

      it(`should publish 'rowEditStop' with reason=shiftTabKeyDown if on the first column and Shift is pressed`, () => {
        render(<TestCase />);
        const listener = spy();
        apiRef.current.subscribeEvent('rowEditStop', listener);
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.doubleClick(cell);
        expect(listener.callCount).to.equal(0);
        fireEvent.keyDown(cell.querySelector('input'), { key: 'Tab', shiftKey: true });
        expect(listener.lastCall.args[0].reason).to.equal('shiftTabKeyDown');
      });

      it('should call stopRowEditMode with ignoreModifications=false and cellToFocusAfter=right', () => {
        render(<TestCase />);
        const spiedStopRowEditMode = spy(apiRef.current, 'stopRowEditMode');
        const cell = getCell(0, 2);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.doubleClick(cell);
        fireEvent.keyDown(cell.querySelector('input'), { key: 'Tab' });
        expect(spiedStopRowEditMode.callCount).to.equal(1);
        expect(spiedStopRowEditMode.lastCall.args[0]).to.deep.equal({
          id: 0,
          ignoreModifications: false,
          field: 'price1M',
          cellToFocusAfter: 'right',
        });
      });

      it('should call stopRowEditMode with ignoreModifications=false and cellToFocusAfter=left if Shift is pressed', () => {
        render(<TestCase />);
        const spiedStopRowEditMode = spy(apiRef.current, 'stopRowEditMode');
        const cell = getCell(0, 1);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.doubleClick(cell);
        fireEvent.keyDown(cell.querySelector('input'), { key: 'Tab', shiftKey: true });
        expect(spiedStopRowEditMode.callCount).to.equal(1);
        expect(spiedStopRowEditMode.lastCall.args[0]).to.deep.equal({
          id: 0,
          ignoreModifications: false,
          field: 'currencyPair',
          cellToFocusAfter: 'left',
        });
      });

      it('should call stopRowEditMode with ignoreModifications=true if the props are being processed', () => {
        column1Props.preProcessEditCellProps = ({ props }: GridPreProcessEditCellProps) =>
          new Promise((resolve) => resolve(props));
        render(<TestCase />);
        const spiedStopRowEditMode = spy(apiRef.current, 'stopRowEditMode');
        const cell = getCell(0, 2);
        fireEvent.mouseUp(cell);
        fireEvent.click(cell);
        fireEvent.doubleClick(cell);
        apiRef.current.setEditCellValue({ id: 0, field: 'price1M', value: 'USD GBP' });
        fireEvent.keyDown(cell.querySelector('input'), { key: 'Tab' });
        expect(spiedStopRowEditMode.callCount).to.equal(1);
        expect(spiedStopRowEditMode.lastCall.args[0].ignoreModifications).to.equal(true);
      });

      it('should keep focus on the first column when editing the first column of the first row of the 2nd page', () => {
        render(
          <TestCase
            rowsPerPageOptions={[2]}
            pageSize={2}
            page={1}
            columnVisibilityModel={{ id: false }}
            pagination
          />,
        );
        const cell = getCell(2, 0);
        fireEvent.doubleClick(cell);
        expect(cell.querySelector('input')).toHaveFocus();
        fireEvent.keyDown(cell.querySelector('input'), { key: 'Tab', shiftKey: true });
        expect(getCell(2, 0)).toHaveFocus();
      });

      it('should keep focus on the last column when editing the last column of the last row of the 2nd page', () => {
        render(
          <TestCase
            rowsPerPageOptions={[2]}
            pageSize={2}
            page={1}
            columnVisibilityModel={{ price2M: false, price3M: false }}
            pagination
          />,
        );
        const cell = getCell(3, 2);
        fireEvent.doubleClick(cell);
        expect(cell.querySelector('input')).toHaveFocus();
        fireEvent.keyDown(cell.querySelector('input'), { key: 'Tab' });
        expect(getCell(3, 2)).toHaveFocus();
      });
    });
  });

  describe('prop: rowModesModel', () => {
    describe('mode=view to mode=edit', () => {
      it('should start edit mode', () => {
        const { setProps } = render(<TestCase />);
        expect(getCell(0, 1).className).not.to.contain('MuiDataGrid-cell--editing');
        setProps({ rowModesModel: { 0: { mode: GridRowModes.Edit } } });
        expect(getCell(0, 1).className).to.contain('MuiDataGrid-cell--editing');
      });
    });

    describe('mode=edit to mode=vew', () => {
      it('should stop edit mode', () => {
        const { setProps } = render(
          <TestCase rowModesModel={{ 0: { mode: GridRowModes.Edit } }} />,
        );
        expect(getCell(0, 1).className).to.contain('MuiDataGrid-cell--editing');
        setProps({ rowModesModel: { 0: { mode: GridRowModes.View } } });
        expect(getCell(0, 1).className).not.to.contain('MuiDataGrid-cell--editing');
      });

      it('should ignode modifications if ignoreModifications=true', async () => {
        const { setProps } = render(
          <TestCase rowModesModel={{ 0: { mode: GridRowModes.Edit } }} />,
        );
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        setProps({ rowModesModel: { 0: { mode: GridRowModes.View, ignoreModifications: true } } });
        expect(getCell(0, 1).textContent).to.equal('USDGBP');
      });

      it('should move focus to the cell that is set in cellToFocusAfter', async () => {
        const { setProps } = render(
          <TestCase rowModesModel={{ 0: { mode: GridRowModes.Edit } }} />,
        );
        await apiRef.current.setEditCellValue({ id: 0, field: 'currencyPair', value: 'USD GBP' });
        setProps({
          rowModesModel: {
            0: { mode: GridRowModes.View, cellToFocusAfter: 'below', field: 'currencyPair' },
          },
        });
        expect(getCell(1, 1)).toHaveFocus();
      });
    });

    it(`should publish 'rowModesModelChange' when the model changes`, () => {
      render(<TestCase />);
      const listener = spy();
      apiRef.current.subscribeEvent('rowModesModelChange', listener);
      const cell = getCell(0, 1);
      fireEvent.doubleClick(cell);
      expect(listener.lastCall.args[0]).to.deep.equal({
        0: { mode: 'edit', fieldToFocus: 'currencyPair' },
      });
    });

    it(`should publish 'rowModesModelChange' when the prop changes`, () => {
      const { setProps } = render(<TestCase rowModesModel={{}} />);
      const listener = spy();
      expect(listener.callCount).to.equal(0);
      apiRef.current.subscribeEvent('rowModesModelChange', listener);
      setProps({ rowModesModel: { 0: { currencyPair: { mode: 'edit' } } } });
      expect(listener.lastCall.args[0]).to.deep.equal({
        0: { currencyPair: { mode: 'edit' } },
      });
    });

    it(`should not publish 'rowModesModelChange' when the model changes and rowModesModel is set`, () => {
      render(<TestCase rowModesModel={{}} />);
      const listener = spy();
      apiRef.current.subscribeEvent('rowModesModelChange', listener);
      const cell = getCell(0, 1);
      fireEvent.doubleClick(cell);
      expect(listener.callCount).to.equal(0);
    });
  });

  describe('prop: onRowModesModelChange', () => {
    it('should call with mode=edit when startEditMode is called', () => {
      const onRowModesModelChange = spy();
      render(<TestCase onRowModesModelChange={onRowModesModelChange} />);
      expect(onRowModesModelChange.callCount).to.equal(0);
      act(() => apiRef.current.startRowEditMode({ id: 0, fieldToFocus: 'currencyPair' }));
      expect(onRowModesModelChange.callCount).to.equal(1);
      expect(onRowModesModelChange.lastCall.args[0]).to.deep.equal({
        0: { mode: 'edit', fieldToFocus: 'currencyPair' },
      });
    });

    it('should call with mode=view when stopEditMode is called', () => {
      const onRowModesModelChange = spy();
      render(<TestCase onRowModesModelChange={onRowModesModelChange} />);
      act(() => apiRef.current.startRowEditMode({ id: 0, fieldToFocus: 'currencyPair' }));
      onRowModesModelChange.resetHistory();
      act(() => apiRef.current.stopRowEditMode({ id: 0 }));
      expect(onRowModesModelChange.args[0][0]).to.deep.equal({
        0: { mode: 'view' },
      });
      expect(onRowModesModelChange.args[1][0]).to.deep.equal({});
    });

    it(`should not be called when changing the rowModesModel prop`, () => {
      const onRowModesModelChange = spy();
      const { setProps } = render(
        <TestCase rowModesModel={{}} onRowModesModelChange={onRowModesModelChange} />,
      );
      expect(onRowModesModelChange.callCount).to.equal(0);
      setProps({ rowModesModel: { 0: { mode: 'edit' } } });
      expect(onRowModesModelChange.callCount).to.equal(0);
    });
  });
});
