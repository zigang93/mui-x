import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  DataGridPro,
  useGridSelector,
  useGridApiContext,
  gridDetailPanelExpandedRowsContentCacheSelector,
  GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
} from '@mui/x-data-grid-pro';
import {
  randomCreatedDate,
  randomCurrency,
  randomEmail,
  randomPrice,
} from '@mui/x-data-grid-generator';

export default function CustomizeDetailPanelToggle() {
  const getDetailPanelContent = React.useCallback(
    ({ row }) =>
      row.id % 2 === 0 ? <Box sx={{ p: 2 }}>{`Order #${row.id}`}</Box> : null,
    [],
  );

  const getDetailPanelHeight = React.useCallback(() => 50, []);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        rows={rows}
        columns={columns}
        rowThreshold={0}
        getDetailPanelContent={getDetailPanelContent}
        getDetailPanelHeight={getDetailPanelHeight}
      />
    </div>
  );
}

function CustomDetailPanelToggle(props) {
  const { id, value: isExpanded } = props;
  const apiRef = useGridApiContext();

  // To avoid calling ´getDetailPanelContent` all the time, the following selector
  // gives an object with the detail panel content for each row id.
  const contentCache = useGridSelector(
    apiRef,
    gridDetailPanelExpandedRowsContentCacheSelector,
  );

  // If the value is not a valid React element, it means that the row has no detail panel.
  const hasDetail = React.isValidElement(contentCache[id]);

  return (
    <IconButton
      size="small"
      tabIndex={-1}
      disabled={!hasDetail}
      aria-label={isExpanded ? 'Close' : 'Open'}
    >
      <ExpandMoreIcon
        sx={{
          transform: `rotateZ(${isExpanded ? 180 : 0}deg)`,
          transition: (theme) =>
            theme.transitions.create('transform', {
              duration: theme.transitions.duration.shortest,
            }),
        }}
        fontSize="inherit"
      />
    </IconButton>
  );
}

CustomDetailPanelToggle.propTypes = {
  /**
   * The grid row id.
   */
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  /**
   * The cell value, but if the column has valueGetter, use getValue.
   */
  value: PropTypes.any,
};

const columns = [
  { field: 'id', headerName: 'Order ID' },
  { field: 'customer', headerName: 'Customer', width: 200 },
  { field: 'date', type: 'date', headerName: 'Placed at' },
  { field: 'currency', headerName: 'Currency' },
  { field: 'total', type: 'number', headerName: 'Total' },
  {
    ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
    renderCell: (params) => (
      <CustomDetailPanelToggle id={params.id} value={params.value} />
    ),
  },
];

const rows = [
  {
    id: 1,
    customer: 'Matheus',
    email: randomEmail(),
    date: randomCreatedDate(),
    currency: randomCurrency(),
    total: randomPrice(1, 1000),
  },
  {
    id: 2,
    customer: 'Olivier',
    email: randomEmail(),
    date: randomCreatedDate(),
    currency: randomCurrency(),
    total: randomPrice(1, 1000),
  },
  {
    id: 3,
    customer: 'Flavien',
    email: randomEmail(),
    date: randomCreatedDate(),
    currency: randomCurrency(),
    total: randomPrice(1, 1000),
  },
  {
    id: 4,
    customer: 'Danail',
    email: randomEmail(),
    date: randomCreatedDate(),
    currency: randomCurrency(),
    total: randomPrice(1, 1000),
  },
  {
    id: 5,
    customer: 'Alexandre',
    email: randomEmail(),
    date: randomCreatedDate(),
    currency: randomCurrency(),
    total: randomPrice(1, 1000),
  },
];
