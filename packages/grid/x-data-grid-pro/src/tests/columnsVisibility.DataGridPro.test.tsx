import * as React from 'react';
import { spy } from 'sinon';
import { expect } from 'chai';
// @ts-ignore Remove once the test utils are typed
import { createRenderer, fireEvent } from '@mui/monorepo/test/utils';
import {
  DataGridPro,
  DataGridProProps,
  GridApi,
  gridClasses,
  gridColumnLookupSelector,
  GridColumns,
  gridColumnVisibilityModelSelector,
  GridPreferencePanelsValue,
  GridRowsProp,
  useGridApiRef,
} from '@mui/x-data-grid-pro';
import { getColumnHeadersTextContent } from 'test/utils/helperFn';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

const rows: GridRowsProp = [{ id: 1 }];

const columns: GridColumns = [{ field: 'id' }, { field: 'idBis' }];

/**
 * TODO v6: Remove deprecated tests
 */
describe('<DataGridPro /> - Columns Visibility', () => {
  const { render } = createRenderer();

  let apiRef: React.MutableRefObject<GridApi>;

  const TestDataGridPro = (
    props: Omit<DataGridProProps, 'columns' | 'rows' | 'apiRef'> &
      Partial<Pick<DataGridProProps, 'rows' | 'columns'>>,
  ) => {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPro
          columns={columns}
          rows={rows}
          {...props}
          apiRef={apiRef}
          autoHeight={isJSDOM}
        />
      </div>
    );
  };

  describe('apiRef: updateColumns', () => {
    it('should not call `onColumnVisibilityModelChange` when no column visibility has changed', () => {
      const onColumnVisibilityModelChange = spy();
      render(
        <TestDataGridPro
          columnVisibilityModel={{ idBis: false }}
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        />,
      );

      apiRef.current.updateColumns([{ field: 'id', width: 300 }]);
      expect(onColumnVisibilityModelChange.callCount).to.equal(0);
    });

    it('should not reset the visibility status based on `GridColDef.hide` on unmodified columns when controlling the model (deprecated)', () => {
      const onColumnVisibilityModelChange = spy();
      render(
        <TestDataGridPro
          columnVisibilityModel={{ idBis: false }}
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        />,
      );

      apiRef.current.updateColumns([{ field: 'id', hide: true }]);
      expect(onColumnVisibilityModelChange.callCount).to.equal(1);
      expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({
        id: false,
        idBis: false,
      });
    });
  });

  describe('apiRef: setColumnVisibility', () => {
    describe('Model on initialState: do not update `GridColDef.hide`', () => {
      it('should update `columnVisibilityModel` but not `GridColDef.hide` in state', () => {
        render(
          <TestDataGridPro
            initialState={{ columns: { columnVisibilityModel: { idBis: false } } }}
          />,
        );
        apiRef.current.setColumnVisibility('id', false);
        expect(gridColumnLookupSelector(apiRef).id.hide).to.equal(false);
        expect(gridColumnVisibilityModelSelector(apiRef)).to.deep.equal({
          id: false,
          idBis: false,
        });

        apiRef.current.setColumnVisibility('id', true);
        expect(gridColumnLookupSelector(apiRef).id.hide).to.equal(false);
        expect(gridColumnVisibilityModelSelector(apiRef)).to.deep.equal({
          id: true,
          idBis: false,
        });
      });

      it('should call `onColumnVisibilityModelChange` with the new model', () => {
        const onColumnVisibilityModelChange = spy();

        render(
          <TestDataGridPro
            initialState={{ columns: { columnVisibilityModel: { idBis: false } } }}
            onColumnVisibilityModelChange={onColumnVisibilityModelChange}
          />,
        );

        apiRef.current.setColumnVisibility('id', false);
        expect(onColumnVisibilityModelChange.callCount).to.equal(1);
        expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({
          id: false,
          idBis: false,
        });

        apiRef.current.setColumnVisibility('id', true);
        expect(onColumnVisibilityModelChange.callCount).to.equal(2);
        expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({
          idBis: false,
          id: true,
        });
      });

      it('should not call `onColumnVisibilityChange`', () => {
        const onColumnVisibilityChange = spy();

        render(
          <TestDataGridPro
            initialState={{ columns: { columnVisibilityModel: { idBis: false } } }}
            onColumnVisibilityChange={onColumnVisibilityChange}
          />,
        );

        apiRef.current.setColumnVisibility('id', false);
        expect(onColumnVisibilityChange.callCount).to.equal(0);

        apiRef.current.setColumnVisibility('id', true);
        expect(onColumnVisibilityChange.callCount).to.equal(0);
      });
    });

    describe('No model on initialState or on the control prop on 1st render: use `GridColDef.hide` (deprecated)', () => {
      it('should update `columnVisibilityModel` and `GridColDef.hide` in state', () => {
        render(<TestDataGridPro />);

        apiRef.current.setColumnVisibility('id', false);
        expect(gridColumnLookupSelector(apiRef).id.hide).to.equal(true);
        expect(gridColumnVisibilityModelSelector(apiRef)).to.deep.equal({
          id: false,
          idBis: true,
        });

        apiRef.current.setColumnVisibility('id', true);
        expect(gridColumnLookupSelector(apiRef).id.hide).to.equal(false);
        expect(gridColumnVisibilityModelSelector(apiRef)).to.deep.equal({
          id: true,
          idBis: true,
        });
      });

      it('should call `onColumnVisibilityModelChange` with the new model', () => {
        const onColumnVisibilityModelChange = spy();

        render(<TestDataGridPro onColumnVisibilityModelChange={onColumnVisibilityModelChange} />);

        apiRef.current.setColumnVisibility('id', false);
        expect(onColumnVisibilityModelChange.callCount).to.equal(1);
        expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({
          id: false,
          idBis: true,
        });

        apiRef.current.setColumnVisibility('id', true);
        expect(onColumnVisibilityModelChange.callCount).to.equal(2);
        expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({
          id: true,
          idBis: true,
        });
      });

      it('should call `onColumnVisibilityChange` with the new visibility status', () => {
        const onColumnVisibilityChange = spy();

        render(<TestDataGridPro onColumnVisibilityChange={onColumnVisibilityChange} />);

        apiRef.current.setColumnVisibility('id', false);
        expect(onColumnVisibilityChange.callCount).to.equal(1);
        expect(onColumnVisibilityChange.lastCall.firstArg).to.have.property('isVisible', false);
        expect(onColumnVisibilityChange.lastCall.firstArg).to.have.property('field', 'id');

        apiRef.current.setColumnVisibility('id', true);
        expect(onColumnVisibilityChange.callCount).to.equal(2);
        expect(onColumnVisibilityChange.lastCall.firstArg).to.have.property('isVisible', true);
        expect(onColumnVisibilityChange.lastCall.firstArg).to.have.property('field', 'id');
      });
    });
  });

  describe('apiRef: setColumnVisibilityModel', () => {
    it('should update `setColumnVisibilityModel` in state and call `onColumnVisibilityModelChange`', () => {
      const onColumnVisibilityModelChange = spy();

      render(
        <TestDataGridPro
          initialState={{ columns: { columnVisibilityModel: { idBis: false } } }}
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        />,
      );
      apiRef.current.setColumnVisibilityModel({});
      expect(onColumnVisibilityModelChange.callCount).to.equal(1);
      expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({});
    });
  });

  it('should not hide column when resizing a column after hiding it and showing it again ', () => {
    const { getByText } = render(
      <TestDataGridPro
        initialState={{
          columns: { columnVisibilityModel: {} },
          preferencePanel: { open: true, openedPanelValue: GridPreferencePanelsValue.columns },
        }}
      />,
    );

    fireEvent.click(getByText('Hide all'));
    expect(getColumnHeadersTextContent()).to.deep.equal([]);
    fireEvent.click(document.querySelector('[role="tooltip"] [name="id"]'));
    expect(getColumnHeadersTextContent()).to.deep.equal(['id']);

    const separator = document.querySelector(`.${gridClasses['columnSeparator--resizable']}`);
    fireEvent.mouseDown(separator, { clientX: 100 });
    fireEvent.mouseMove(separator, { clientX: 110, buttons: 1 });
    fireEvent.mouseUp(separator);

    expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
  });
});
