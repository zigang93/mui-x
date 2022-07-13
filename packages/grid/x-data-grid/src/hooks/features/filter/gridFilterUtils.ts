import * as React from 'react';
import {
  GridCellParams,
  GridFilterItem,
  GridFilterModel,
  GridLinkOperator,
  GridRowId,
} from '../../../models';
import { GridApiCommunity } from '../../../models/api/gridApiCommunity';
import { GridStateCommunity } from '../../../models/gridStateCommunity';
import { GridAggregatedFilterItemApplier } from './gridFilterState';
import { buildWarning } from '../../../utils/warning';
import { gridColumnFieldsSelector, gridColumnLookupSelector } from '../columns';

type GridFilterItemApplier = {
  fn: (rowId: GridRowId) => boolean;
  item: GridFilterItem;
};

/**
 * Adds default values to the optional fields of a filter items.
 * @param {GridFilterItem} item The raw filter item.
 * @param {React.MutableRefObject<GridApiCommunity>} apiRef The API of the grid.
 * @return {GridFilterItem} The clean filter item with an uniq ID and an always-defined operatorValue.
 * TODO: Make the typing reflect the different between GridFilterInputItem and GridFilterItem.
 */
export const cleanFilterItem = (
  item: GridFilterItem,
  apiRef: React.MutableRefObject<GridApiCommunity>,
) => {
  const cleanItem: GridFilterItem = { ...item };

  if (cleanItem.id == null) {
    cleanItem.id = Math.round(Math.random() * 1e5);
  }

  if (cleanItem.operatorValue == null) {
    // Selects a default operator
    // We don't use `apiRef.current.getColumn` because it is not ready during state initialization
    const column = gridColumnLookupSelector(apiRef)[cleanItem.columnField];
    cleanItem.operatorValue = column && column!.filterOperators![0].value!;
  }

  return cleanItem;
};

const filterModelDisableMultiColumnsFilteringWarning = buildWarning(
  [
    'MUI: The `filterModel` can only contain a single item when the `disableMultipleColumnsFiltering` prop is set to `true`.',
    'If you are using the community version of the `DataGrid`, this prop is always `true`.',
  ],
  'error',
);

const filterModelMissingItemIdWarning = buildWarning(
  "MUI: The 'id' field is required on `filterModel.items` when you use multiple filters.",
  'error',
);

const filterModelMissingItemOperatorWarning = buildWarning([
  'MUI: One of your filtering item have no `operatorValue` provided.',
  'This property will become required on `@mui/x-data-grid@6.X`.',
]);

export const sanitizeFilterModel = (
  model: GridFilterModel,
  disableMultipleColumnsFiltering: boolean,
  apiRef: React.MutableRefObject<GridApiCommunity>,
) => {
  const hasSeveralItems = model.items.length > 1;

  let items: GridFilterItem[];
  if (hasSeveralItems && disableMultipleColumnsFiltering) {
    filterModelDisableMultiColumnsFilteringWarning();

    items = [model.items[0]];
  } else {
    items = model.items;
  }

  const hasItemsWithoutIds = hasSeveralItems && items.some((item) => item.id == null);
  const hasItemWithoutOperator = items.some((item) => item.operatorValue == null);

  if (hasItemsWithoutIds) {
    filterModelMissingItemIdWarning();
  }

  if (hasItemWithoutOperator) {
    filterModelMissingItemOperatorWarning();
  }

  if (hasItemWithoutOperator || hasItemsWithoutIds) {
    return {
      ...model,
      items: items.map((item) => cleanFilterItem(item, apiRef)),
    };
  }

  if (model.items !== items) {
    return {
      ...model,
      items,
    };
  }

  return model;
};

export const mergeStateWithFilterModel =
  (
    filterModel: GridFilterModel,
    disableMultipleColumnsFiltering: boolean,
    apiRef: React.MutableRefObject<GridApiCommunity>,
  ) =>
  (filteringState: GridStateCommunity['filter']): GridStateCommunity['filter'] => ({
    ...filteringState,
    filterModel: sanitizeFilterModel(filterModel, disableMultipleColumnsFiltering, apiRef),
  });

/**
 * Generates a method to easily check if a row is matching the current filter model.
 * @param {GridFilterModel} filterModel The model with which we want to filter the rows.
 * @param {React.MutableRefObject<GridApiCommunity>} apiRef The API of the grid.
 * @returns {GridAggregatedFilterItemApplier | null} A method that checks if a row is matching the current filter model. If `null`, we consider that all the rows are matching the filters.
 */
export const buildAggregatedFilterItemsApplier = (
  filterModel: GridFilterModel,
  apiRef: React.MutableRefObject<GridApiCommunity>,
): GridAggregatedFilterItemApplier | null => {
  const { items, linkOperator = GridLinkOperator.And } = filterModel;

  const getFilterCallbackFromItem = (filterItem: GridFilterItem): GridFilterItemApplier | null => {
    if (!filterItem.columnField || !filterItem.operatorValue) {
      return null;
    }

    const column = apiRef.current.getColumn(filterItem.columnField);
    if (!column) {
      return null;
    }
    let parsedValue;

    if (column.valueParser) {
      const parser = column.valueParser;
      parsedValue = Array.isArray(filterItem.value)
        ? filterItem.value?.map((x) => parser(x))
        : parser(filterItem.value);
    } else {
      parsedValue = filterItem.value;
    }
    const newFilterItem: GridFilterItem = { ...filterItem, value: parsedValue };

    const filterOperators = column.filterOperators;
    if (!filterOperators?.length) {
      throw new Error(`MUI: No filter operators found for column '${column.field}'.`);
    }

    const filterOperator = filterOperators.find(
      (operator) => operator.value === newFilterItem.operatorValue,
    )!;
    if (!filterOperator) {
      throw new Error(
        `MUI: No filter operator found for column '${column.field}' and operator value '${newFilterItem.operatorValue}'.`,
      );
    }

    const applyFilterOnRow = filterOperator.getApplyFilterFn(newFilterItem, column)!;
    if (typeof applyFilterOnRow !== 'function') {
      return null;
    }

    const fn = (rowId: GridRowId) => {
      const cellParams = apiRef.current.getCellParams(rowId, newFilterItem.columnField!);

      return applyFilterOnRow(cellParams);
    };

    return { fn, item: newFilterItem };
  };

  const appliers = items
    .map(getFilterCallbackFromItem)
    .filter((callback): callback is GridFilterItemApplier => !!callback);

  if (appliers.length === 0) {
    return null;
  }

  return (rowId, shouldApplyFilter) => {
    const filteredAppliers = shouldApplyFilter
      ? appliers.filter((applier) => shouldApplyFilter(applier.item.columnField))
      : appliers;

    // Return `false` as soon as we have a failing filter
    if (linkOperator === GridLinkOperator.And) {
      return filteredAppliers.every((applier) => applier.fn(rowId));
    }

    // Return `true` as soon as we have a passing filter
    return filteredAppliers.some((applier) => applier.fn(rowId));
  };
};

/**
 * Generates a method to easily check if a row is matching the current quick filter.
 * @param {any[]} values The model with which we want to filter the rows.
 * @param {React.MutableRefObject<GridApiCommunity>} apiRef The API of the grid.
 * @returns {GridAggregatedFilterItemApplier | null} A method that checks if a row is matching the current filter model. If `null`, we consider that all the rows are matching the filters.
 */
export const buildAggregatedQuickFilterApplier = (
  filterModel: GridFilterModel,
  apiRef: React.MutableRefObject<GridApiCommunity>,
): GridAggregatedFilterItemApplier | null => {
  const { quickFilterValues = [], quickFilterLogicOperator = GridLinkOperator.And } = filterModel;
  if (quickFilterValues.length === 0) {
    return null;
  }

  const columnsFields = gridColumnFieldsSelector(apiRef);

  const appliersPerColumnField: {
    [field: string]: (null | ((params: GridCellParams) => boolean))[];
  } = {};
  columnsFields.forEach((field) => {
    const column = apiRef.current.getColumn(field);
    const getApplyQuickFilterFn = column?.getApplyQuickFilterFn;
    if (!getApplyQuickFilterFn) {
      return;
    }
    appliersPerColumnField[field] = quickFilterValues.map((value) =>
      getApplyQuickFilterFn(value, column, apiRef),
    );
  });

  // If some value does not have an applier we ignore them
  const sanitizedQuickFilterValues = quickFilterValues.filter((value, index) =>
    Object.keys(appliersPerColumnField).some(
      (field) => appliersPerColumnField[field][index] != null,
    ),
  );

  return (rowId, shouldApplyFilter) => {
    const usedCellParams: { [field: string]: GridCellParams } = {};
    const columnsFieldsToFilter: string[] = [];

    Object.keys(appliersPerColumnField).forEach((columnField) => {
      if (!shouldApplyFilter || shouldApplyFilter(columnField)) {
        usedCellParams[columnField] = apiRef.current.getCellParams(rowId, columnField);
        columnsFieldsToFilter.push(columnField);
      }
    });
    // Return `false` as soon as we have a quick filter value that does not match any column
    if (quickFilterLogicOperator === GridLinkOperator.And) {
      return sanitizedQuickFilterValues.every((value, index) =>
        columnsFieldsToFilter.some((field) => {
          if (appliersPerColumnField[field][index] == null) {
            return false;
          }
          return appliersPerColumnField[field][index]?.(usedCellParams[field]);
        }),
      );
    }

    // Return `true` as soon as we have have a quick filter value that match any column
    return sanitizedQuickFilterValues.some((value, index) =>
      columnsFieldsToFilter.some((field) => {
        if (appliersPerColumnField[field][index] == null) {
          return false;
        }
        return appliersPerColumnField[field][index]?.(usedCellParams[field]);
      }),
    );
  };
};

export const buildAggregatedFilterApplier = (
  filterModel: GridFilterModel,
  apiRef: React.MutableRefObject<GridApiCommunity>,
): GridAggregatedFilterItemApplier | null => {
  const isRowMatchingFilterItems = buildAggregatedFilterItemsApplier(filterModel, apiRef);
  const isRowMatchingQuickFilter = buildAggregatedQuickFilterApplier(filterModel, apiRef);

  if (isRowMatchingFilterItems == null && isRowMatchingQuickFilter == null) {
    return null;
  }

  if (isRowMatchingFilterItems == null) {
    return isRowMatchingQuickFilter;
  }

  if (isRowMatchingQuickFilter == null) {
    return isRowMatchingFilterItems;
  }

  return (rowId, shouldApplyFilter) =>
    isRowMatchingFilterItems(rowId, shouldApplyFilter) &&
    isRowMatchingQuickFilter(rowId, shouldApplyFilter);
};
