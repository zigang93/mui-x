import * as React from 'react';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { GridCellParams } from '../models/params/gridCellParams';
import { GridActionsColDef, GridColDef, GridColumns, GridRowParams } from '../models';

const RenderCellParamsExplicitTyping = () => {
  return (
    <DataGrid
      rows={[]}
      columns={[
        {
          field: 'price1',
          renderCell: (params: GridRenderCellParams) => {
            return params.value.toUpperCase();
          },
        },
        {
          field: 'price2',
          renderCell: (params: GridRenderCellParams<number>) => {
            // @ts-expect-error `toUpperCase` doesn't exist in number
            return params.value.toUpperCase();
          },
        },
        {
          field: 'price3',
          renderCell: (params: GridRenderCellParams) => {
            return params.row.price.toUpperCase();
          },
        },
        {
          field: 'price4',
          renderCell: (params: GridRenderCellParams<any, { price: number }>) => {
            // @ts-expect-error `toUpperCase` doesn't exist in number
            return params.row.price.toUpperCase();
          },
        },
        {
          field: 'price5',
          renderCell: (params: GridRenderCellParams<any, any, number>) => {
            // @ts-expect-error `toUpperCase` doesn't exist in number
            return params.formattedValue.toUpperCase();
          },
        },
        {
          field: 'price6',
          type: 'actions',
          // @ts-expect-error `price` is expected to be a number because of GridEnrichedCallDef
          getActions: (params: GridRowParams<{ price: string }>) => {
            return params.row.price.toUpperCase();
          },
        },
        {
          field: 'price7',
          type: 'actions',
          getActions: (params: GridRowParams<{ price: number }>) => {
            // @ts-expect-error `toUpperCase` doesn't exist in number
            return params.row.price.toUpperCase();
          },
        },
      ]}
    />
  );
};

const CellParamsFromRowModel = () => {
  type PriceRowModel = { price1: number; price2: string };

  const actionColumn: GridActionsColDef<PriceRowModel> = {
    field: 'price1',
    type: 'actions',
    getActions: (params) => {
      // @ts-expect-error `toUpperCase` does not exist on number
      return params.row.price1.toUpperCase(); // fails
    },
  };

  const priceCol: GridColDef<PriceRowModel> = {
    field: 'price2',
    renderCell: (params) => {
      // @ts-expect-error `toExponential` does not exist on string
      return params.row.price2.toExponential();
    },
  };

  const columns: GridColumns<PriceRowModel> = [
    {
      field: 'price1',
      type: 'actions',
      getActions: (params) => {
        // @ts-expect-error `toUpperCase` does not exist on number
        return params.row.price1.toUpperCase(); // fails
      },
    },
    {
      field: 'price2',
      renderCell: (params) => {
        // @ts-expect-error `toExponential` does not exist on string
        return params.row.price2.toExponential();
      },
    },
  ];

  return <DataGrid rows={[]} columns={columns} />;
};

const CellParamsValue = () => {
  return (
    <DataGrid
      rows={[]}
      columns={[{ field: 'brand' }]}
      onCellClick={(params: GridCellParams) => {
        params.value!.toUpperCase();
      }}
      onCellDoubleClick={(params: GridCellParams<number>) => {
        // @ts-expect-error `toUpperCase` doesn't exist in number
        params.value!.toUpperCase();
      }}
    />
  );
};

const CellParamsRow = () => {
  return (
    <DataGrid
      rows={[]}
      columns={[{ field: 'brand' }]}
      onCellClick={(params: GridCellParams) => {
        params.row.brand!.toUpperCase();
      }}
      onCellDoubleClick={(params: GridCellParams<any, { brand: number }>) => {
        // @ts-expect-error `toUpperCase` doesn't exist in number
        params.row.brand!.toUpperCase();
      }}
    />
  );
};

const CellParamsFormattedValue = () => {
  return (
    <DataGrid
      rows={[]}
      columns={[{ field: 'brand' }]}
      onCellClick={(params: GridCellParams<any>) => {
        params.formattedValue!.toUpperCase();
      }}
      onCellDoubleClick={(params: GridCellParams<any, any, number>) => {
        // @ts-expect-error `toUpperCase` doesn't exist in number
        params.formattedValue!.toUpperCase();
      }}
    />
  );
};
