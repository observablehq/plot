<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";

const stateage = shallowRef([]);
const stocks = shallowRef([]);
const xy = Plot.normalizeX("sum", {z: "state", x: "population", y: "state"});

onMounted(() => {
  Promise.all([
    d3.csv("../data/aapl.csv", d3.autoType),
    d3.csv("../data/amzn.csv", d3.autoType),
    d3.csv("../data/goog.csv", d3.autoType),
    d3.csv("../data/ibm.csv", d3.autoType)
  ]).then((datas) => {
    stocks.value = d3.zip(["AAPL", "AMZN", "GOOG", "IBM"], datas).flatMap(([Symbol, data]) => data.map(d => ({Symbol, ...d})));
  });
  d3.csv("../data/us-population-state-age.csv", d3.autoType).then((data) => {
    const ages = data.columns.slice(1); // convert wide data to tidy data
    stateage.value = Object.assign(ages.flatMap(age => data.map((d) => ({state: d.name, age, population: d[age]}))), {ages});
  });
});

</script>

# Normalize transform

The **normalize transform** is a specialized [map transform](./map.md) that normalizes series values relative to some basis, say to convert absolute values into relative values. For example, here is an index chart—a type of multi-series line chart—showing the return of several stocks relative to their closing price on a particular date.

:::plot defer
```js
Plot.plot({
  style: "overflow: visible;",
  y: {
    type: "log",
    grid: true,
    label: "↑ Change in price (%)",
    tickFormat: ((f) => (x) => f((x - 1) * 100))(d3.format("+d"))
  },
  marks: [
    Plot.ruleY([1]),
    Plot.line(stocks, Plot.normalizeY({
      x: "Date",
      y: "Close",
      stroke: "Symbol"
    })),
    Plot.text(stocks, Plot.selectLast(Plot.normalizeY({
      x: "Date",
      y: "Close",
      z: "Symbol",
      text: "Symbol",
      textAnchor: "start",
      dx: 3
    })))
  ]
})
```
:::

:::tip
The [select transform](./select.md) is used to label the endpoints of each line.
:::

:::info
This example uses an [immediately-invoked function expression (IIFE)](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) for the **tickFormat** option so that the [d3.format](https://github.com/d3/d3-format) only needs to be constructed once.
:::

The normalize transform converts absolute values into relative ones. So, if **y** is [*y₀*, *y₁*, *y₂*, …] and the *first* basis is used with [normalizeY](#normalizey-basis-options), the resulting output **y** channel is [*y₀* / *y₀*, *y₁* / *y₀*, *y₂* / *y₀*, …]. But it’s a bit more complicated than this in practice since **y** is first grouped by **z**, **fill**, or **stroke** into separate series.

As another example, the normalize transform can be used to compute proportional demographics from absolute populations. The plot below compares the demographics of U.S. states: color represents age group, **y** represents the state, and **x** represents the proportion of the state’s population in that age group.

:::plot defer
```js
Plot.plot({
  height: 660,
  axis: null,
  grid: true,
  x: {
    axis: "top",
    label: "Population (%) →",
    percent: true
  },
  color: {
    scheme: "spectral",
    domain: stateage.ages, // in age order
    legend: true
  },
  marks: [
    Plot.ruleX([0]),
    Plot.ruleY(stateage, Plot.groupY({x1: "min", x2: "max"}, {...xy, sort: {y: "x1"}})),
    Plot.dot(stateage, {...xy, fill: "age", title: "age"}),
    Plot.text(stateage, Plot.selectMinX({...xy, textAnchor: "end", dx: -6, text: "state"}))
  ]
})
```
:::

```js
xy = Plot.normalizeX("sum", {z: "state", x: "population", y: "state"})
```

:::tip
To reduce code duplication, pull shared options out into an object (here `xy`) and then merge them into each mark’s options using the spread operator (`...`).
:::

## Normalize options

The **basis** option specifies how to normalize the series values; it is one of:

* *first* - the first value, as in an index chart; the default
* *last* - the last value
* *min* - the minimum value
* *max* - the maximum value
* *mean* - the mean value (average)
* *median* - the median value
* *pXX* - the percentile value, where XX is a number in [00,99]
* *sum* - the sum of values
* *extent* - the minimum is mapped to zero, and the maximum to one
* *deviation* - subtract the mean, then divide by the standard deviation
* a function to be passed an array of values, returning the desired basis

## normalize(*basis*)

```js
Plot.map({y: Plot.normalize("first")}, {x: "Date", y: "Close", stroke: "Symbol"})
```

Returns a normalize map method for the given *basis*, suitable for use with the [map transform](./map.md).

## normalizeX(*basis*, *options*)

```js
Plot.normalizeX("first", {y: "Date", x: "Close", stroke: "Symbol"})
```

Like [mapX](./map.md#mapx-map-options), but applies the normalize map method with the given *basis*. The **basis** option can also be mixed into the specified *options* like so:

```js
Plot.normalizeX({basis: "first", y: "Date", x: "Close", stroke: "Symbol"})
```

If not specified, the *basis* defaults to *first*.

## normalizeY(*basis*, *options*)

```js
Plot.normalizeY("first", {x: "Date", y: "Close", stroke: "Symbol"})
```

Like [mapY](./map.md#mapy-map-options), but applies the normalize map method with the given *basis*. The **basis** option can also be mixed into the specified *options* like so:

```js
Plot.normalizeY({basis: "first", x: "Date", y: "Close", stroke: "Symbol"})
```

If not specified, the *basis* defaults to *first*.
