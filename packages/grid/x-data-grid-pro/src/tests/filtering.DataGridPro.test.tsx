import {
  getDefaultGridFilterModel,
  GridApi,
  DataGridProProps,
  GridFilterModel,
  GridLinkOperator,
  GridPreferencePanelsValue,
  GridRowModel,
  SUBMIT_FILTER_STROKE_TIME,
  useGridApiRef,
  DataGridPro,
} from '@mui/x-data-grid-pro';
// @ts-ignore Remove once the test utils are typed
import { createRenderer, fireEvent, screen } from '@mui/monorepo/test/utils';
import { expect } from 'chai';
import * as React from 'react';
import { spy } from 'sinon';
import { getColumnHeaderCell, getColumnValues } from 'test/utils/helperFn';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe('<DataGridPro /> - Filter', () => {
  const { clock, render } = createRenderer({ clock: 'fake' });

  let apiRef: React.MutableRefObject<GridApi>;

  const baselineProps = {
    autoHeight: isJSDOM,
    rows: [
      {
        id: 0,
        brand: 'Nike',
      },
      {
        id: 1,
        brand: 'Adidas',
      },
      {
        id: 2,
        brand: 'Puma',
      },
    ],
    columns: [{ field: 'brand' }],
  };

  const TestCase = (props: Partial<DataGridProProps>) => {
    const { rows, ...other } = props;
    apiRef = useGridApiRef();
    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPro
          apiRef={apiRef}
          {...baselineProps}
          rows={rows || baselineProps.rows}
          disableColumnFilter={false}
          {...other}
        />
      </div>
    );
  };

  const filterModel = {
    items: [
      {
        columnField: 'brand',
        value: 'a',
        operatorValue: 'contains',
      },
    ],
  };

  it('should apply the filterModel prop correctly', () => {
    render(<TestCase filterModel={filterModel} />);

    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Puma']);
  });

  it('should apply the filterModel prop correctly on GridApiRef setRows', () => {
    render(<TestCase filterModel={filterModel} />);

    const newRows = [
      {
        id: 3,
        brand: 'Asics',
      },
      {
        id: 4,
        brand: 'RedBull',
      },
      {
        id: 5,
        brand: 'Hugo',
      },
    ];
    apiRef.current.setRows(newRows);
    expect(getColumnValues(0)).to.deep.equal(['Asics']);
  });

  it('should apply the filterModel prop correctly on GridApiRef update row data', () => {
    render(<TestCase filterModel={filterModel} />);
    apiRef.current.updateRows([{ id: 1, brand: 'Fila' }]);
    apiRef.current.updateRows([{ id: 0, brand: 'Patagonia' }]);
    expect(getColumnValues(0)).to.deep.equal(['Patagonia', 'Fila', 'Puma']);
  });

  it('should allow apiRef to setFilterModel', () => {
    render(<TestCase />);
    apiRef.current.setFilterModel({
      items: [
        {
          columnField: 'brand',
          value: 'a',
          operatorValue: 'startsWith',
        },
      ],
    });
    expect(getColumnValues(0)).to.deep.equal(['Adidas']);
  });

  it('should allow multiple filter and default to AND', () => {
    const newModel = {
      items: [
        {
          id: 1,
          columnField: 'brand',
          value: 'a',
          operatorValue: 'contains',
        },
        {
          id: 2,
          columnField: 'brand',
          value: 'm',
          operatorValue: 'contains',
        },
      ],
    };
    render(<TestCase filterModel={newModel} />);
    expect(getColumnValues(0)).to.deep.equal(['Puma']);
  });

  it('should allow multiple filter via apiRef', () => {
    render(<TestCase />);
    const newModel = {
      items: [
        {
          id: 1,
          columnField: 'brand',
          value: 'a',
          operatorValue: 'startsWith',
        },
        {
          id: 2,
          columnField: 'brand',
          value: 's',
          operatorValue: 'endsWith',
        },
      ],
    };
    apiRef.current.setFilterModel(newModel);
    expect(getColumnValues(0)).to.deep.equal(['Adidas']);
  });

  it('should allow multiple filter and changing the linkOperator', () => {
    const newModel: GridFilterModel = {
      items: [
        {
          id: 1,
          columnField: 'brand',
          value: 'a',
          operatorValue: 'startsWith',
        },
        {
          id: 2,
          columnField: 'brand',
          value: 'a',
          operatorValue: 'endsWith',
        },
      ],
      linkOperator: GridLinkOperator.Or,
    };
    render(<TestCase filterModel={newModel} />);
    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Puma']);
  });

  it("should call onFilterModelChange with reason=changeLogicOperator when the logic operator changes but doesn't change the state", () => {
    const onFilterModelChange = spy();
    const newModel: GridFilterModel = {
      items: [
        {
          id: 1,
          columnField: 'brand',
          value: 'a',
          operatorValue: 'startsWith',
        },
        {
          id: 2,
          columnField: 'brand',
          value: 'a',
          operatorValue: 'endsWith',
        },
      ],
    };
    render(
      <TestCase
        filterModel={newModel}
        onFilterModelChange={onFilterModelChange}
        initialState={{
          preferencePanel: { openedPanelValue: GridPreferencePanelsValue.filters, open: true },
        }}
      />,
    );
    expect(onFilterModelChange.callCount).to.equal(0);
    expect(getColumnValues(0)).to.deep.equal([]);

    // The first combo is hidden and we include hidden elements to make the query faster
    // https://github.com/testing-library/dom-testing-library/issues/820#issuecomment-726936225
    const select = screen.queryAllByRole('combobox', { name: 'Logic operator', hidden: true })[
      isJSDOM ? 1 : 0 // https://github.com/testing-library/dom-testing-library/issues/846
    ];
    fireEvent.change(select, { target: { value: 'or' } });
    expect(onFilterModelChange.callCount).to.equal(1);
    expect(onFilterModelChange.lastCall.args[1].reason).to.equal('changeLogicOperator');
    expect(getColumnValues(0)).to.deep.equal([]);
  });

  it('should call onFilterModelChange with reason=upsertFilterItem when the value is emptied', () => {
    const onFilterModelChange = spy();
    render(
      <TestCase
        onFilterModelChange={onFilterModelChange}
        filterModel={{
          items: [
            {
              id: 1,
              columnField: 'brand',
              value: 'a',
              operatorValue: 'contains',
            },
          ],
        }}
        initialState={{
          preferencePanel: { openedPanelValue: GridPreferencePanelsValue.filters, open: true },
        }}
      />,
    );
    expect(onFilterModelChange.callCount).to.equal(0);
    fireEvent.change(screen.queryByRole('textbox', { name: 'Value' }), { target: { value: '' } });
    clock.tick(500);
    expect(onFilterModelChange.callCount).to.equal(1);
    expect(onFilterModelChange.lastCall.args[1].reason).to.equal('upsertFilterItem');
  });

  it('should call onFilterModelChange with reason=deleteFilterItem when a filter is removed', () => {
    const onFilterModelChange = spy();
    render(
      <TestCase
        onFilterModelChange={onFilterModelChange}
        filterModel={{
          items: [
            {
              id: 1,
              columnField: 'brand',
              value: 'a',
              operatorValue: 'contains',
            },
            {
              id: 2,
              columnField: 'brand',
              value: 'a',
              operatorValue: 'endsWith',
            },
          ],
        }}
        initialState={{
          preferencePanel: { openedPanelValue: GridPreferencePanelsValue.filters, open: true },
        }}
      />,
    );
    expect(onFilterModelChange.callCount).to.equal(0);
    fireEvent.click(screen.queryAllByRole('button', { name: 'Delete' })[0]);
    expect(onFilterModelChange.callCount).to.equal(1);
    expect(onFilterModelChange.lastCall.args[1].reason).to.equal('deleteFilterItem');
  });

  it('should call onFilterModelChange with reason=upsertFilterItems when a filter is added', () => {
    const onFilterModelChange = spy();
    render(
      <TestCase
        onFilterModelChange={onFilterModelChange}
        filterModel={{
          items: [{ id: 1, columnField: 'brand', value: 'a', operatorValue: 'contains' }],
        }}
        initialState={{
          preferencePanel: { openedPanelValue: GridPreferencePanelsValue.filters, open: true },
        }}
      />,
    );
    expect(onFilterModelChange.callCount).to.equal(0);
    fireEvent.click(screen.queryByRole('button', { name: 'Add filter' }));
    expect(onFilterModelChange.callCount).to.equal(1);
    expect(onFilterModelChange.lastCall.args[1].reason).to.equal('upsertFilterItems');
  });

  it('should publish filterModelChange with the reason whenever the model changes', () => {
    const listener = spy();
    render(
      <TestCase
        initialState={{
          preferencePanel: { openedPanelValue: GridPreferencePanelsValue.filters, open: true },
        }}
      />,
    );
    apiRef.current.subscribeEvent('filterModelChange', listener);
    expect(listener.callCount).to.equal(0);
    fireEvent.click(screen.queryByRole('button', { name: 'Add filter' }));
    expect(listener.callCount).to.equal(1);
    expect(listener.lastCall.args[1].reason).to.equal('upsertFilterItems');
  });

  it('should only select visible rows', () => {
    const newModel: GridFilterModel = {
      items: [
        {
          columnField: 'brand',
          value: 'a',
          operatorValue: 'startsWith',
        },
      ],
      linkOperator: GridLinkOperator.Or,
    };
    render(<TestCase checkboxSelection filterModel={newModel} />);
    const checkAllCell = getColumnHeaderCell(0).querySelector('input');
    fireEvent.click(checkAllCell);
    expect(apiRef.current.state.selection).to.deep.equal([1]);
  });

  it('should allow to clear filters by passing an empty filter model', () => {
    const newModel: GridFilterModel = {
      items: [
        {
          columnField: 'brand',
          value: 'a',
          operatorValue: 'startsWith',
        },
      ],
    };
    const { setProps } = render(<TestCase filterModel={newModel} />);
    expect(getColumnValues(0)).to.deep.equal(['Adidas']);
    setProps({ filterModel: { items: [] } });
    expect(getColumnValues(0)).to.deep.equal(['Nike', 'Adidas', 'Puma']);
  });

  it('should show the latest visibleRows', () => {
    render(
      <TestCase
        initialState={{
          preferencePanel: {
            open: true,
            openedPanelValue: GridPreferencePanelsValue.filters,
          },
        }}
      />,
    );

    const input = screen.getByPlaceholderText('Filter value');
    fireEvent.change(input, { target: { value: 'ad' } });
    clock.tick(SUBMIT_FILTER_STROKE_TIME);
    expect(getColumnValues(0)).to.deep.equal(['Adidas']);

    expect(apiRef.current.getVisibleRowModels().size).to.equal(1);
    expect(apiRef.current.getVisibleRowModels().get(1)).to.deep.equal({ id: 1, brand: 'Adidas' });
  });

  it('should not scroll the page when a filter is removed from the panel', function test() {
    if (isJSDOM) {
      this.skip(); // Needs layout
    }
    render(
      <div>
        {/* To simulate a page that needs to be scrolled to reach the grid. */}
        <div style={{ height: '100vh', width: '100vh' }} />
        <TestCase
          initialState={{
            preferencePanel: {
              open: true,
              openedPanelValue: GridPreferencePanelsValue.filters,
            },
            filter: {
              filterModel: {
                linkOperator: GridLinkOperator.Or,
                items: [
                  { id: 1, columnField: 'brand', value: 'a', operatorValue: 'contains' },
                  { id: 2, columnField: 'brand', value: 'm', operatorValue: 'contains' },
                ],
              },
            },
          }}
        />
      </div>,
    );
    screen.getByRole('grid').scrollIntoView();
    const initialScrollPosition = window.scrollY;
    expect(initialScrollPosition).not.to.equal(0);
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[1]);
    expect(window.scrollY).to.equal(initialScrollPosition);
  });

  it('should not scroll the page when opening the filter panel and the operator=isAnyOf', function test() {
    if (isJSDOM) {
      this.skip(); // Needs layout
    }

    render(
      <div>
        {/* To simulate a page that needs to be scrolled to reach the grid. */}
        <div style={{ height: '100vh', width: '100vh' }} />
        <TestCase
          initialState={{
            preferencePanel: {
              open: true,
              openedPanelValue: GridPreferencePanelsValue.filters,
            },
            filter: {
              filterModel: {
                linkOperator: GridLinkOperator.Or,
                items: [{ id: 1, columnField: 'brand', operatorValue: 'isAnyOf' }],
              },
            },
          }}
        />
      </div>,
    );

    screen.getByRole('grid').scrollIntoView();
    const initialScrollPosition = window.scrollY;
    expect(initialScrollPosition).not.to.equal(0);
    apiRef.current.hidePreferences();
    clock.tick(100);
    apiRef.current.showPreferences(GridPreferencePanelsValue.filters);
    expect(window.scrollY).to.equal(initialScrollPosition);
  });

  describe('Server', () => {
    it('should refresh the filter panel when adding filters', () => {
      function loadServerRows(commodityFilterValue: string | undefined) {
        const serverRows = [
          { id: '1', commodity: 'rice' },
          { id: '2', commodity: 'soybeans' },
          { id: '3', commodity: 'milk' },
          { id: '4', commodity: 'wheat' },
          { id: '5', commodity: 'oats' },
        ];

        return new Promise<GridRowModel[]>((resolve) => {
          if (!commodityFilterValue) {
            resolve(serverRows);
            return;
          }
          resolve(
            serverRows.filter(
              (row) => row.commodity.toLowerCase().indexOf(commodityFilterValue) > -1,
            ),
          );
        });
      }

      const columns = [{ field: 'commodity', width: 150 }];

      function AddServerFilterGrid() {
        const [rows, setRows] = React.useState<GridRowModel[]>([]);
        const [filterValue, setFilterValue] = React.useState<string>();

        const handleFilterChange = React.useCallback((newFilterModel: GridFilterModel) => {
          setFilterValue(newFilterModel.items[0].value);
        }, []);

        React.useEffect(() => {
          let active = true;

          (async () => {
            const newRows = await loadServerRows(filterValue);

            if (!active) {
              return;
            }

            setRows(newRows);
          })();

          return () => {
            active = false;
          };
        }, [filterValue]);

        return (
          <div style={{ height: 400, width: 400 }}>
            <DataGridPro
              rows={rows}
              columns={columns}
              filterMode="server"
              onFilterModelChange={handleFilterChange}
              initialState={{
                preferencePanel: {
                  open: true,
                  openedPanelValue: GridPreferencePanelsValue.filters,
                },
              }}
            />
          </div>
        );
      }

      render(<AddServerFilterGrid />);
      const addButton = screen.getByRole('button', { name: /Add Filter/i });
      fireEvent.click(addButton);
      const filterForms = document.querySelectorAll(`.MuiDataGrid-filterForm`);
      expect(filterForms).to.have.length(2);
    });
  });

  it('should display the number of results in the footer', () => {
    const { setProps } = render(<TestCase />);
    expect(screen.getByText('Total Rows: 3')).not.to.equal(null);
    setProps({ filterModel });
    expect(screen.getByText('Total Rows: 2 of 3')).not.to.equal(null);
  });

  describe('control Filter', () => {
    it('should update the filter state when neither the model nor the onChange are set', () => {
      render(
        <TestCase
          initialState={{
            preferencePanel: {
              open: true,
              openedPanelValue: GridPreferencePanelsValue.filters,
            },
          }}
        />,
      );
      const addButton = screen.getByRole('button', { name: /Add Filter/i });
      fireEvent.click(addButton);
      const filterForms = document.querySelectorAll(`.MuiDataGrid-filterForm`);
      expect(filterForms).to.have.length(2);
    });

    it('should not update the filter state when the filterModelProp is set', () => {
      const testFilterModel: GridFilterModel = { items: [], linkOperator: GridLinkOperator.Or };
      render(
        <TestCase
          filterModel={testFilterModel}
          initialState={{
            preferencePanel: {
              open: true,
              openedPanelValue: GridPreferencePanelsValue.filters,
            },
          }}
        />,
      );
      const addButton = screen.getByRole('button', { name: /Add Filter/i });
      fireEvent.click(addButton);
      expect(apiRef.current.state.filter.filterModel.items).to.have.length(0);
    });

    it('should update the filter state when the model is not set, but the onChange is set', () => {
      const onModelChange = spy();
      render(
        <TestCase
          onFilterModelChange={onModelChange}
          initialState={{
            preferencePanel: {
              open: true,
              openedPanelValue: GridPreferencePanelsValue.filters,
            },
          }}
        />,
      );
      expect(onModelChange.callCount).to.equal(0);
      const addButton = screen.getByRole('button', { name: /Add Filter/i });
      fireEvent.click(addButton);
      const filterForms = document.querySelectorAll(`.MuiDataGrid-filterForm`);
      expect(filterForms).to.have.length(2);
      expect(onModelChange.callCount).to.equal(1);
      expect(onModelChange.lastCall.firstArg.items.length).to.deep.equal(2);
      expect(onModelChange.lastCall.firstArg.linkOperator).to.deep.equal(GridLinkOperator.And);
    });

    it('should control filter state when the model and the onChange are set', () => {
      const ControlCase = (props: Partial<DataGridProProps>) => {
        const { rows, columns, ...others } = props;
        const [caseFilterModel, setFilterModel] = React.useState(getDefaultGridFilterModel);
        const handleFilterChange: DataGridProProps['onFilterModelChange'] = (newModel) => {
          setFilterModel(newModel);
        };

        return (
          <div style={{ width: 300, height: 300 }}>
            <DataGridPro
              autoHeight={isJSDOM}
              columns={columns || baselineProps.columns}
              rows={rows || baselineProps.rows}
              filterModel={caseFilterModel}
              onFilterModelChange={handleFilterChange}
              initialState={{
                preferencePanel: {
                  open: true,
                  openedPanelValue: GridPreferencePanelsValue.filters,
                },
              }}
              {...others}
            />
          </div>
        );
      };

      render(<ControlCase />);
      const addButton = screen.getByRole('button', { name: /Add Filter/i });
      fireEvent.click(addButton);

      const filterForms = document.querySelectorAll(`.MuiDataGrid-filterForm`);
      expect(filterForms).to.have.length(2);
    });
  });
});
