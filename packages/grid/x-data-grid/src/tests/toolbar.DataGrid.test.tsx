import * as React from 'react';
// @ts-ignore Remove once the test utils are typed
import { createRenderer, fireEvent, screen } from '@mui/monorepo/test/utils';
import { getColumnHeadersTextContent } from 'test/utils/helperFn';
import { expect } from 'chai';
import { DataGrid, DataGridProps, GridToolbar, gridClasses } from '@mui/x-data-grid';
import {
  COMFORTABLE_DENSITY_FACTOR,
  COMPACT_DENSITY_FACTOR,
} from '../hooks/features/density/useGridDensity';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe('<DataGrid /> - Toolbar', () => {
  const { render } = createRenderer();

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
    columns: [
      {
        field: 'id',
      },
      {
        field: 'brand',
      },
    ],
  };

  describe('density selector', () => {
    it('should increase grid density when selecting compact density', () => {
      const rowHeight = 30;
      const { getByText } = render(
        <div style={{ width: 300, height: 300 }}>
          <DataGrid
            {...baselineProps}
            components={{
              Toolbar: GridToolbar,
            }}
            rowHeight={rowHeight}
          />
        </div>,
      );

      fireEvent.click(getByText('Density'));
      fireEvent.click(getByText('Compact'));

      expect(screen.getAllByRole('row')[1]).toHaveInlineStyle({
        maxHeight: `${Math.floor(rowHeight * COMPACT_DENSITY_FACTOR)}px`,
      });

      expect(screen.getAllByRole('cell')[1]).toHaveInlineStyle({
        maxHeight: `${Math.floor(rowHeight * COMPACT_DENSITY_FACTOR)}px`,
      });
    });

    it('should decrease grid density when selecting comfortable density', () => {
      const rowHeight = 30;
      const { getByText } = render(
        <div style={{ width: 300, height: 300 }}>
          <DataGrid
            {...baselineProps}
            components={{
              Toolbar: GridToolbar,
            }}
            rowHeight={rowHeight}
          />
        </div>,
      );

      fireEvent.click(getByText('Density'));
      fireEvent.click(getByText('Comfortable'));

      expect(screen.getAllByRole('row')[1]).toHaveInlineStyle({
        maxHeight: `${Math.floor(rowHeight * COMFORTABLE_DENSITY_FACTOR)}px`,
      });

      expect(screen.getAllByRole('cell')[1]).toHaveInlineStyle({
        maxHeight: `${Math.floor(rowHeight * COMFORTABLE_DENSITY_FACTOR)}px`,
      });
    });

    it('should increase grid density even if toolbar is not enabled', () => {
      const rowHeight = 30;
      render(
        <div style={{ width: 300, height: 300 }}>
          <DataGrid {...baselineProps} rowHeight={rowHeight} density="compact" />
        </div>,
      );

      expect(screen.getAllByRole('row')[1]).toHaveInlineStyle({
        maxHeight: `${Math.floor(rowHeight * COMPACT_DENSITY_FACTOR)}px`,
      });

      expect(screen.getAllByRole('cell')[1]).toHaveInlineStyle({
        maxHeight: `${Math.floor(rowHeight * COMPACT_DENSITY_FACTOR)}px`,
      });
    });

    it('should decrease grid density even if toolbar is not enabled', () => {
      const rowHeight = 30;
      render(
        <div style={{ width: 300, height: 300 }}>
          <DataGrid {...baselineProps} rowHeight={rowHeight} density="comfortable" />
        </div>,
      );

      expect(screen.getAllByRole('row')[1]).toHaveInlineStyle({
        maxHeight: `${Math.floor(rowHeight * COMFORTABLE_DENSITY_FACTOR)}px`,
      });

      expect(screen.getAllByRole('cell')[1]).toHaveInlineStyle({
        maxHeight: `${Math.floor(rowHeight * COMFORTABLE_DENSITY_FACTOR)}px`,
      });
    });

    it('should apply to the root element a class corresponding to the current density', () => {
      const Test = (props: Partial<DataGridProps>) => (
        <div style={{ width: 300, height: 300 }}>
          <DataGrid {...baselineProps} {...props} />
        </div>
      );
      const { setProps } = render(<Test />);
      expect(screen.getByRole('grid')).to.have.class(gridClasses['root--densityStandard']);
      setProps({ density: 'compact' });
      expect(screen.getByRole('grid')).to.have.class(gridClasses['root--densityCompact']);
      setProps({ density: 'comfortable' });
      expect(screen.getByRole('grid')).to.have.class(gridClasses['root--densityComfortable']);
    });
  });

  describe('column selector', () => {
    it('should hide "id" column when hiding it from the column selector', () => {
      const { getByText } = render(
        <div style={{ width: 300, height: 300 }}>
          <DataGrid
            {...baselineProps}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'brand']);

      fireEvent.click(getByText('Columns'));
      fireEvent.click(document.querySelector('[role="tooltip"] [name="id"]'));

      expect(getColumnHeadersTextContent()).to.deep.equal(['brand']);
    });

    it('should hide all columns when clicking "HIDE ALL" from the column selector', () => {
      const { getByText } = render(
        <div style={{ width: 300, height: 300 }}>
          <DataGrid
            {...baselineProps}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'brand']);

      fireEvent.click(getByText('Columns'));
      fireEvent.click(getByText('Hide all'));

      expect(getColumnHeadersTextContent()).to.deep.equal([]);
    });

    it('should show all columns when clicking "SHOW ALL" from the column selector (deprecated)', () => {
      const customColumns = [
        {
          field: 'id',
          hide: true,
        },
        {
          field: 'brand',
          hide: true,
        },
      ];

      const { getByText } = render(
        <div style={{ width: 300, height: 300 }}>
          <DataGrid
            {...baselineProps}
            columns={customColumns}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>,
      );

      fireEvent.click(getByText('Columns'));
      fireEvent.click(getByText('Show all'));

      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'brand']);
    });

    it('should show all columns when clicking "SHOW ALL" from the column selector', () => {
      const customColumns = [
        {
          field: 'id',
        },
        {
          field: 'brand',
        },
      ];

      const { getByText } = render(
        <div style={{ width: 300, height: 300 }}>
          <DataGrid
            {...baselineProps}
            columns={customColumns}
            components={{
              Toolbar: GridToolbar,
            }}
            initialState={{
              columns: {
                columnVisibilityModel: { id: false, brand: false },
              },
            }}
          />
        </div>,
      );

      fireEvent.click(getByText('Columns'));
      fireEvent.click(getByText('Show all'));

      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'brand']);
    });

    it('should keep the focus on the switch after toggling a column', () => {
      render(
        <div style={{ width: 300, height: 300 }}>
          <DataGrid
            {...baselineProps}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>,
      );

      const button = screen.getByRole('button', { name: 'Select columns' });
      button.focus();
      fireEvent.click(button);

      const column: HTMLElement | null = document.querySelector('[role="tooltip"] [name="id"]');
      column!.focus();
      fireEvent.click(column);

      expect(column).toHaveFocus();
    });
  });
});
