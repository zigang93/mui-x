---
title: Data Grid - Selection
---

# Data grid - Selection

<p class="description">Selection allows the user to select and highlight a number of rows that they can then take action on.</p>

## Row selection

Row selection can be performed with a simple mouse click, or using the [keyboard shortcuts](/x/react-data-grid/accessibility/#selection). The grid supports single and multiple row selection.

### Single row selection

Single row selection is enabled by default with the `DataGrid` component.
To unselect a row, hold the <kbd class="key">Ctrl</kbd> key and click on it.

{{"demo": "SingleRowSelectionGrid.js", "bg": "inline"}}

### Multiple row selection [<span class="plan-pro"></span>](https://mui.com/store/items/mui-x-pro/)

On the `DataGridPro` component, you can select multiple rows in two ways:

- To select multiple independent rows, hold the <kbd class="key">Ctrl</kbd> key while selecting rows.
- To select a range of rows, hold the <kbd class="key">SHIFT</kbd> key while selecting rows.
- To disable multiple row selection, use `disableMultipleSelection={true}`.

{{"demo": "MultipleRowSelectionGrid.js", "disableAd": true, "bg": "inline"}}

## Checkbox selection

To activate checkbox selection set `checkboxSelection={true}`.

{{"demo": "CheckboxSelectionGrid.js", "bg": "inline"}}

### Custom checkbox column

If you provide a custom checkbox column to the grid with the `GRID_CHECKBOX_SELECTION_FIELD` field, the grid will not add its own.

We strongly recommend to use the `GRID_CHECKBOX_SELECTION_COL_DEF` variable instead of re-defining all the custom properties yourself.

In the following demo, the checkbox column has been moved to the right and its width has been increased to 100px.

{{"demo": "CheckboxSelectionCustom.js", "bg": "inline"}}

:::warning
Always set the `checkboxSelection` prop to `true` even when providing a custom checkbox column.
Otherwise, the grid might remove your column.
:::

## Disable selection on click

You might have interactive content in the cells and need to disable the selection of the row on click. Use the `disableSelectionOnClick` prop in this case.

{{"demo": "DisableClickSelectionGrid.js", "bg": "inline"}}

## Disable selection on certain rows

Use the `isRowSelectable` prop to indicate if a row can be selected.
It's called with a `GridRowParams` object and should return a boolean value.
If not specified, all rows are selectable.

In the demo below only rows with quantity above 50000 can be selected:

{{"demo": "DisableRowSelection.js", "bg": "inline"}}

## Controlled selection

Use the `selectionModel` prop to control the selection.
Each time this prop changes, the `onSelectionModelChange` callback is called with the new selection value.

{{"demo": "ControlledSelectionGrid.js", "bg": "inline"}}

### Usage with server-side pagination

Using the controlled selection with `paginationMode="server"` may result in selected rows being lost when the page is changed.
This happens because the grid cross-checks with the `rows` prop and only calls `onSelectionModelChange` with existing row IDs.
Depending on your server-side implementation, when the page changes and the new value for the `rows` prop does not include previously selected rows, the grid will call `onSelectionModelChange` with an empty value.
To prevent this, enable the `keepNonExistentRowsSelected` prop to keep the rows selected even if they do not exist.

```tsx
<DataGrid keepNonExistentRowsSelected />
```

By using this approach, clicking in the **Select All** checkbox may still leave some rows selected.
It is up to you to clean the selection model, using the `selectionModel` prop.
The following demo shows the prop in action:

{{"demo": "ControlledSelectionServerPaginationGrid.js", "bg": "inline"}}

## apiRef [<span class="plan-pro"></span>](https://mui.com/store/items/mui-x-pro/)

The grid exposes a set of methods that enables all of these features using the imperative apiRef.

:::warning
Only use this API as the last option. Give preference to the props to control the grid.
:::

{{"demo": "SelectionApiNoSnap.js", "bg": "inline", "hideToolbar": true}}

## 🚧 Range selection [<span class="plan-premium"></span>](https://mui.com/store/items/mui-x-premium/)

:::warning
This feature isn't implemented yet. It's coming.

👍 Upvote [issue #208](https://github.com/mui/mui-x/issues/208) if you want to see it land faster.
:::

With this feature, you will be able to select ranges of cells across the Grid.

## API

- [DataGrid](/x/api/data-grid/data-grid/)
- [DataGridPro](/x/api/data-grid/data-grid-pro/)
- [DataGridPremium](/x/api/data-grid/data-grid-premium/)
