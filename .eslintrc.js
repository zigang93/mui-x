const baseline = require('@mui/monorepo/.eslintrc');
const path = require('path');

module.exports = {
  ...baseline,
  plugins: [...baseline.plugins, 'jsdoc', 'filenames'],
  settings: {
    'import/resolver': {
      webpack: {
        config: path.join(__dirname, './webpackBaseConfig.js'),
      },
    },
  },
  /**
   * Sorted alphanumerically within each group. built-in and each plugin form
   * their own groups.
   */
  rules: {
    ...baseline.rules,
    'import/prefer-default-export': 'off',
    // TODO move rule into the main repo once it has upgraded
    '@typescript-eslint/return-await': 'off',
    // TODO move rule into main repo to allow deep @mui/monorepo imports
    'no-restricted-imports': 'off',
    'jsdoc/require-param': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-param-type': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-param-name': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-param-description': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-returns': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-returns-type': ['error', { contexts: ['TSFunctionType'] }],
    'jsdoc/require-returns-description': ['error', { contexts: ['TSFunctionType'] }],
  },
  overrides: [
    ...baseline.overrides,
    {
      files: [
        // matching the pattern of the test runner
        '*.test.js',
        '*.test.ts',
        '*.test.tsx',
        'test/**',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: ['@testing-library/react', 'test/utils/index'],
          },
        ],
      },
    },
    {
      files: ['packages/grid/**/*.ts', 'packages/grid/**/*.js', 'docs/src/pages/**/*.tsx'],
      excludedFiles: [
        'packages/grid/x-data-grid/src/themeAugmentation/index.js', // TypeScript ignores JS files with the same name as the TS file
        'packages/grid/x-data-grid-pro/src/themeAugmentation/index.js',
        'packages/grid/x-data-grid-premium/src/themeAugmentation/index.js',
      ],
      rules: {
        'material-ui/no-direct-state-access': 'error',
      },
      parserOptions: { tsconfigRootDir: __dirname, project: ['./tsconfig.json'] },
    },
    {
      files: ['docs/data/**/*.js', 'docs/data/**/*.tsx'],
      rules: {
        'filenames/match-exported': ['error'],
      },
    },
    {
      files: ['packages/*/src/**/*{.ts,.tsx,.js}'],
      excludedFiles: ['*.d.ts', '*.spec.ts', '*.spec.tsx'],
      rules: {
        'material-ui/mui-name-matches-component-name': [
          'error',
          {
            customHooks: [
              'useDatePickerProcessedProps',
              'useDatePickerDefaultizedProps',
              'useTimePickerDefaultizedProps',
              'useDateTimePickerDefaultizedProps',
              'useDateRangePickerDefaultizedProps',
            ],
          },
        ],
      },
    },
    {
      files: ['packages/x-date-pickers/src/**/*{.ts,.tsx,.js}'],
      excludedFiles: ['*.d.ts', '*.spec.ts', '*.spec.tsx', '**.test.tx', '**.test.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: ['@mui/x-date-pickers'],
            patterns: ['@mui/x-date-pickers/*'],
          },
        ],
      },
    },
    {
      files: ['packages/x-date-pickers-pro/src/**/*{.ts,.tsx,.js}'],
      excludedFiles: ['*.d.ts', '*.spec.ts', '*.spec.tsx', '**.test.tx', '**.test.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: ['@mui/x-date-pickers-pro'],
            patterns: ['@mui/x-date-pickers-pro/*'],
          },
        ],
      },
    },
    {
      files: ['packages/x-license-pro/src/**/*{.ts,.tsx,.js}'],
      excludedFiles: ['*.d.ts', '*.spec.ts', '*.spec.tsx', '**.test.tx', '**.test.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: ['@mui/x-license-pro'],
            patterns: ['@mui/x-license-pro/*'],
          },
        ],
      },
    },
    {
      files: ['packages/grid/x-data-grid-pro/src/**/*{.ts,.tsx,.js}'],
      excludedFiles: ['*.d.ts', '*.spec.ts', '*.spec.tsx', '**.test.tx', '**.test.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: ['@mui/x-data-grid-pro'],
            patterns: ['@mui/x-data-grid-pro/*'],
          },
        ],
      },
    },
    {
      files: ['packages/grid/x-data-grid/src/**/*{.ts,.tsx,.js}'],
      excludedFiles: ['*.d.ts', '*.spec.ts', '*.spec.tsx', '**.test.tx', '**.test.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: ['@mui/x-data-grid'],
            patterns: ['@mui/x-data-grid/*'],
          },
        ],
      },
    },
    {
      files: ['packages/x-data-grid-generator/src/**/*{.ts,.tsx,.js}'],
      excludedFiles: ['*.d.ts', '*.spec.ts', '*.spec.tsx', '**.test.tx', '**.test.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: ['@mui/x-data-grid-generator'],
            patterns: ['@mui/x-data-grid-generator/*'],
          },
        ],
      },
    },
    {
      files: ['packages/grid/**/*{.ts,.tsx,.js}'],
      excludedFiles: [
        'packages/grid/x-data-grid-generator/**',
        '*.d.ts',
        '*.spec.ts',
        '*.spec.tsx',
        '**.test.tx',
        '**.test.tsx',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@mui/base',
                message: 'Use @mui/material instead',
              },
            ],
            patterns: [
              {
                group: ['@mui/base/*'],
                message: 'Use @mui/material instead',
              },
            ],
          },
        ],
      },
    },
  ],
};
