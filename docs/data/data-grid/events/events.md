---
title: Data Grid - Events
---

# Data grid - Events [<span class="plan-pro"></span>](https://mui.com/store/items/mui-x-pro/)

<p class="description">The data grid emits events that can be subscribed to attach custom behavior.</p>

## Subscribing to events

You can subscribe to one of the [events emitted](/x/react-data-grid/events/#catalog-of-events) by calling `apiRef.current.subscribeEvent()` with the name of the event and a handler. The handler will be called with three arguments:

1. an object with information related to the event
2. a `MuiEvent` containing the DOM event or the React synthetic event, when available
3. a `GridCallbackDetails` containing the `GridApi` only if `DataGridPro` is being used.

```tsx
/**
 * Allows to register a handler for an event.
 * @param event The name of event
 * @param handler The handler to be called
 * @param options Additional options for this listener
 * @returns A function to unsubscribe from this event
 */
subscribeEvent: (
    event: GridEventsStr,
    handler: (params: any, event: MuiEvent, details: GridCallbackDetails) => void,
    options?: EventListenerOptions,
) => () => void;
```

The following demo shows how to subscribe to the `columnResize` event. Try it by resizing the columns.

{{"demo": "SubscribeToEvents.js", "bg": "inline"}}

## Disabling the default behavior

Depending on the use case, it might be necessary to disable the default action taken by an event.
The `MuiEvent` passed to the event handler has a `defaultMuiPrevented` property to control when the default behavior can be executed or not.
Set it to `true` to block the default handling of an event and implement your own.

```tsx
<DataGrid
  onCellClick={(params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
    event.defaultMuiPrevented = true;
  }}
/>
```

Usually, double clicking a cell will put it into [edit mode](/x/react-data-grid/editing/).
The following example changes this behavior by also requiring <kbd class="key">Ctrl</kbd> to be pressed.

{{"demo": "DoubleClickWithCtrlToEdit.js", "bg": "inline"}}

## Catalog of events

{{"demo": "CatalogOfEventsNoSnap.js", "bg": "inline", "hideToolbar": true}}

## API

- [DataGrid](/x/api/data-grid/data-grid/)
- [DataGridPro](/x/api/data-grid/data-grid-pro/)
- [DataGridPremium](/x/api/data-grid/data-grid-premium/)
