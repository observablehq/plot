<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";

const stocks = shallowRef([]);

onMounted(() => {
  Promise.all([
    d3.csv("../data/aapl.csv", d3.autoType),
    d3.csv("../data/amzn.csv", d3.autoType),
    d3.csv("../data/goog.csv", d3.autoType),
    d3.csv("../data/ibm.csv", d3.autoType)
  ]).then((datas) => {
    stocks.value = d3.zip(["AAPL", "AMZN", "GOOG", "IBM"], datas).flatMap(([Symbol, data]) => data.map(d => ({Symbol, ...d})));
  });
});

</script>

# Select transform

The **select transform** filters a mark’s index; it is like the [filter transform](../transforms/filter.md), except that it provides convenient shorthand for pulling a single value out of each series. The data are grouped into series using the **z**, **fill**, or **stroke** channel in the same fashion as the [area](../marks/area.md) and [line](../marks/line.md) marks.

For example, here the select transform is used to label the last point in each series of a multi-series line chart with a [text mark](../marks/text.md).

:::plot defer
```js
Plot.plot({
  marginRight: 40,
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

Selects the points of each series selected by the *selector*, which can be specified either as a function which receives as input the index of the series, the shorthand “first” or “last”, or as a {*key*: *value*} object with exactly one *key* being the name of a channel and the *value* being a function which receives as input the index of the series and the channel values. The *value* may alternatively be specified as the shorthand “min” and “max” which respectively select the minimum and maximum points for the specified channel.

For example, to select the point within each series that is the closest to the median of the *y* channel:

```js
Plot.select({
  y: (I, V) => {
    const median = d3.median(I, i => V[i]);
    const i = d3.least(I, i => Math.abs(V[i] - median));
    return [i];
  }
}, {
  x: "year",
  y: "revenue",
  fill: "format"
})
```

To pick three points at random in each series:

```js
Plot.select(I => d3.shuffle(I.slice()).slice(0, 3), {z: "year", ...})
```

To pick the point in each city with the highest temperature:

```js
Plot.select({fill: "max"}, {x: "date", y: "city", fill: "temperature", z: "city"})
```

## selectFirst(*options*)

Selects the first point of each series according to input order.

## selectLast(*options*)

Selects the last point of each series according to input order.

## selectMinX(*options*)

Selects the leftmost point of each series.

## selectMinY(*options*)

Selects the lowest point of each series.

## selectMaxX(*options*)

Selects the rightmost point of each series.

## selectMaxY(*options*)

Selects the highest point of each series.
