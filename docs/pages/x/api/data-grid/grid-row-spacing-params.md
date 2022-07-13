# GridRowSpacingParams Interface

<p class="description">Object passed as parameter in the row `getRowSpacing` callback prop.</p>

## Import

```js
import { GridRowSpacingParams } from '@mui/x-data-grid-premium';
// or
import { GridRowSpacingParams } from '@mui/x-data-grid-pro';
// or
import { GridRowSpacingParams } from '@mui/x-data-grid';
```

## Properties

| Name                                                      | Type                                     | Description                                                                                                                   |
| :-------------------------------------------------------- | :--------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| <span class="prop-name">id</span>                         | <span class="prop-type">GridRowId</span> | The row id.                                                                                                                   |
| <span class="prop-name">indexRelativeToCurrentPage</span> | <span class="prop-type">number</span>    | Index of the row in the current page.<br />If the pagination is disabled, it will be the index relative to all filtered rows. |
| <span class="prop-name">isFirstVisible</span>             | <span class="prop-type">boolean</span>   | Whether this row is the first visible or not.                                                                                 |
| <span class="prop-name">isLastVisible</span>              | <span class="prop-type">boolean</span>   | Whether this row is the last visible or not.                                                                                  |
| <span class="prop-name">model</span>                      | <span class="prop-type">R</span>         | The row model.                                                                                                                |
