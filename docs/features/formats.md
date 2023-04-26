<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

</script>

# Formats

These helper functions are provided for convenience as a **tickFormat** option for the [axis mark](../marks/axis.md), as the **text** option for a [text mark](../marks/text.md), or other use. See also [d3-format](https://github.com/d3/d3-format), [d3-time-format](https://github.com/d3/d3-time-format), and JavaScript’s built-in [date formatting](https://observablehq.com/@mbostock/date-formatting) and [number formatting](https://observablehq.com/@mbostock/number-formatting).

## formatIsoDate(*date*)

```js
Plot.formatIsoDate(new Date("2020-01-01T00:00:00.000Z")) // "2020-01-01"
```

Given a *date*, returns the shortest equivalent ISO 8601 UTC string. If the given *date* is not valid, returns `"Invalid Date"`. See [isoformat](https://github.com/mbostock/isoformat).

## formatWeekday(*locale*, *format*)

:::plot https://observablehq.com/@observablehq/plot-format-helpers
```js
Plot.textX(d3.range(7)).plot({x: {tickFormat: Plot.formatWeekday()}})
```
:::

```js
Plot.formatWeekday("es-MX", "long")(0) // "domingo"
```

Returns a function that formats a given week day number (from 0 = Sunday to 6 = Saturday) according to the specified *locale* and *format*. The *locale* is a [BCP 47 language tag](https://tools.ietf.org/html/bcp47) and defaults to U.S. English. The *format* is a [weekday format](https://tc39.es/ecma402/#datetimeformat-objects): either *narrow*, *short*, or *long*; if not specified, it defaults to *short*.

## formatMonth(*locale*, *format*)

:::plot https://observablehq.com/@observablehq/plot-format-helpers
```js
Plot.textX(d3.range(12)).plot({x: {tickFormat: Plot.formatMonth(), ticks: 12}})
```
:::

```js
Plot.formatMonth("es-MX", "long")(0) // "enero"
```

Returns a function that formats a given month number (from 0 = January to 11 = December) according to the specified *locale* and *format*. The *locale* is a [BCP 47 language tag](https://tools.ietf.org/html/bcp47) and defaults to U.S. English. The *format* is a [month format](https://tc39.es/ecma402/#datetimeformat-objects): either *2-digit*, *numeric*, *narrow*, *short*, *long*; if not specified, it defaults to *short*.
