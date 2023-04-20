<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import morley from "../data/morley.ts";

const diamonds = shallowRef([]);

onMounted(() => {
  d3.csv("../data/diamonds.csv", d3.autoType).then((data) => (diamonds.value = data));
});

</script>

# Box mark

The **box mark** summarizes one-dimensional distributions as boxplots. It is a [composite mark](../features/marks.md#marks-marks) consisting of a [rule](./rule.md) to represent the extreme values (not including outliers), a [bar](./bar.md) to represent the interquartile range (trimmed to the data), a [tick](./tick.md) to represent the median value, and a [dot](./dot.md) to represent any outliers. The [group transform](../transforms/group.md) is used to group and aggregate data.

For example, the boxplot below shows [A.A. Michelson’s experimental measurements](https://stat.ethz.ch/R-manual/R-devel/library/datasets/html/morley.html) of the speed of light. (Speed is in km/sec minus 299,000.)

:::plot https://observablehq.com/@observablehq/plot-vertical-box-plot
```js
Plot.plot({
  y: {
    grid: true,
    inset: 6
  },
  marks: [
    Plot.boxY(morley, {x: "Expt", y: "Speed"})
  ]
})
```
:::

[boxY](#boxy-data-options) produces vertical boxplots; for horizontal boxplots, use [boxX](#boxx-data-options) and swap **x** and **y**.

:::plot https://observablehq.com/@observablehq/plot-horizontal-box-plot
```js
Plot.plot({
  x: {
    grid: true,
    inset: 6
  },
  marks: [
    Plot.boxX(morley, {x: "Speed", y: "Expt"})
  ]
})
```
:::

As [shorthand](../features/shorthand.md), you can pass an array of numbers for a single boxplot.

:::plot https://observablehq.com/@observablehq/plot-shorthand-box-plot
```js
Plot.boxX([0, 3, 4.4, 4.5, 4.6, 5, 7]).plot()
```
:::

Since the box mark uses the [group transform](../transforms/group.md), the secondary dimension must be ordinal. To group quantitative values, bin manually, say with [Math.floor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor); see [#1330](https://github.com/observablehq/plot/issues/1330).

:::plot defer https://observablehq.com/@observablehq/plot-binned-box-plot
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Price"
  },
  x: {
    interval: 0.5,
    label: "Carats →",
    labelAnchor: "right",
    tickFormat: (x) => x.toFixed(1)
  },
  marks: [
    Plot.ruleY([0]),
    Plot.boxY(diamonds, {x: (d) => Math.floor(d.carat * 2) / 2, y: "price"})
  ]
})
```
:::

## Box options

The box mark is a [composite mark](../features/marks.md#marks-marks) consisting of four marks:

* a [rule](../marks/rule.md) representing the extreme values (not including outliers)
* a [bar](../marks/bar.md) representing the interquartile range (trimmed to the data)
* a [tick](../marks/tick.md) representing the median value, and
* a [dot](../marks/dot.md) representing outliers, if any

The given *options* are passed through to these underlying marks, with the exception of the following options:

* **fill** - the fill color of the bar; defaults to #ccc
* **fillOpacity** - the fill opacity of the bar; defaults to 1
* **stroke** - the stroke color of the rule, tick, and dot; defaults to *currentColor*
* **strokeOpacity** - the stroke opacity of the rule, tick, and dot; defaults to 1
* **strokeWidth** - the stroke width of the tick; defaults to 1

## boxX(*data*, *options*)

```js
Plot.boxX(simpsons.map(d => d.imdb_rating))
```

Returns a horizontal box mark. If the **x** option is not specified, it defaults to the identity function, as when *data* is an array of numbers. If the **y** option is not specified, it defaults to null; if the **y** option is specified, it should represent an ordinal (discrete) value.

## boxY(*data*, *options*)

```js
Plot.boxY(simpsons.map(d => d.imdb_rating))
```

Returns a vertical box mark. If the **y** option is not specified, it defaults to the identity function, as when *data* is an array of numbers. If the **x** option is not specified, it defaults to null; if the **x** option is specified, it should represent an ordinal (discrete) value.
