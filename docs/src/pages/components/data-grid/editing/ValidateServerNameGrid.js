/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useGridApiRef, getThemePaletteMode, XGrid } from '@material-ui/x-grid';

const useStyles = makeStyles((theme) => {
  const isDark = getThemePaletteMode(theme.palette) === 'dark';

  return {
    root: {
      '& .MuiDataGrid-cellEditable': {
        backgroundColor: isDark ? '#376331' : 'rgb(217 243 190)',
      },
      '& .Mui-error': {
        backgroundColor: `rgb(126,10,15, ${isDark ? 0 : 0.1})`,
        color: isDark ? '#ff4343' : '#750f0f',
      },
    },
  };
});

let promiseTimeout;
function validateName(username) {
  const existingUsers = rows.map((row) => row.name.toLowerCase());

  return new Promise((resolve) => {
    promiseTimeout = setTimeout(() => {
      resolve(existingUsers.indexOf(username.toLowerCase()) === -1);
    }, Math.random() * 500 + 100); // simulate network latency
  });
}

export default function ValidateServerNameGrid() {
  const apiRef = useGridApiRef();
  const classes = useStyles();

  const keyStrokeTimeoutRef = React.useRef();

  const handleEditCellChange = React.useCallback(
    async ({ id, field, props }, event) => {
      if (field === 'name') {
        clearTimeout(promiseTimeout);
        clearTimeout(keyStrokeTimeoutRef.current);

        apiRef.current.setEditCellProps({
          id,
          field,
          props: { ...props, error: true },
        });

        // basic debouncing here
        keyStrokeTimeoutRef.current = setTimeout(async () => {
          const data = props; // Fix eslint value is missing in prop-types for JS files
          const isValid = await validateName(data.value.toString());
          apiRef.current.setEditCellProps({
            id,
            field,
            props: { ...props, error: !isValid },
          });
        }, 100);

        event.stopPropagation();
      }
    },
    [apiRef],
  );

  React.useEffect(() => {
    return () => {
      clearTimeout(promiseTimeout);
      clearTimeout(keyStrokeTimeoutRef.current);
    };
  }, []);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <XGrid
        className={classes.root}
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        onEditCellChange={handleEditCellChange}
        isCellEditable={(params) => params.row.id === 5}
      />
    </div>
  );
}

const columns = [
  { field: 'name', headerName: 'MUI Contributor', width: 180, editable: true },
];

const rows = [
  {
    id: 1,
    name: 'Damien',
  },
  {
    id: 2,
    name: 'Olivier',
  },
  {
    id: 3,
    name: 'Danail',
  },
  {
    id: 4,
    name: 'Matheus',
  },
  {
    id: 5,
    name: 'You?',
  },
];