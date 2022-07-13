import * as React from 'react';
import { styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import {
  GridCellParams,
  GridEditRowsModel,
  GridLoadIcon,
  GridColDef,
  GridRowModel,
  useGridApiRef,
  DataGridPro,
  MuiEvent,
  GridEventListener,
  GridRenderCellParams,
  GridSelectionModel,
  GridCellEditStartParams,
  GridCellEditStopParams,
} from '@mui/x-data-grid-pro';
import { useDemoData } from '@mui/x-data-grid-generator';
import { action } from '@storybook/addon-actions';
import { randomInt } from '../data/random-generator';

function isOverflown(element: Element): boolean {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

export default {
  title: 'DataGridPro Test/Rows',
  component: DataGridPro,
  parameters: {
    options: { selectedPanel: 'storybook/storysource/panel' },
    docs: {
      page: null,
    },
  },
};

const newRows = [
  {
    id: 3,
    brand: 'Asics',
  },
];
const baselineProps = {
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
  columns: [
    { field: 'brand', editable: true },
    { field: 'isPublished', type: 'boolean' },
  ],
};

function getStoryRowId(row) {
  return row.brand;
}
export function NoId() {
  const [rows] = React.useState([
    {
      brand: 'Nike',
    },
    {
      brand: 'Adidas',
    },
    {
      brand: 'Puma',
    },
  ]);

  return (
    <div className="grid-container">
      <DataGridPro columns={baselineProps.columns} rows={rows} getRowId={getStoryRowId} />
    </div>
  );
}
export function CommodityNewRowId() {
  const { data } = useDemoData({ dataSet: 'Commodity', rowLength: 100 });
  const getRowId = React.useCallback((row: GridRowModel) => `${row.desk}-${row.commodity}`, []);
  return (
    <div className="grid-container">
      <DataGridPro
        rows={data.rows}
        columns={data.columns.filter((c) => c.field !== 'id')}
        getRowId={getRowId}
      />
    </div>
  );
}
export function SetRowsViaApi() {
  const apiRef = useGridApiRef();

  const setNewRows = React.useCallback(() => {
    apiRef.current.setRows(newRows);
  }, [apiRef]);

  return (
    <React.Fragment>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <Button color="primary" onClick={setNewRows}>
          Load New Rows
        </Button>
      </div>
      <div className="grid-container">
        <DataGridPro {...baselineProps} apiRef={apiRef} />
      </div>
    </React.Fragment>
  );
}
export function SetCommodityRowsViaApi() {
  const apiRef = useGridApiRef();
  const { data } = useDemoData({ dataSet: 'Commodity', rowLength: 100 });
  const apiDemoData = useDemoData({ dataSet: 'Commodity', rowLength: 150 });

  const setNewRows = React.useCallback(() => {
    apiDemoData.setRowLength(randomInt(100, 500));
    apiDemoData.loadNewData();
    apiRef.current.setRows(apiDemoData.data.rows);
  }, [apiDemoData, apiRef]);

  return (
    <React.Fragment>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <Button color="primary" onClick={setNewRows}>
          Load New Rows
        </Button>
      </div>
      <div className="grid-container">
        <DataGridPro rows={data.rows} columns={data.columns} apiRef={apiRef} />
      </div>
    </React.Fragment>
  );
}

export function ChangeRowsAndColumns() {
  const [rows, setRows] = React.useState<any[]>(baselineProps.rows);
  const [cols, setCols] = React.useState<any[]>(baselineProps.columns);

  const changeDataSet = React.useCallback(() => {
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

    setRows(newData.rows);
    setCols(newData.columns);
  }, []);

  return (
    <React.Fragment>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <Button color="primary" onClick={changeDataSet}>
          Load New DataSet
        </Button>
      </div>
      <div className="grid-container">
        <DataGridPro rows={rows} columns={cols} />
      </div>
    </React.Fragment>
  );
}

interface GridCellExpandProps {
  value: string;
  width: number;
}

const GridCellExpand = React.memo(function CellExpand(props: GridCellExpandProps) {
  const { width, value } = props;
  const wrapper = React.useRef<HTMLDivElement | null>(null);
  const cellDiv = React.useRef(null);
  const cellValue = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showFullCell, setShowFullCell] = React.useState(false);
  const [showPopper, setShowPopper] = React.useState(false);

  const handleMouseEnter = () => {
    const isCurrentlyOverflown = isOverflown(cellValue.current!);
    setShowPopper(isCurrentlyOverflown);
    setAnchorEl(cellDiv.current);
    setShowFullCell(true);
  };

  const handleMouseLeave = () => {
    setShowFullCell(false);
  };

  React.useEffect(() => {
    if (!showFullCell) {
      return undefined;
    }

    function handleKeyDown(nativeEvent: KeyboardEvent) {
      // IE11, Edge (prior to using Bink?) use 'Esc'
      if (nativeEvent.key === 'Escape' || nativeEvent.key === 'Esc') {
        setShowFullCell(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setShowFullCell, showFullCell]);

  return (
    <Box
      ref={wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        alignItems: 'center',
        lineHeight: '24px',
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
      }}
    >
      <div
        ref={cellDiv}
        style={{
          height: '100%',
          width,
          display: 'block',
          position: 'absolute',
          top: 0,
        }}
      />
      <Box
        ref={cellValue}
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </Box>
      {showPopper && (
        <Popper
          open={showFullCell && anchorEl != null}
          anchorEl={anchorEl}
          style={{ width, marginLeft: -17 }}
        >
          <Paper elevation={1} style={{ minHeight: wrapper.current!.offsetHeight - 3 }}>
            <Typography variant="body2" style={{ padding: 8 }}>
              {value}
            </Typography>
          </Paper>
        </Popper>
      )}
    </Box>
  );
});

function RenderCellExpand(params: GridRenderCellParams) {
  return (
    <GridCellExpand
      value={params.value ? params.value.toString() : ''}
      width={params.colDef.computedWidth}
    />
  );
}

const columns: GridColDef[] = [
  { field: 'col1', headerName: 'Column 1', width: 80, renderCell: RenderCellExpand },
  { field: 'col2', headerName: 'Column 2', width: 100, renderCell: RenderCellExpand },
  { field: 'col3', headerName: 'Column 3', width: 150, renderCell: RenderCellExpand },
];
const rows: any = [
  {
    id: 1,
    col1: 'Hello',
    col2: 'World',
    col3: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used.',
  },
  {
    id: 2,
    col1: 'DataGridPro',
    col2: 'is Awesome',
    col3: 'In publishing and graphic design, Lorem ipsum is a placeholder text or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.',
  },
  {
    id: 3,
    col1: 'MUI',
    col2: 'is Amazing',
    col3: 'Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.',
  },
  {
    id: 4,
    col1: 'Hello',
    col2: 'World',
    col3: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form.',
  },
  {
    id: 5,
    col1: 'DataGridPro',
    col2: 'is Awesome',
    col3: 'Typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.',
  },
  {
    id: 6,
    col1: 'MUI',
    col2: 'is Amazing',
    col3: 'Lorem ipsum may be used as a placeholder before final copy is available.',
  },
];

export function ExpendRowCell() {
  const apiRef = useGridApiRef();

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      apiRef.current.scrollToIndexes({ colIndex: 0, rowIndex: 6 });
    }, 0);

    return () => clearTimeout(timeout);
  }, [apiRef]);

  return (
    <div style={{ height: 300, width: 600 }}>
      <DataGridPro rows={rows} columns={columns} apiRef={apiRef} />
    </div>
  );
}

// Requirements
// TODO demo with Cell edit with value getter
// Todo demo with cell not editable according to value
// demo with cell edit validation, email, username(serverside)

const baselineEditProps = {
  rows: [
    {
      id: 0,
      firstname: 'Damien',
      lastname: 'Tassone',
      email: 'damien@mui.com',
      username: 'Damo',
      lastLogin: new Date(),
      age: 25,
      DOB: new Date(1996, 10, 2),
      meetup: new Date(2020, 2, 25, 10, 50, 0),
      isAdmin: true,
      country: 'Spain',
    },
    {
      id: 1,
      firstname: 'Jon',
      lastname: 'Wood',
      email: 'jon@mui.com',
      username: 'jon',
      lastLogin: new Date(),
      age: 25,
      DOB: new Date(1992, 1, 20),
      meetup: new Date(2020, 4, 15, 10, 50, 0),
      isAdmin: true,
      country: 'Netherlands',
    },
    {
      id: 2,
      firstname: 'James',
      lastname: 'Smith',
      email: 'james@mui.com',
      username: 'smithhhh',
      lastLogin: new Date(),
      age: 25,
      DOB: new Date(1986, 0, 12),
      meetup: new Date(2020, 3, 5, 10, 50, 0),
      isAdmin: false,
      country: 'Brazil',
    },
  ],
  columns: [
    { field: 'firstname', editable: true },
    { field: 'lastname', editable: true },
    {
      field: 'fullname',
      editable: true,
      valueGetter: ({ row }) => `${row.firstname || ''} ${row.lastname || ''}`,
    },
    { field: 'isAdmin', width: 120, type: 'boolean', editable: true },
    {
      field: 'country',
      width: 120,
      type: 'singleSelect',
      editable: true,
      valueOptions: ['Bulgaria', 'Netherlands', 'France', 'Italy', 'Brazil', 'Spain'],
    },
    { field: 'username', editable: true },
    { field: 'email', editable: true, width: 150 },
    { field: 'age', width: 50, type: 'number', editable: true },
    { field: 'DOB', width: 120, type: 'date', editable: true },
    { field: 'meetup', width: 180, type: 'dateTime', editable: true },
    { field: 'lastLogin', width: 180, type: 'dateTime', editable: false },
  ],
};
function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const StyledDataGridPro = styled(DataGridPro)({
  '& .MuiDataGrid-cell--editable': {
    backgroundColor: 'rgba(184,250,158,0.19)',
    color: '#1a3e72',
  },
  '& .MuiDataGrid-cell--editing': {
    backgroundColor: 'rgb(255,215,115, 0.19)',
    color: '#1a3e72',
    '& .MuiInputBase-root': {
      height: '100%',
    },
  },
  '& .Mui-error': {
    backgroundColor: 'rgb(126,10,15, 0.1)',
    color: '#750f0f',
  },
});

export function EditRowsControl() {
  const apiRef = useGridApiRef();

  const [selectedCell, setSelectedCell] = React.useState<[string, string, any] | null>(null);
  const [isEditable, setIsEditable] = React.useState<boolean>(false);
  const [editRowsModel, setEditRowsModel] = React.useState<GridEditRowsModel>({});

  const editRow = React.useCallback(() => {
    if (!selectedCell) {
      return;
    }
    const [id, field] = selectedCell;

    apiRef.current.setCellMode(id, field, 'edit');
  }, [apiRef, selectedCell]);

  const onCellClick = React.useCallback((params: GridCellParams) => {
    setSelectedCell([params.row.id!.toString(), params.field, params.value]);
    setIsEditable(!!params.isEditable);
  }, []);

  const isCellEditable = React.useCallback((params: GridCellParams) => params.row.id !== 0, []);

  const onEditRowsModelChange = React.useCallback((newModel: GridEditRowsModel) => {
    const updatedModel = { ...newModel };
    Object.keys(updatedModel).forEach((id) => {
      if (updatedModel[id].email) {
        const isValid = validateEmail(updatedModel[id].email.value);
        updatedModel[id].email = { ...updatedModel[id].email, error: !isValid };
      }
    });
    setEditRowsModel(updatedModel);
  }, []);

  const onCellEditCommit = React.useCallback<GridEventListener<'cellEditCommit'>>(
    (params, event) => {
      const { id, field, value } = params;
      (event as React.SyntheticEvent)?.persist();
      // we stop propagation as we want to switch back to view mode after we updated the value on the server
      event.defaultMuiPrevented = true;

      let cellUpdate: any = { id };
      cellUpdate[field] = value;

      const newState = {};
      newState[id] = {};
      newState[id][field] = { value, endAdornment: <GridLoadIcon /> };
      setEditRowsModel((state) => ({ ...state, ...newState }));

      if (field === 'fullname') {
        const [firstname, lastname] = value!.toString().split(' ');
        cellUpdate = { id, firstname, lastname };
      }

      setTimeout(() => {
        apiRef.current.updateRows([cellUpdate]);
        apiRef.current.publishEvent(
          'cellEditStop',
          apiRef.current.getCellParams(id, field) as GridCellEditStopParams,
          event,
        );
      }, randomInt(300, 2000));
    },
    [apiRef],
  );

  return (
    <React.Fragment>
      Green cells are editable! Click + EDIT or Double click
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <Button color="primary" onClick={editRow} disabled={!isEditable}>
          Edit
        </Button>
      </div>
      <div className="grid-container">
        <StyledDataGridPro
          {...baselineEditProps}
          apiRef={apiRef}
          onCellClick={onCellClick}
          isCellEditable={isCellEditable}
          onEditRowsModelChange={onEditRowsModelChange}
          onCellEditCommit={onCellEditCommit}
          editRowsModel={editRowsModel}
        />
      </div>
    </React.Fragment>
  );
}
export function EditRowsBasic() {
  const apiRef = useGridApiRef();

  return (
    <React.Fragment>
      <div className="grid-container">
        <DataGridPro
          {...baselineEditProps}
          apiRef={apiRef}
          editMode="row"
          disableSelectionOnClick
          // onEditRowsModelChange={action('onEditRowsModelChange')}
        />
      </div>
    </React.Fragment>
  );
}
export function EditCellsBasic() {
  const apiRef = useGridApiRef();

  return (
    <React.Fragment>
      <div className="grid-container">
        <DataGridPro
          {...baselineEditProps}
          apiRef={apiRef}
          editMode="cell"
          onEditRowsModelChange={action('onEditRowsModelChange')}
        />
      </div>
    </React.Fragment>
  );
}

const singleData = { rows: [...baselineEditProps.rows], columns: [...baselineEditProps.columns] };
singleData.rows.length = 1;
singleData.columns.length = 1;
singleData.columns[0].width = 200;

export function SingleCellBasic() {
  return (
    <div className="grid-container">
      <DataGridPro {...singleData} onEditRowsModelChange={action('onEditRowsModelChange')} />
    </div>
  );
}
export function CommodityEdit() {
  const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 100000,
  });

  return (
    <div style={{ width: '100%', height: 600 }}>
      <DataGridPro {...data} />
    </div>
  );
}

export function EditCellSnap() {
  const apiRef = useGridApiRef();

  React.useEffect(() => {
    apiRef.current.setCellMode(1, 'brand', 'edit');
  });

  React.useEffect(() => {
    const handleClick = () => {
      apiRef.current.setCellFocus(1, 'brand');
    };

    // Prevents from exiting the edit mode when there's a click to switch between regression tests
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [apiRef]);

  return (
    <div className="grid-container">
      <DataGridPro
        {...baselineProps}
        apiRef={apiRef}
        onCellFocusOut={(params, event) => {
          // Avoids to wait for the commit promise
          event.defaultMuiPrevented = true;
        }}
      />
    </div>
  );
}

export function EditBooleanCellSnap() {
  const apiRef = useGridApiRef();

  React.useEffect(() => {
    apiRef.current.setCellMode(1, 'isPublished', 'edit');
  });

  React.useEffect(() => {
    const handleClick = () => {
      apiRef.current.setCellFocus(1, 'isPublished');
    };

    // Prevents from exiting the edit mode when there's a click to switch between regression tests
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [apiRef]);

  return (
    <div className="grid-container">
      <DataGridPro
        {...baselineProps}
        apiRef={apiRef}
        onCellFocusOut={(params, event) => {
          // Avoids to wait for the commit promise
          event.defaultMuiPrevented = true;
        }}
      />
    </div>
  );
}

// Candidate demoes for docs
export function ValidateEditValueWithApiRefGrid() {
  const apiRef = useGridApiRef();

  const onEditCellPropsChange = React.useCallback<GridEventListener<'editCellPropsChange'>>(
    ({ id, field, props }, event) => {
      if (field === 'email') {
        const isValid = validateEmail(props.value);
        const newModel = apiRef.current.getEditRowsModel();
        apiRef.current.setEditRowsModel({
          ...newModel,
          [id]: {
            ...newModel[id],
            [field]: {
              ...newModel[id][field],
              error: !isValid,
            },
          },
        });
        // Prevent the native behavior.
        event.defaultMuiPrevented = true;
      }
    },
    [apiRef],
  );

  return (
    <div style={{ height: 400, width: '100%' }}>
      <StyledDataGridPro
        {...baselineEditProps}
        apiRef={apiRef}
        onEditCellPropsChange={onEditCellPropsChange}
      />
    </div>
  );
}

export function ValidateEditValueWithEditCellModelPropGrid() {
  const apiRef = useGridApiRef();
  const [editRowsModel, setEditRowsModel] = React.useState<GridEditRowsModel>({});

  const onEditRowsModelChange = React.useCallback((newModel: GridEditRowsModel) => {
    const updatedModel = { ...newModel };
    Object.keys(updatedModel).forEach((id) => {
      if (updatedModel[id].email) {
        const isValid = validateEmail(updatedModel[id].email.value);
        updatedModel[id].email = { ...updatedModel[id].email, error: !isValid };
      }
    });
    setEditRowsModel(updatedModel);
  }, []);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <StyledDataGridPro
        {...baselineEditProps}
        apiRef={apiRef}
        editRowsModel={editRowsModel}
        onEditRowsModelChange={onEditRowsModelChange}
      />
    </div>
  );
}

let promiseTimeout: any;
function validateUsername(username: string): Promise<boolean> {
  const existingUsers = ['damien', 'olivier', 'danail'];

  return new Promise<any>((resolve) => {
    promiseTimeout = setTimeout(() => {
      resolve(existingUsers.indexOf(username.toLowerCase()) === -1);
    }, randomInt(200, 1000));
  });
}
// TODO Commit value serverside
export function ValidateEditValueServerSide() {
  const apiRef = useGridApiRef();
  const keyStrokeTimeoutRef = React.useRef<any>();

  const handleCellEditPropChange = React.useCallback<GridEventListener<'editCellPropsChange'>>(
    async ({ id, field, props }, event) => {
      if (field === 'username') {
        // TODO refactor this block
        clearTimeout(promiseTimeout);
        clearTimeout(keyStrokeTimeoutRef.current);

        let newModel = apiRef.current.getEditRowsModel();
        apiRef.current.setEditRowsModel({
          ...newModel,
          [id]: {
            ...newModel[id],
            [field]: {
              ...newModel[id][field],
              error: true,
            },
          },
        });

        keyStrokeTimeoutRef.current = setTimeout(async () => {
          const isValid = await validateUsername(props.value!.toString());
          newModel = apiRef.current.getEditRowsModel();
          apiRef.current.setEditRowsModel({
            ...newModel,
            [id]: {
              ...newModel[id],
              [field]: {
                ...newModel[id][field],
                error: !isValid,
              },
            },
          });
        }, 200);

        event.defaultMuiPrevented = true;
      }
    },
    [apiRef],
  );

  return (
    <div style={{ height: 400, width: '100%' }}>
      <StyledDataGridPro
        {...baselineEditProps}
        apiRef={apiRef}
        onEditCellPropsChange={handleCellEditPropChange}
      />
    </div>
  );
}

// Case Edit/Save using an external button
export function EditCellUsingExternalButtonGrid() {
  const apiRef = useGridApiRef();
  const [buttonLabel, setButtonLabel] = React.useState('Edit');

  const [selectedCellParams, setSelectedCellParams] = React.useState<GridCellParams | null>(null);

  const handleButtonClick = React.useCallback(() => {
    if (!selectedCellParams) {
      return;
    }
    const { id, field, cellMode } = selectedCellParams;
    if (cellMode === 'edit') {
      apiRef.current.commitCellChange({ id, field });
      apiRef.current.setCellMode(id, field, 'view');
      setButtonLabel('Edit');
    } else {
      apiRef.current.setCellMode(id, field, 'edit');
      setButtonLabel('Save');
    }
    // Or you can use the editRowModel prop, but I find it easier
  }, [apiRef, selectedCellParams]);

  const handleCellClick = React.useCallback((params: GridCellParams) => {
    setSelectedCellParams(params);

    const { cellMode } = params;
    if (cellMode === 'edit') {
      setButtonLabel('Save');
    } else {
      setButtonLabel('Edit');
    }
  }, []);

  const handleDoubleCellClick = React.useCallback(
    (params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
      event.defaultMuiPrevented = true;
    },
    [],
  );

  // Prevent from rolling back on escape
  const handleCellKeyDown = React.useCallback((params, event: MuiEvent<React.KeyboardEvent>) => {
    if (['Escape', 'Delete', 'Backspace', 'Enter'].includes(event.key)) {
      event.defaultMuiPrevented = true;
    }
  }, []);

  // Prevent from committing on focus out
  const handleCellFocusOut = React.useCallback<GridEventListener<'cellFocusOut'>>(
    (params, event) => {
      if (params.cellMode === 'edit' && event) {
        event.defaultMuiPrevented = true;
      }
    },
    [],
  );

  return (
    <React.Fragment>
      <Button onMouseDown={handleButtonClick} disabled={!selectedCellParams} color="primary">
        {buttonLabel}
      </Button>
      <div style={{ height: 400, width: '100%' }}>
        <StyledDataGridPro
          {...baselineEditProps}
          apiRef={apiRef}
          onCellClick={handleCellClick}
          onCellDoubleClick={handleDoubleCellClick}
          onCellFocusOut={handleCellFocusOut}
          onCellKeyDown={handleCellKeyDown}
        />
      </div>
    </React.Fragment>
  );
}
// The control mode
export function EditCellWithModelGrid() {
  const [editRowsModel, setEditRowsModel] = React.useState({});

  const handleEditRowsModelChange = React.useCallback((model: GridEditRowsModel) => {
    setEditRowsModel(model);
  }, []);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        {...baselineEditProps}
        editRowsModel={editRowsModel}
        onEditRowsModelChange={handleEditRowsModelChange}
        autoHeight
      />
      <code>{JSON.stringify(editRowsModel)}</code>
    </div>
  );
}

// Override the native behavior
export function EditCellWithCellClickGrid() {
  const apiRef = useGridApiRef();

  const handleCellClick = React.useCallback<GridEventListener<'cellClick'>>(
    (params, event) => {
      // Or you can use the editRowModel prop, but I find it easier
      // apiRef.current.setCellMode(params.id, params.field, 'edit');
      apiRef.current.publishEvent('cellEditStart', params as GridCellEditStartParams, event);

      // if I want to prevent selection I can do
      event.defaultMuiPrevented = true;
    },
    [apiRef],
  );

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        {...baselineEditProps}
        apiRef={apiRef}
        onCellClick={handleCellClick}
        autoHeight
      />
    </div>
  );
}

// Talk about all the keys to start editing
// Explain the event system, list the event
export function EditCellWithMessageGrid() {
  const apiRef = useGridApiRef();
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    return apiRef.current.subscribeEvent('cellEditStart', (params, event) => {
      setMessage(`Editing cell with value: ${params.value} at row: ${params.id}, column: ${
        params.field
      },
                        triggered by ${(event as React.SyntheticEvent)!.type}
      `);
    });
  }, [apiRef]);

  React.useEffect(() => {
    return apiRef.current.subscribeEvent('cellEditStop', () => {
      setMessage('');
    });
  }, [apiRef]);

  return (
    <div style={{ height: 400, width: '100%' }}>
      {message && <Alert severity="info">{message}</Alert>}
      <DataGridPro {...baselineEditProps} apiRef={apiRef} autoHeight />
    </div>
  );
}

export function SwitchVirtualization() {
  const { data, setRowLength } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 200,
    maxColumns: 20,
  });

  const handleButtonClick = (nbRows: number) => {
    setRowLength(nbRows);
  };

  React.useLayoutEffect(() => {
    const window = document.querySelector('.MuiDataGrid-window');
    if (window) {
      window!.scrollTo(0, 5000);
    }
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        width: '100%',
      }}
    >
      <div>
        <Button onClick={() => handleButtonClick(9)}>9 items</Button>
        <Button onClick={() => handleButtonClick(100)}>100 items</Button>
      </div>
      <div style={{ width: '100%', height: 500 }}>
        <DataGridPro rows={data.rows} columns={data.columns} />
      </div>
    </div>
  );
}

export function DisableVirtualization() {
  const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 200,
    maxColumns: 4,
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <DataGridPro rows={data.rows} columns={data.columns} pagination disableVirtualization />
    </div>
  );
}

export function DeferRendering() {
  const [deferRows, setRows] = React.useState<any>([]);
  const [deferColumns] = React.useState([{ field: 'id', headerName: 'Id', width: 100 }]);

  React.useEffect(() => {
    const timer = setTimeout(() => setRows(() => [{ id: '1' }, { id: '2' }]), 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return <DataGridPro autoHeight columns={deferColumns} rows={deferRows} />;
}

export const ZeroHeightGrid = () => (
  <div style={{ width: 300, height: 0 }}>
    <DataGridPro {...baselineProps} />
  </div>
);

export function SnapGridWidthEdgeScroll() {
  const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 100,
    maxColumns: 6,
  });
  return (
    <div style={{ height: 400, width: 710 }}>
      <DataGridPro {...data} />
    </div>
  );
}

export function VariableRowHeight() {
  const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 100,
  });

  return (
    <div style={{ height: 600 }}>
      <DataGridPro
        {...data}
        getRowHeight={({ model }) => {
          if (
            model.commodity.includes('Oats') ||
            model.commodity.includes('Milk') ||
            model.commodity.includes('Soybean') ||
            model.commodity.includes('Rice')
          ) {
            return 100;
          }

          return null;
        }}
      />
    </div>
  );
}

export function SetRowHeight() {
  const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 1000,
  });

  const [selectionModel, setSelectionModel] = React.useState<GridSelectionModel>([]);
  React.useEffect(() => {
    if (data.rows.length > 0) {
      setSelectionModel([data.rows[0].id]);
    }
  }, [data.rows]);

  const apiRef = useGridApiRef();

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const target = event.target as typeof event.target & {
      height: { value: string };
    };

    const height = Number(target.height.value);

    selectionModel.forEach((id) => {
      apiRef.current.unstable_setRowHeight(id, height);
    });
  };

  return (
    <div style={{ height: 600 }}>
      <form style={{ display: 'flex', margin: '16px 0' }} onSubmit={handleSubmit}>
        <TextField
          name="height"
          label="Row height"
          size="small"
          defaultValue="120"
          sx={{ mr: 1 }}
        />
        <Button type="submit" variant="outlined">
          Set row height
        </Button>
      </form>
      <DataGridPro
        {...data}
        apiRef={apiRef}
        selectionModel={selectionModel}
        onSelectionModelChange={(newModel) => setSelectionModel(newModel)}
        getRowHeight={({ model }) => {
          if (
            model.commodity.includes('Oats') ||
            model.commodity.includes('Milk') ||
            model.commodity.includes('Soybean') ||
            model.commodity.includes('Rice')
          ) {
            return 80;
          }

          return null;
        }}
      />
    </div>
  );
}
