---
title: Data Grid - Sorting
---

# Data grid - Sorting

<p class="description">Easily sort your rows based on one or several criteria.</p>

Sorting is enabled by default to the grid users and works out of the box without any explicit configuration.
Users can set a sorting rule simply by clicking on a column header.
Following clicks change the column's sorting direction. You can see the applied direction on the header's arrow indicator.

{{"demo": "BasicExampleDataGrid.js", "bg": "inline", "defaultCodeOpen": false}}

## Single and multi-sorting

:::warning
The `DataGrid` can only sort the rows according to one criterion at a time.

To use multi-sorting, you need to upgrade to [Pro](https://mui.com/store/items/mui-x-pro/) or [Premium](https://mui.com/store/items/mui-x-premium/) plan.
:::

## Multi-sorting [<span class="plan-pro"></span>](https://mui.com/store/items/mui-x-pro/)

The following demo lets you sort the rows according to several criteria at the same time.

Hold down the <kbd class="key">Ctrl</kbd> or <kbd class="key">Shift</kbd> (use <kbd class="key">⌘ Command</kbd> on macOS) key while clicking the column header.

{{"demo": "BasicExampleDataGridPro.js", "bg": "inline", "defaultCodeOpen": false}}

## Pass sorting rules to the grid

### Structure of the model

The sort model is a list of sorting items.
Each item represents a sorting rule and is composed of several elements:

- `sortingItem.field`: the field on which we want to apply the rule
- `sortingItem.sort`: the direction of the sorting (`'asc'`, `'desc'`, `null` or `undefined`). If `null` or `undefined`, the rule will not be applied.

### Initialize the sort model

Sorting is enabled by default to the user.
But if you want to set an initial sorting order, simply provide the model to the `initialState` prop.

```jsx
<DataGrid
  initialState={{
    sorting: {
      sortModel: [{ field: 'rating', sort: 'desc' }],
    },
  }}
/>
```

{{"demo": "InitialSort.js", "bg": "inline", "defaultCodeOpen": false}}

### Controlled sort model

Use the `sortModel` prop to control the state of the sorting rules.

You can use the `onSortModelChange` prop to listen to changes in the sorting rules and update the prop accordingly.

{{"demo": "ControlledSort.js", "bg": "inline", "defaultCodeOpen": false}}

## Disable the sorting

By default, all columns are sortable.
To disable sorting on a column, set the `sortable` property of `GridColDef` to `false`.
In the following demo, the user cannot use the _rating_ column as a sorting rule.

```tsx
<DataGrid columns={[...columns, { field: 'rating', sortable: false }]} />
```

{{"demo": "DisableSortingGrid.js", "bg": "inline", "defaultCodeOpen": false}}

## Custom comparator

A comparator determines how two cell values should be sorted.

Each column type comes with a default comparator method.
You can re-use them by importing the following functions:

- `gridStringOrNumberComparator` (used by the `string` and `singleSelect` columns)
- `gridNumberComparator` (used by the `number` and `boolean` columns)
- `gridDateComparator` (used by the `date` and `date-time` columns)

To extend or modify this behavior in a specific column, you can pass in a custom comparator, and override the `sortComparator` property of the `GridColDef` interface.

### Create a comparator from scratch

In the following demo, the "Created on" column sorting is based on the day of the month of the `createdOn` field.
It is a fully custom sorting comparator.

{{"demo": "FullyCustomSortComparator.js", "bg": "inline", "defaultCodeOpen": false}}

### Combine built-in comparators

In the following demo, the "Name" column combines the `name` and `isAdmin` fields.
The sorting is based on `isAdmin` and then on `name`, if necessary. It re-uses the built-in sorting comparator.

{{"demo": "ExtendedSortComparator.js", "bg": "inline", "defaultCodeOpen": false}}

## Custom sort order

By default, the sort order cycles between these three different modes:

```jsx
const sortingOrder = ['asc', 'desc', null];
```

In practice, when you click a column that is not sorted, it will sort ascending (`asc`).
The next click will make it sort descending (`desc`). Another click will remove the sort (`null`), reverting to the order that the data was provided in.

### For all columns

The default sort order can be overridden for all columns with the `sortingOrder` prop.
In the following demo, columns are only sortable in descending or ascending order.

{{"demo": "OrderSortingGrid.js", "bg": "inline", "defaultCodeOpen": false}}

### Per column

Sort order can be configured (and overridden) on a per-column basis by setting the `sortingOrder` property of the `GridColDef` interface:

```tsx
const columns: GridColDef = [
  { field: 'rating', sortingOrder: ['desc', 'asc', null] },
];
```

{{"demo": "OrderSortingPerColumnGrid.js", "bg": "inline", "defaultCodeOpen": false}}

## Server-side sorting

Sorting can be run server-side by setting the `sortingMode` prop to `server`, and implementing the `onSortModelChange` handler.

{{"demo": "ServerSortingGrid.js", "bg": "inline"}}

## apiRef [<span class="plan-pro"></span>](https://mui.com/store/items/mui-x-pro/)

:::warning
Only use this API as the last option. Give preference to the props to control the grid.
:::

{{"demo": "SortingApiNoSnap.js", "bg": "inline", "hideToolbar": true}}

## Selectors [<span class="plan-pro"></span>](https://mui.com/store/items/mui-x-pro/)

{{"demo": "SortingSelectorsNoSnap.js", "bg": "inline", "hideToolbar": true}}

More information about the selectors and how to use them on the [dedicated page](/x/react-data-grid/state/#access-the-state)

## API

- [DataGrid](/x/api/data-grid/data-grid/)
- [DataGridPro](/x/api/data-grid/data-grid-pro/)
- [DataGridPremium](/x/api/data-grid/data-grid-premium/)
