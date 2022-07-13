---
title: React Date Picker（日期选择器）和 Time Picker（时间选择器）组件
components: TextField
githubLabel: 'component: DatePicker'
materialDesign: https://material.io/components/date-pickers
waiAria: https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/datepicker-dialog.html
packageName: '@mui/x-date-pickers'
---

# Date/Time pickers 日期/时间选择器

<p class="description">日期选择器和时间选择器提供了一个从事先设定好的日期集合中选择单个值的简单方法。</p>

- 在移动端，选择器最适合在确认对话框中展示。
- 若是内联显示，如在一个表单内展示，请考虑使用分段下拉按钮这样的紧凑型控件。

## React 组件

{{"demo": "MaterialUIPickers.js"}}

### 日期选择器

⚠️ 浏览器支持的原生输入控件[并不是完美的](https://caniuse.com/#feat=input-datetime)。

示例展示了当 `type="date"` 时的原生的日期选择器 。

- [date-fns](https://date-fns.org/)
- [Day.js](https://day.js.org/)
- [Luxon](https://moment.github.io/luxon/#/)
- [时间选择器](https://momentjs.com/)

{{"demo": "DatePickers.js"}}

```sh
// date-fns
npm install @date-io/date-fns
// or for Day.js
npm install @date-io/dayjs
// or for Luxon
npm install @date-io/luxon
// or for Moment.js
npm install @date-io/moment
```

这个例子通过 `type="datetime-local"` 实现了原生的日期和时间选择器。

```js
// date-fns
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// or for Day.js
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// or for Luxon
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
// or for Moment.js
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

function App({ children }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {children}
    </LocalizationProvider>
  );
}
```

## 原生的选择器

⚠️ 浏览器原生输入控件[并不完美](https://caniuse.com/#feat=input-datetime)。

这个例子通过 `type="time"` 实现了原生的时间选择器。

{{"demo": "TimePickers.js"}}
