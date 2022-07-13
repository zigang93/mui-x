import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import {
  DataGrid,
  GridEditSingleSelectCell,
  useGridApiContext,
} from '@mui/x-data-grid';
import { randomPrice } from '@mui/x-data-grid-generator';

const rows = [
  {
    id: 1,
    description: 'Light bill',
    value: randomPrice(0, 1000),
    type: 'Expense',
    account: 'Utilities',
  },
  {
    id: 3,
    description: 'Order #5',
    value: randomPrice(0, 1000),
    type: 'Income',
    account: 'Sales',
  },
  {
    id: 4,
    description: 'Google AdSense',
    value: randomPrice(0, 1000),
    type: 'Income',
    account: 'Ads',
  },
];

const CustomTypeEditComponent = (props) => {
  const apiRef = useGridApiContext();

  const handleValueChange = async () => {
    await apiRef.current.setEditCellValue({
      id: props.id,
      field: 'account',
      value: '',
    });
  };

  return <GridEditSingleSelectCell onValueChange={handleValueChange} {...props} />;
};

CustomTypeEditComponent.propTypes = {
  /**
   * The grid row id.
   */
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default function LinkedFieldsRowEditing() {
  const columns = [
    { field: 'description', headerName: 'Description', width: 160, editable: true },
    {
      field: 'value',
      headerName: 'Value',
      type: 'number',
      width: 120,
      editable: true,
    },
    {
      field: 'type',
      headerName: 'Type',
      type: 'singleSelect',
      valueOptions: ['Income', 'Expense'],
      width: 120,
      editable: true,
      renderEditCell: (params) => <CustomTypeEditComponent {...params} />,
    },
    {
      field: 'account',
      headerName: 'Account',
      type: 'singleSelect',
      valueOptions: ({ row }) => {
        if (!row) {
          return [
            'Sales',
            'Investments',
            'Ads',
            'Taxes',
            'Payroll',
            'Utilities',
            'Marketing',
          ];
        }

        return row.type === 'Income'
          ? ['Sales', 'Investments', 'Ads']
          : ['Taxes', 'Payroll', 'Utilities', 'Marketing'];
      },
      width: 140,
      editable: true,
    },
  ];

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        experimentalFeatures={{ newEditingApi: true }}
      />
    </Box>
  );
}
