import * as React from 'react';
import {
  DataGridPro,
  DataGridProProps,
  GridApi,
  GridColDef,
  GridInitialState,
  GridPreferencePanelsValue,
  GridRowsProp,
  useGridApiRef,
} from '@mui/x-data-grid-pro';
// @ts-ignore Remove once the test utils are typed
import { createRenderer, screen } from '@mui/monorepo/test/utils';
import { expect } from 'chai';
import {
  getColumnHeaderCell,
  getColumnHeadersTextContent,
  getColumnValues,
} from '../../../../../test/utils/helperFn';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

const rows: GridRowsProp = [
  { id: 0, category: 'Cat A' },
  { id: 1, category: 'Cat A' },
  { id: 2, category: 'Cat A' },
  { id: 3, category: 'Cat B' },
  { id: 4, category: 'Cat B' },
  { id: 5, category: 'Cat B' },
];

const columns: GridColDef[] = [
  {
    field: 'id',
    type: 'number',
  },
  {
    field: 'idBis',
    type: 'number',
    valueGetter: (params) => params.row.id,
  },
  {
    field: 'category',
  },
];

const FULL_INITIAL_STATE: GridInitialState = {
  columns: {
    columnVisibilityModel: { idBis: false },
    orderedFields: ['id', 'category', 'idBis'],
    dimensions: {
      category: {
        width: 75,
        maxWidth: -1,
        minWidth: 50,
        flex: undefined,
      },
    },
  },
  filter: {
    filterModel: {
      items: [{ columnField: 'id', operatorValue: '<', value: '5' }],
    },
  },
  pagination: {
    page: 1,
    pageSize: 2,
  },
  pinnedColumns: {
    left: ['id'],
  },
  preferencePanel: {
    open: true,
    openedPanelValue: GridPreferencePanelsValue.filters,
  },
  sorting: {
    sortModel: [{ field: 'id', sort: 'desc' }],
  },
};

describe('<DataGridPro /> - State Persistence', () => {
  const { render, clock } = createRenderer({ clock: 'fake' });

  let apiRef: React.MutableRefObject<GridApi>;

  const TestCase = (props: Omit<DataGridProProps, 'rows' | 'columns' | 'apiRef'>) => {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPro
          rows={rows}
          columns={columns}
          pagination
          autoHeight={isJSDOM}
          apiRef={apiRef}
          disableVirtualization
          rowsPerPageOptions={[100, 2]}
          {...props}
          initialState={{
            ...props.initialState,
            columns: {
              ...props.initialState?.columns,
              columnVisibilityModel: {
                ...props.initialState?.columns?.columnVisibilityModel,
              }, // To enable the `columnVisibilityModel` in export / restore
            },
          }}
        />
      </div>
    );
  };

  describe('apiRef: exportState', () => {
    // We always export the `orderedFields`,
    // If it's something problematic we could introduce an `hasBeenReordered` property and only export if at least one column has been reordered.
    it('should not return the default values of the models', () => {
      render(<TestCase />);
      expect(apiRef.current.exportState()).to.deep.equal({
        columns: {
          orderedFields: ['id', 'idBis', 'category'],
        },
      });
    });

    it('should export the initial values of the models', () => {
      render(<TestCase initialState={FULL_INITIAL_STATE} />);
      expect(apiRef.current.exportState()).to.deep.equal(FULL_INITIAL_STATE);
    });

    it('should export the current version of the exportable state', () => {
      render(<TestCase />);
      apiRef.current.setPageSize(2);
      apiRef.current.setPage(1);
      apiRef.current.setPinnedColumns({ left: ['id'] });
      apiRef.current.showPreferences(GridPreferencePanelsValue.filters);
      apiRef.current.setSortModel([{ field: 'id', sort: 'desc' }]);
      apiRef.current.setFilterModel({
        items: [{ columnField: 'id', operatorValue: '<', value: '5' }],
      });
      apiRef.current.setColumnIndex('category', 1);
      apiRef.current.setColumnWidth('category', 75);
      apiRef.current.setColumnVisibilityModel({ idBis: false });
      expect(apiRef.current.exportState()).to.deep.equal(FULL_INITIAL_STATE);
    });
  });

  describe('apiRef: restoreState', () => {
    it('should restore the whole exportable state', () => {
      render(<TestCase />);

      apiRef.current.restoreState(FULL_INITIAL_STATE);

      // Pinning, pagination, sorting and filtering
      expect(getColumnValues(0)).to.deep.equal(['2', '1']);

      // Preference panel
      expect(screen.getByRole('button', { name: /Add Filter/i })).to.not.equal(null);

      // Columns visibility
      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'category']);

      // Columns dimensions
      expect(getColumnHeaderCell(1)).toHaveInlineStyle({ width: '75px' });
    });

    it('should restore partial exportable state', () => {
      render(<TestCase />);

      apiRef.current.restoreState({
        pagination: {
          page: 1,
          pageSize: 2,
        },
      });

      expect(getColumnValues(0)).to.deep.equal(['2', '3']);
    });

    it('should restore controlled sub-state', () => {
      const ControlledTest = () => {
        const [page, setPage] = React.useState(0);

        return (
          <TestCase
            page={page}
            onPageChange={(newPage) => {
              setPage(newPage);
            }}
          />
        );
      };

      render(<ControlledTest />);
      apiRef.current.restoreState({
        pagination: {
          page: 1,
          pageSize: 2,
        },
      });
      clock.runToLast();
      expect(getColumnValues(0)).to.deep.equal(['2', '3']);
    });

    it('should not restore the column visibility model when using the legacy column visibility', () => {
      const TestCaseLegacyColumnVisibility = () => {
        apiRef = useGridApiRef();

        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPro
              rows={rows}
              columns={[
                {
                  field: 'id',
                  hide: true,
                },
                {
                  field: 'category',
                },
              ]}
              autoHeight={isJSDOM}
              apiRef={apiRef}
              disableVirtualization
            />
          </div>
        );
      };

      render(<TestCaseLegacyColumnVisibility />);

      apiRef.current.restoreState({
        columns: {
          columnVisibilityModel: {
            category: false,
          },
        },
      });

      expect(getColumnHeadersTextContent()).to.deep.equal(['category']);
    });
  });
});
