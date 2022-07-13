const bpmr = require('babel-plugin-module-resolver');
const fse = require('fs-extra');

function resolvePath(sourcePath, currentFile, opts) {
  if (sourcePath === 'markdown') {
    const base = currentFile.substring(__dirname.length).slice(0, -3);
    return `${__dirname}/docs/src/${base}/`;
  }

  return bpmr.resolvePath(sourcePath, currentFile, opts);
}

const alias = {
  '@mui/x-data-grid': '../packages/grid/x-data-grid/src',
  '@mui/x-data-grid-generator': '../packages/grid/x-data-grid-generator/src',
  '@mui/x-data-grid-pro': '../packages/grid/x-data-grid-pro/src',
  '@mui/x-data-grid-premium': '../packages/grid/x-data-grid-premium/src',
  '@mui/x-date-pickers': '../packages/x-date-pickers/src',
  '@mui/x-date-pickers-pro': '../packages/x-date-pickers-pro/src',
  '@mui/x-license-pro': '../packages/x-license-pro/src',
  '@mui/docs': '../node_modules/@mui/monorepo/packages/mui-docs/src',
  '@mui/markdown': '../node_modules/@mui/monorepo/docs/packages/markdown',
  '@mui/monorepo': '../node_modules/@mui/monorepo',
  '@mui/joy': '../node_modules/@mui/monorepo/packages/mui-joy/src',
  docs: '../node_modules/@mui/monorepo/docs', // TODO remove
  docsx: './',
};

const { version: transformRuntimeVersion } = fse.readJSONSync(
  require.resolve('@babel/runtime-corejs2/package.json'),
);

module.exports = {
  presets: [
    // backport of https://github.com/zeit/next.js/pull/9511
    ['next/babel', { 'transform-runtime': { corejs: 2, version: transformRuntimeVersion } }],
  ],
  plugins: [
    [
      'babel-plugin-transform-rename-import',
      {
        replacements: [{ original: '@mui/utils/macros/MuiError.macro', replacement: 'react' }],
      },
    ],
    'babel-plugin-optimize-clsx',
    // for IE 11 support
    '@babel/plugin-transform-object-assign',
    'babel-plugin-preval',
    [
      'babel-plugin-module-resolver',
      {
        alias,
        transformFunctions: ['require', 'require.context'],
        resolvePath,
      },
    ],
  ],
  ignore: [
    // Fix a Windows issue.
    /@babel[\\|/]runtime/,
    // Fix const foo = /{{(.+?)}}/gs; crashing.
    /prettier/,
    /@mui[\\|/]docs[\\|/]markdown/,
  ],
  env: {
    production: {
      plugins: [
        // TODO fix useGridSelector side effect and enable back.
        // '@babel/plugin-transform-react-constant-elements',
        ['babel-plugin-react-remove-properties', { properties: ['data-mui-test'] }],
        ['babel-plugin-transform-react-remove-prop-types', { mode: 'remove' }],
      ],
    },
  },
};
