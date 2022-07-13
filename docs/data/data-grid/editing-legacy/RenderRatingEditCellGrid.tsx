import * as React from 'react';
import Box from '@mui/material/Box';
import Rating, { RatingProps } from '@mui/material/Rating';
import {
  DataGrid,
  GridRenderCellParams,
  GridColDef,
  useGridApiContext,
} from '@mui/x-data-grid';

function renderRating(params: GridRenderCellParams<number>) {
  return <Rating readOnly value={params.value} />;
}

function RatingEditInputCell(props: GridRenderCellParams<number>) {
  const { id, value, field } = props;

  const apiRef = useGridApiContext();

  const handleChange: RatingProps['onChange'] = async (event, newValue) => {
    apiRef.current.setEditCellValue({ id, field, value: Number(newValue) }, event);
    // Check if the event is not from the keyboard
    // https://github.com/facebook/react/issues/7407
    const nativeEvent = event.nativeEvent as unknown as MouseEvent;
    if (nativeEvent.clientX !== 0 && nativeEvent.clientY !== 0) {
      // Wait for the validation to run
      const isValid = await apiRef.current.commitCellChange({ id, field });
      if (isValid) {
        apiRef.current.setCellMode(id, field, 'view');
      }
    }
  };

  const handleRef = (element: HTMLElement) => {
    if (element) {
      const input = element.querySelector(
        `input[value="${value}"]`,
      ) as HTMLInputElement;
      input?.focus();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', pr: 2 }}>
      <Rating
        ref={handleRef}
        name="rating"
        precision={1}
        value={value}
        onChange={handleChange}
      />
    </Box>
  );
}

const renderRatingEditInputCell: GridColDef['renderEditCell'] = (params) => {
  return <RatingEditInputCell {...params} />;
};

export default function RenderRatingEditCellGrid() {
  return (
    <div style={{ height: 250, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  );
}

const columns = [
  {
    field: 'places',
    headerName: 'Places',
    width: 120,
  },
  {
    field: 'rating',
    headerName: 'Rating',
    renderCell: renderRating,
    renderEditCell: renderRatingEditInputCell,
    editable: true,
    width: 180,
    type: 'number',
  },
];

const rows = [
  { id: 1, places: 'Barcelona', rating: 5 },
  { id: 2, places: 'Rio de Janeiro', rating: 4 },
  { id: 3, places: 'London', rating: 3 },
  { id: 4, places: 'New York', rating: 2 },
];
