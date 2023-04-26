<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import aapl from "../data/aapl.ts";

const stocks = shallowRef([]);

onMounted(() => {
  Promise.all([
    d3.csv("../data/amzn.csv", d3.autoType),
    d3.csv("../data/goog.csv", d3.autoType),
    d3.csv("../data/ibm.csv", d3.autoType)
  ]).then((datas) => {
    stocks.value = d3.zip(["AAPL", "AMZN", "GOOG", "IBM"], [aapl].concat(datas)).flatMap(([Symbol, data]) => data.map((d) => ({Symbol, ...d})));
  });
});

</script>

# Select transform

The **select transform** filters a mark’s index to show a subset of the data. It is a specialized [filter transform](./filter.md) that pulls a single value out of each series. For example, below selectLast is used to label the last value in a line chart.

:::plot https://observablehq.com/@observablehq/plot-value-labeled-line-chart
```js
Plot.plot({
  y: {grid: true},
  marks: [
    Plot.ruleY([0]),
    Plot.line(aapl, {x: "Date", y: "Close"}),
    Plot.text(aapl, Plot.selectLast({x: "Date", y: "Close", text: "Close", frameAnchor: "bottom", dy: -6}))
  ]
})
```
:::

The select transform uses input order, not natural order by value, to determine the meaning of *first* and *last*. Since this dataset is in reverse chronological order, the first element is the most recent.

Using selectMinY and selectMaxY, you can label the extreme values.

:::plot https://observablehq.com/@observablehq/plot-value-labeled-line-chart
```js
Plot.plot({
  y: {grid: true},
  marks: [
    Plot.ruleY([0]),
    Plot.line(aapl, {x: "Date", y: "Close"}),
    Plot.text(aapl, Plot.selectMinY({x: "Date", y: "Close", text: "Close", frameAnchor: "top", dy: 6})),
    Plot.text(aapl, Plot.selectMaxY({x: "Date", y: "Close", text: "Close", frameAnchor: "bottom", dy: -6}))
  ]
})
```
:::

The select transform groups data into series using the **z**, **fill**, or **stroke** channel in the same fashion as the [area](../marks/area.md) and [line](../marks/line.md) marks. Below, the select transform is used to label the last point in each series of a multi-series line chart.

:::plot defer https://observablehq.com/@observablehq/plot-labeled-multi-line-chart
```js
Plot.plot({
  style: "overflow: visible;",
  y: {grid: true},
  marks: [
    Plot.ruleY([0]),
    Plot.line(stocks, {x: "Date", y: "Close", stroke: "Symbol"}),
    Plot.text(stocks, Plot.selectLast({x: "Date", y: "Close", z: "Symbol", text: "Symbol", textAnchor: "start", dx: 3}))
  ]
})
```
:::

## select(*selector*, *options*)

```js
Plot.select("first", {x: "Date", y: "Close"}) // selectFirst
```
```js
Plot.select({y: "min"}, {x: "Date", y: "Close"}) // selectMinY
```

Selects the points in each series determined by the given *selector*, which is one of:

- a named selector, either *first* or *last*,
- a function which receives as input the series index, or
- a {*name*: *value*} object (with exactly one *name*).

In the last case, *name* is the name of a channel and *value* is a value selector, which is one of:

- a named selector, either *min* or *max*, or
- a function which receives as input the series index and the channel values.

For example, to select the point in each city with the highest temperature (“selectMaxFill”):

```js
Plot.select({fill: "max"}, {x: "date", y: "city", z: "city", fill: "temperature"})
```

A selector function must return the selected index: a subset of the passed-in series index. For example, selectFirst and selectMinY can be implemented using functions like so:

```js
Plot.select((I) => [I[0]], {x: "Date", y: "Close"}) // selectFirst
```
```js
Plot.select({y: (I, Y) => [d3.least(I, (i) => Y[i])]}, {x: "Date", y: "Close"}) // selectMinY
```

Or, to select the point within each series that is the closest to the median of **y**:

```js
Plot.select({y: selectorMedian}, {x: "year", y: "revenue", fill: "format"})
```

```js
function selectorMedian(I, V) {
  const median = d3.median(I, (i) => V[i]);
  const i = d3.least(I, (i) => Math.abs(V[i] - median));
  return [i];
}
```

## selectFirst(*options*)

```js
Plot.selectFirst({x: "Date", y: "Close"})
```

Selects the first point of each series according to input order.

## selectLast(*options*)

```js
Plot.selectLast({x: "Date", y: "Close"})
```

Selects the last point of each series according to input order.

## selectMinX(*options*)

```js
Plot.selectMinX({x: "Date", y: "Close"})
```

Selects the leftmost point of each series.

## selectMinY(*options*)

```js
Plot.selectMinY({x: "Date", y: "Close"})
```

Selects the lowest point of each series.

## selectMaxX(*options*)

```js
Plot.selectMaxX({x: "Date", y: "Close"})
```

Selects the rightmost point of each series.

## selectMaxY(*options*)

```js
Plot.selectMaxY({x: "Date", y: "Close"})
```

Selects the highest point of each series.
