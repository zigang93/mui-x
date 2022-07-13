import * as React from 'react';
// @ts-ignore Remove once the test utils are typed
import { createRenderer, fireEvent, screen } from '@mui/monorepo/test/utils';
import { expect } from 'chai';
import { DataGrid, DataGridProps, GridSortModel } from '@mui/x-data-grid';
import { getColumnValues, getColumnHeaderCell } from 'test/utils/helperFn';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe('<DataGrid /> - Sorting', () => {
  const { render } = createRenderer();

  const baselineProps = {
    autoHeight: isJSDOM,
    rows: [
      {
        id: 0,
        brand: 'Nike',
        isPublished: false,
      },
      {
        id: 1,
        brand: 'Adidas',
        isPublished: true,
      },
      {
        id: 2,
        brand: 'Puma',
        isPublished: true,
      },
    ],
    columns: [{ field: 'brand' }, { field: 'isPublished', type: 'boolean' }],
  };

  it('should keep the initial order', () => {
    const cols = [{ field: 'id' }];
    const rows = [{ id: 10 }, { id: 0 }, { id: 5 }];

    render(
      <div style={{ width: 300, height: 300 }}>
        <DataGrid autoHeight={isJSDOM} columns={cols} rows={rows} />
      </div>,
    );
    expect(getColumnValues(0)).to.deep.equal(['10', '0', '5']);
  });

  it('should always set correct `aria-sort` attribute', () => {
    const cols = [{ field: 'id' }];
    const rows = [{ id: 10 }, { id: 0 }, { id: 5 }];

    render(
      <div style={{ width: 300, height: 300 }}>
        <DataGrid columns={cols} rows={rows} />
      </div>,
    );
    const header = getColumnHeaderCell(0);
    expect(header.getAttribute('aria-sort')).to.equal('none');

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).to.equal('ascending');

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).to.equal('descending');
  });

  it('should update the order server side', () => {
    const cols = [{ field: 'id' }];
    const rows = [{ id: 10 }, { id: 0 }, { id: 5 }];

    function Demo(props: Omit<DataGridProps, 'columns'>) {
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGrid autoHeight={isJSDOM} columns={cols} sortingMode="server" {...props} />
        </div>
      );
    }

    const { setProps } = render(<Demo rows={rows} />);
    expect(getColumnValues(0)).to.deep.equal(['10', '0', '5']);
    setProps({ rows: [{ id: 5 }, { id: 0 }, { id: 10 }] });
    expect(getColumnValues(0)).to.deep.equal(['5', '0', '10']);
  });

  it('should sort string column when clicking the header cell', () => {
    render(
      <div style={{ width: 300, height: 300 }}>
        <DataGrid {...baselineProps} />
      </div>,
    );
    const header = getColumnHeaderCell(0);
    expect(getColumnValues(0)).to.deep.equal(['Nike', 'Adidas', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Puma', 'Nike', 'Adidas']);
  });

  it('should sort boolean column when clicking the header cell', () => {
    render(
      <div style={{ width: 300, height: 300 }}>
        <DataGrid {...baselineProps} />
      </div>,
    );
    const header = screen
      .getByRole('columnheader', { name: 'isPublished' })
      .querySelector('.MuiDataGrid-columnHeaderTitleContainer');
    expect(getColumnValues(0)).to.deep.equal(['Nike', 'Adidas', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Nike', 'Adidas', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Puma', 'Nike']);
  });

  it('should only allow ascending sorting using sortingOrder', () => {
    render(
      <div style={{ width: 300, height: 300 }}>
        <DataGrid {...baselineProps} sortingOrder={['asc']} />
      </div>,
    );
    const header = getColumnHeaderCell(0);
    expect(getColumnValues(0)).to.deep.equal(['Nike', 'Adidas', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);
  });

  it('should only allow ascending and initial sorting using sortingOrder', () => {
    render(
      <div style={{ width: 300, height: 300 }}>
        <DataGrid {...baselineProps} sortingOrder={['asc', null]} />
      </div>,
    );
    const header = getColumnHeaderCell(0);
    expect(getColumnValues(0)).to.deep.equal(['Nike', 'Adidas', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Nike', 'Adidas', 'Puma']);
  });

  it('should only allow ascending and descending sorting using sortingOrder', () => {
    render(
      <div style={{ width: 300, height: 300 }}>
        <DataGrid {...baselineProps} sortingOrder={['desc', 'asc']} />
      </div>,
    );
    const header = getColumnHeaderCell(0);
    expect(getColumnValues(0)).to.deep.equal(['Nike', 'Adidas', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Puma', 'Nike', 'Adidas']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Puma', 'Nike', 'Adidas']);
  });

  it('should allow per-column sortingOrder override', () => {
    render(
      <div style={{ width: 300, height: 300 }}>
        <DataGrid
          {...baselineProps}
          sortingOrder={['asc', 'desc']}
          columns={[{ field: 'brand', sortingOrder: ['desc', 'asc'] }]}
        />
      </div>,
    );
    const header = getColumnHeaderCell(0);
    expect(getColumnValues(0)).to.deep.equal(['Nike', 'Adidas', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Puma', 'Nike', 'Adidas']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Puma', 'Nike', 'Adidas']);
  });

  it('should keep rows sorted when rows prop change', () => {
    interface TestCaseProps {
      rows: any[];
    }

    const TestCase = (props: TestCaseProps) => {
      const { rows } = props;
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGrid
            {...baselineProps}
            rows={rows}
            sortModel={[
              {
                field: 'brand',
                sort: 'asc',
              },
            ]}
          />
        </div>
      );
    };

    const { setProps } = render(<TestCase rows={baselineProps.rows} />);
    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);

    setProps({
      rows: [
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
      ],
    });
    expect(getColumnValues(0)).to.deep.equal(['Asics', 'Hugo', 'RedBull']);
  });

  it('should support server-side sorting', () => {
    interface TestCaseProps {
      rows: any[];
    }

    const TestCase = (props: TestCaseProps) => {
      const { rows } = props;
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGrid
            {...baselineProps}
            sortingMode="server"
            rows={rows}
            sortModel={[
              {
                field: 'brand',
                sort: 'desc',
              },
            ]}
          />
        </div>
      );
    };

    const rows = [
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

    const { setProps } = render(<TestCase rows={[rows[0], rows[1]]} />);
    expect(getColumnValues(0)).to.deep.equal(['Asics', 'RedBull']);
    setProps({ rows });
    expect(getColumnValues(0)).to.deep.equal(['Asics', 'RedBull', 'Hugo']);
  });

  it('should support new dataset', () => {
    const TestCase = (props: DataGridProps) => {
      const { rows, columns } = props;
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGrid autoHeight={isJSDOM} rows={rows} columns={columns} />
        </div>
      );
    };

    const { setProps } = render(<TestCase {...baselineProps} />);

    const header = screen
      .getByRole('columnheader', { name: 'brand' })
      .querySelector('.MuiDataGrid-columnHeaderTitleContainer');
    expect(getColumnValues(0)).to.deep.equal(['Nike', 'Adidas', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    const newData = {
      rows: [
        {
          id: 0,
          country: 'France',
        },
        {
          id: 1,
          country: 'UK',
        },
        {
          id: 12,
          country: 'US',
        },
      ],
      columns: [{ field: 'country' }],
    };
    setProps(newData);
    expect(getColumnValues(0)).to.deep.equal(['France', 'UK', 'US']);
  });

  it('should support new dataset in control mode', () => {
    const TestCase = (props: DataGridProps) => {
      const { rows, columns } = props;
      const [sortModel, setSortModel] = React.useState<GridSortModel>();

      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGrid
            autoHeight={isJSDOM}
            rows={rows}
            columns={columns}
            sortModel={sortModel}
            onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
          />
        </div>
      );
    };

    const { setProps } = render(<TestCase {...baselineProps} />);

    const header = screen
      .getByRole('columnheader', { name: 'brand' })
      .querySelector('.MuiDataGrid-columnHeaderTitleContainer');
    expect(getColumnValues(0)).to.deep.equal(['Nike', 'Adidas', 'Puma']);
    fireEvent.click(header);
    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    const newData = {
      rows: [
        {
          id: 0,
          country: 'France',
        },
        {
          id: 1,
          country: 'UK',
        },
        {
          id: 12,
          country: 'US',
        },
      ],
      columns: [{ field: 'country' }],
    };
    setProps(newData);
    expect(getColumnValues(0)).to.deep.equal(['France', 'UK', 'US']);
  });

  it('should clear the sorting col when passing an empty sortModel', () => {
    const TestCase = (props: Partial<DataGridProps>) => {
      return (
        <div style={{ width: 300, height: 300 }}>
          <DataGrid {...baselineProps} {...props} />
        </div>
      );
    };

    const { setProps } = render(<TestCase sortModel={[{ field: 'brand', sort: 'asc' }]} />);

    expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    setProps({ sortModel: [] });
    expect(getColumnValues(0)).to.deep.equal(['Nike', 'Adidas', 'Puma']);
  });

  describe('prop: initialState.sorting', () => {
    const Test = (props: Partial<DataGridProps>) => (
      <div style={{ width: 300, height: 300 }}>
        <DataGrid {...baselineProps} {...props} />
      </div>
    );

    it('should allow to initialize the sortModel', () => {
      render(
        <Test
          initialState={{
            sorting: {
              sortModel: [
                {
                  field: 'brand',
                  sort: 'asc',
                },
              ],
            },
          }}
        />,
      );

      expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    });

    it('should use the control state upon the initialize state when both are defined', () => {
      render(
        <Test
          sortModel={[
            {
              field: 'brand',
              sort: 'desc',
            },
          ]}
          initialState={{
            sorting: {
              sortModel: [
                {
                  field: 'brand',
                  sort: 'asc',
                },
              ],
            },
          }}
        />,
      );

      expect(getColumnValues(0)).to.deep.equal(['Puma', 'Nike', 'Adidas']);
    });

    it('should not update the sort order when updating the initial state', () => {
      const { setProps } = render(
        <Test
          initialState={{
            sorting: {
              sortModel: [
                {
                  field: 'brand',
                  sort: 'asc',
                },
              ],
            },
          }}
        />,
      );

      setProps({
        initialState: {
          sorting: {
            sortModel: [
              {
                field: 'brand',
                sort: 'desc',
              },
            ],
          },
        },
      });

      expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);
    });

    it('should allow to update the sorting when initialized with initialState', () => {
      render(
        <Test
          initialState={{
            sorting: {
              sortModel: [
                {
                  field: 'brand',
                  sort: 'asc',
                },
              ],
            },
          }}
        />,
      );

      expect(getColumnValues(0)).to.deep.equal(['Adidas', 'Nike', 'Puma']);
      fireEvent.click(screen.getAllByRole('columnheader')[0]);
      expect(getColumnValues(0)).to.deep.equal(['Puma', 'Nike', 'Adidas']);
    });

    it('should not allow to initialize the sorting with several items', () => {
      expect(() => {
        render(
          <Test
            columns={[{ field: 'id', type: 'number' }, { field: 'brand' }]}
            rows={[
              {
                id: 0,
                brand: 'Nike',
              },
              {
                id: 1,
                brand: 'Nike',
              },
              {
                id: 2,
                brand: 'Adidas',
              },
              {
                id: 3,
                brand: 'Puma',
              },
            ]}
            initialState={{
              sorting: {
                sortModel: [
                  {
                    field: 'brand',
                    sort: 'asc',
                  },
                  {
                    field: 'id',
                    sort: 'desc',
                  },
                ],
              },
            }}
          />,
        );

        expect(getColumnValues(0)).to.deep.equal(['2', '0', '1', '3']);
      }).toErrorDev(
        'MUI: The `sortModel` can only contain a single item when the `disableMultipleColumnsSorting` prop is set to `true`.',
      );
    });
  });
});
