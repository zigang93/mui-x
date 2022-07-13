---
title: Data Grid - Localization
---

# Data grid - Localization

<p class="description">The data grid allows to support users from different locales, with formatting, RTL, and localized strings.</p>

The default locale of MUI is English (United States). If you want to use other locales, follow the instructions below.

## Translation keys

You can use the `localeText` prop to pass in your own text and translations.
You can find all the translation keys supported in [the source](https://github.com/mui/mui-x/blob/HEAD/packages/grid/x-data-grid/src/constants/localeTextConstants.ts)
in the GitHub repository.
In the following example, the labels of the density selector are customized.

{{"demo": "CustomLocaleTextGrid.js", "bg": "inline"}}

:::warning
It's important to note that because the data grid uses components from the Material UI library some translation keys need to be accessed using that component key.

One example is the table pagination component used in the grid footer when pagination is enabled. All the keys provided to the `MuiTablePagination` object are applied as props directly to the [`TablePagination`](/material-ui/api/table-pagination/) component.

```jsx
<DataGrid
  {...data}
  localeText={{
    MuiTablePagination: {
      labelDisplayedRows: ({ from, to, count }) =>
        `${from} - ${to} of more than ${count}`,
    },
  }}
/>
```

:::

## Locale text

The default locale of MUI is English (United States).

You can use the theme to configure the locale text:

```jsx
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, bgBG } from '@mui/x-data-grid';

const theme = createTheme(
  {
    palette: {
      primary: { main: '#1976d2' },
    },
  },
  bgBG,
);

<ThemeProvider theme={theme}>
  <DataGrid />
</ThemeProvider>;
```

Note that `createTheme` accepts any number of arguments.
If you are already using the [translations of the core components](/material-ui/guides/localization/#locale-text), you can add `bgBG` as a new argument.
The same import works for `DataGridPro` as it's an extension of `DataGrid`.

```jsx
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, bgBG } from '@mui/x-data-grid';
import { bgBG as pickersBgBG } from '@mui/x-date-pickers';
import { bgBG as coreBgBG } from '@mui/material/locale';

const theme = createTheme(
  {
    palette: {
      primary: { main: '#1976d2' },
    },
  },
  bgBG, // x-data-grid translations
  pickersBgBG, // x-date-pickers translations
  coreBgBG, // core translations
);

<ThemeProvider theme={theme}>
  <DataGrid />
</ThemeProvider>;
```

If you want to pass language translations directly to the grid without using `createTheme` and `ThemeProvider`, you can directly load the language translations from the `@mui/x-data-grid` or `@mui/x-data-grid-pro` package.

```jsx
import { DataGrid, nlNL } from '@mui/x-data-grid';

<DataGrid localeText={nlNL.components.MuiDataGrid.defaultProps.localeText} />;
```

### Supported locales

| Locale                  | BCP 47 language tag | Import name |
| :---------------------- | :------------------ | :---------- |
| Arabic (Sudan)          | ar-SD               | `arSD`      |
| Bulgarian               | bg-BG               | `bgBG`      |
| Czech                   | cs-CZ               | `csCZ`      |
| Danish                  | da-DK               | `daDK`      |
| Dutch                   | nl-NL               | `nlNL`      |
| English (United States) | en-US               | `enUS`      |
| Finnish                 | fi-FI               | `fiFI`      |
| French                  | fr-FR               | `frFR`      |
| German                  | de-DE               | `deDE`      |
| Greek                   | el-GR               | `elGR`      |
| Hebrew                  | he-IL               | `heIL`      |
| Hungarian               | hu-HU               | `huHU`      |
| Italian                 | it-IT               | `itIT`      |
| Japanese                | ja-JP               | `jaJP`      |
| Korean                  | ko-KR               | `koKR`      |
| Norwegian (Bokmål)      | nb-NO               | `nbNO`      |
| Persian                 | fa-IR               | `faIR`      |
| Polish                  | pl-PL               | `plPL`      |
| Portuguese (Brazil)     | pt-BR               | `ptBR`      |
| Romanian                | ro-RO               | `roRO`      |
| Russian                 | ru-RU               | `ruRU`      |
| Slovak                  | sk-SK               | `skSK`      |
| Spanish (Spain)         | es-ES               | `esES`      |
| Swedish                 | sv-SE               | `svSE`      |
| Turkish                 | tr-TR               | `trTR`      |
| Ukraine                 | uk-UA               | `ukUA`      |
| Simplified Chinese      | zh-CN               | `zhCN`      |

You can [find the source](https://github.com/mui/mui-x/tree/HEAD/packages/grid/x-data-grid/src/locales) in the GitHub repository.

To create your own translation or to customize the English text, copy this file to your project, make any changes needed and import the locale from there.
Note that these translations of the Data grid component depend on the [Localization strategy](/material-ui/guides/localization/) of the whole library.

## API

- [DataGrid](/x/api/data-grid/data-grid/)
- [DataGridPro](/x/api/data-grid/data-grid-pro/)
- [DataGridPremium](/x/api/data-grid/data-grid-premium/)
