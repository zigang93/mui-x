import * as React from 'react';
import {
  DataGridPremium,
  useGridApiRef,
  GridColDef,
  useKeepGroupedColumnsHidden,
} from '@mui/x-data-grid-premium';
import { useMovieData, Movie } from '@mui/x-data-grid-generator';

export default function RowGroupingGroupingValueGetter() {
  const data = useMovieData();
  const apiRef = useGridApiRef();

  const columnsWithComposer = React.useMemo(
    () => [
      ...data.columns,
      {
        field: 'composer',
        headerName: 'Composer',
        renderCell: (params) => params.value?.name,
        groupingValueGetter: (params) => params.value.name,
        width: 200,
      } as GridColDef<Movie, { name: string }>,
      {
        field: 'decade',
        headerName: 'Decade',
        valueGetter: (params) => Math.floor(params.row.year / 10) * 10,
        groupingValueGetter: (params) => Math.floor(params.row.year / 10) * 10,
        renderCell: (params) => {
          if (params.value == null) {
            return '';
          }

          return `${params.value.toString().slice(-2)}'s`;
        },
      } as GridColDef<Movie, number>,
    ],
    [data.columns],
  );

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: {
      rowGrouping: {
        model: ['composer', 'decade'],
      },
    },
  });

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPremium
        {...data}
        columns={columnsWithComposer}
        apiRef={apiRef}
        initialState={initialState}
      />
    </div>
  );
}
