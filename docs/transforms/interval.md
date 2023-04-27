<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import aapl from "../data/aapl.ts";

</script>

# Interval transform

:::tip
There’s also an [**interval** scale option](../features/scales.md#scale-transforms) for quantizing continuous data.
:::

The **interval transform** turns a quantitative or temporal *value* into a continuous extent [*start*, *stop*]. For example, if *value* is an instant in time, the interval transform could return a *start* of UTC midnight and a *stop* of the UTC midnight the following day.

The interval transform is often used for time-series bar charts. For example, consider the chart below of the daily trade volume of Apple stock. Because of the [barY mark](../marks/bar.md), the *x* scale is ordinal (*band*). And because the regularity of the data is not specified (*i.e.*, because Plot has no way of knowing that this is daily data), every distinct value must have its own label, leading to crowding. If a day were missing data, it would be difficult to spot! 👓

:::plot https://observablehq.com/@observablehq/plot-band-scale-interval
```js
Plot.plot({
  marginBottom: 80,
  x: {
    type: "band", // ⚠️ not utc
    tickRotate: -90,
    fontVariant: "tabular-nums",
    label: null
  },
  y: {
    transform: (d) => d / 1e6,
    label: "↑ Daily trade volume (millions)"
  },
  marks: [
    Plot.barY(aapl.slice(-40), {x: "Date", y: "Volume"}),
    Plot.ruleY([0])
  ]
})
```
:::

In contrast, a [rectY mark](../marks/rect.md) with the **interval** option and the *day* interval produces a temporal (*utc*) *x* scale. This allows Plot to compute ticks at meaningful intervals: here weekly boundaries, UTC midnight on Sundays. Furthermore, we can see that this isn’t truly daily data—it’s missing weekends and holidays when the stock market was closed.

:::plot https://observablehq.com/@observablehq/plot-temporal-interval-option
```js
Plot.plot({
  y: {
    grid: true,
    transform: (d) => d / 1e6,
    label: "↑ Daily trade volume (millions)"
  },
  marks: [
    Plot.rectY(aapl.slice(-40), {x: "Date", interval: "day", y: "Volume"}),
    Plot.ruleY([0])
  ]
})
```
:::

:::info
The interval transform is not a standalone transform, but an option on marks and scales.
:::

The meaning of the **interval** mark option depends on the associated mark, such as line, bar, rect, or dot. For example, for the [barY mark](../marks/bar.md), the **interval** option affects converts a singular *y* value into an interval [*y1*, *y2*]. In the contrived example below, notice that the vertical↕︎ extent of each bar spans an interval of 5 million, rather than extending to *y* = 0.

:::plot https://observablehq.com/@observablehq/plot-interval-bars
```js
Plot.plot({
  marginBottom: 80,
  x: {
    type: "band", // ⚠️ not utc
    tickRotate: -90,
    label: null,
    fontVariant: "tabular-nums"
  },
  y: {
    grid: true,
    transform: (d) => d / 1e6,
    label: "↑ Daily trade volume (millions)"
  },
  marks: [
    Plot.barY(aapl.slice(-40), {x: "Date", y: "Volume", interval: 5e6}),
    Plot.ruleY([0])
  ]
})
```
:::

While the **interval** option is most commonly specified as a named time interval or a number, it can also be specified as a [D3 time interval](https://github.com/d3/d3-time/blob/main/README.md#api-reference) or any object that implements *interval*.floor and *interval*.offset.
