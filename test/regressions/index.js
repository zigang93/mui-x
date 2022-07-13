import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LicenseInfo } from '@mui/x-data-grid-pro';
import TestViewer from 'test/regressions/TestViewer';
import { useFakeTimers } from 'sinon';
import addons, { mockChannel } from '@storybook/addons';

// See https://storybook.js.org/docs/react/workflows/faq#why-is-there-no-addons-channel
addons.setChannel(mockChannel());

// Remove the license warning from demonstration purposes
LicenseInfo.setLicenseKey(
  '61628ce74db2c1b62783a6d438593bc5Tz1NVUktRG9jLEU9MTY4MzQ0NzgyMTI4NCxTPXByZW1pdW0sTE09c3Vic2NyaXB0aW9uLEtWPTI=',
);

const blacklist = [
  /^docs-(.*)(?<=NoSnap)\.png$/, // Excludes demos that we don't want
  'docs-data-grid-filtering/RemoveBuiltInOperators.png', // Needs interaction
  'docs-data-grid-filtering/CustomRatingOperator.png', // Needs interaction
  'docs-data-grid-filtering/CustomInputComponent.png', // Needs interaction
  'docs-date-pickers-date-picker/CustomInput.png', // Redundant
  'docs-date-pickers-date-picker/ResponsiveDatePickers.png', // Redundant
  'docs-date-pickers-date-picker/ServerRequestDatePicker.png', // Redundant
  'docs-date-pickers-date-picker/ViewsDatePicker.png', // Redundant
  'docs-date-pickers-date-range-picker/CalendarsDateRangePicker.png', // Redundant
  'docs-date-pickers-date-range-picker/CustomDateRangeInputs.png', // Redundant
  'docs-date-pickers-date-range-picker/MinMaxDateRangePicker.png', // Redundant
  'docs-date-pickers-date-range-picker/ResponsiveDateRangePicker.png', // Redundant
  'docs-date-pickers-date-time-picker/BasicDateTimePicker.png', // Redundant
  'docs-date-pickers-date-time-picker/ResponsiveDateTimePickers.png', // Redundant
  'docs-date-pickers-localization/LocalizedTimePicker.png', // Redundant
  'docs-date-pickers-localization/LocalizedDatePicker.png', // Redundant
  'docs-date-pickers-time-picker/ResponsiveTimePickers.png', // Redundant
  // 'docs-system-typography',
  /^stories(.*)(?<!Snap)\.png$/, // Excludes stories that aren't suffixed with 'Snap'.
];

const unusedBlacklistPatterns = new Set(blacklist);

// Use a "real timestamp" so that we see a useful date instead of "00:00"
// eslint-disable-next-line react-hooks/rules-of-hooks -- not a React hook
const clock = useFakeTimers(new Date('Mon Aug 18 14:11:54 2014 -0500'));

function excludeTest(suite, name) {
  return blacklist.some((pattern) => {
    if (typeof pattern === 'string') {
      if (pattern === suite) {
        unusedBlacklistPatterns.delete(pattern);

        return true;
      }
      if (pattern === `${suite}/${name}.png`) {
        unusedBlacklistPatterns.delete(pattern);

        return true;
      }

      return false;
    }

    // assume regex
    if (pattern.test(`${suite}/${name}.png`)) {
      unusedBlacklistPatterns.delete(pattern);
      return true;
    }
    return false;
  });
}

// Get all the tests specifically written for preventing regressions.
const requireStories = require.context('packages/storybook/src/stories', true, /\.(js|ts|tsx)$/);
const stories = requireStories.keys().reduce((res, path) => {
  let suite = path
    .replace('./', '')
    .replace('.stories', '')
    .replace(/\.\w+$/, '');
  suite = `stories-${suite}`;

  const cases = requireStories(path);

  Object.keys(cases).forEach((name) => {
    if (name !== 'default' && !excludeTest(suite, name)) {
      res.push({
        path,
        suite,
        name,
        case: cases[name],
      });
    }
  });

  return res;
}, []);

// Also use some of the demos to avoid code duplication.
const requireDocs = require.context('docsx/data', true, /js$/);
const docs = requireDocs.keys().reduce((res, path) => {
  const [name, ...suiteArray] = path.replace('./', '').replace('.js', '').split('/').reverse();
  const suite = `docs-${suiteArray.reverse().join('-')}`;

  if (excludeTest(suite, name)) {
    return res;
  }

  res.push({
    path,
    suite,
    name,
    case: requireDocs(path).default,
  });

  return res;
}, []);

clock.restore();

const tests = stories.concat(docs);

if (unusedBlacklistPatterns.size > 0) {
  console.warn(
    [
      'The following patterns are unused:',
      ...Array.from(unusedBlacklistPatterns).map((pattern) => `- ${pattern}`),
    ].join('\n'),
  );
}

function App() {
  function computeIsDev() {
    if (window.location.hash === '#dev') {
      return true;
    }
    if (window.location.hash === '#no-dev') {
      return false;
    }
    return process.env.NODE_ENV === 'development';
  }
  const [isDev, setDev] = React.useState(computeIsDev);
  React.useEffect(() => {
    function handleHashChange() {
      setDev(computeIsDev());
    }
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  function computePath(test) {
    return `/${test.suite}/${test.name}`;
  }

  return (
    <Router>
      <Routes>
        {tests.map((test) => {
          const path = computePath(test);
          const TestCase = test.case;
          if (TestCase === undefined) {
            console.warn('Missing test.case for ', test);
            return null;
          }

          let isDataGridTest = false;
          if (path.indexOf('/docs-data-grid') === 0 || path.indexOf('/stories-') === 0) {
            isDataGridTest = true;
          }

          return (
            <Route
              key={path}
              exact
              path={path}
              element={
                <TestViewer isDataGridTest={isDataGridTest}>
                  <TestCase />
                </TestViewer>
              }
            />
          );
        })}
      </Routes>
      <div hidden={!isDev}>
        <p>
          Devtools can be enabled by appending <code>#dev</code> in the addressbar or disabled by
          appending <code>#no-dev</code>.
        </p>
        <a href="#no-dev">Hide devtools</a>
        <details>
          <summary id="my-test-summary">nav for all tests</summary>
          <nav id="tests">
            <ol>
              {tests.map((test) => {
                const path = computePath(test);
                return (
                  <li key={path}>
                    <Link to={path}>{path}</Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </details>
      </div>
    </Router>
  );
}

ReactDOM.render(<App />, document.getElementById('react-root'));
