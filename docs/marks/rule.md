<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import aapl from "../data/aapl.ts";
import alphabet from "../data/alphabet.ts";

const seattle = shallowRef([]);
const simpsons = shallowRef(d3.cross(d3.range(1, 29), d3.range(1, 26), (x, y) => ({season: x, number_in_season: y})));

onMounted(() => {
  d3.csv("../data/seattle-weather.csv", d3.autoType).then((data) => (seattle.value = data));
  d3.csv("../data/simpsons.csv", d3.autoType).then((data) => (simpsons.value = data));
});

</script>

# Rule mark

:::tip
The rule mark is one of two marks in Plot for drawing horizontal or vertical lines; it should be used when the secondary position dimension, if any, is quantitative. When it is ordinal, use a [tick](./tick.md).
:::

The **rule mark** comes in two orientations: [ruleY](#ruley-data-options) draws a horizontal↔︎ line with a given *y* value, while [ruleX](#rulex-data-options) draws a vertical↕︎ line with a given *x* value. Rules are often used as annotations, say to mark the *y* = 0 baseline (in red below for emphasis) in a line chart.

:::plot https://observablehq.com/@observablehq/plot-rule-zero
```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.ruleY([0], {stroke: "red"}),
    Plot.line(aapl, {x: "Date", y: "Close"})
  ]
})
```
:::

As annotations, rules often have a hard-coded array of literal values as data. This [shorthand](../features/shorthand.md) utilizes the default [identity](../features/transforms.md#identity) definition of the rule’s position (**y** for ruleY and **x** for ruleX).

:::plot https://observablehq.com/@observablehq/plot-rule-one
```js
Plot.plot({
  y: {
    type: "log",
    grid: true,
    label: "↑ Change in price (%)",
    tickFormat: ((f) => (d) => f((d - 1) * 100))(d3.format("+d"))
  },
  marks: [
    Plot.ruleY([1], {stroke: "red"}),
    Plot.line(aapl, Plot.normalizeY("first", {x: "Date", y: "Close"}))
  ]
})
```
:::

Yet rules can also be used to visualize data. Below, a random normal distribution is plotted with rules, looking a bit like the [emission spectrum of Hydrogen](https://en.wikipedia.org/wiki/Hydrogen_spectral_series).

:::plot https://observablehq.com/@observablehq/plot-rule-random
```js
Plot.plot({
  x: {domain: [-4, 4]},
  marks: [
    Plot.ruleX({length: 500}, {x: d3.randomNormal(), strokeOpacity: 0.2})
  ]
})
```
:::

:::tip
Reducing opacity allows better perception of density when rules overlap.
:::

Rules can also serve as an alternative to an [area mark](./area.md) as in a band chart, provided the data is sufficiently dense: you can limit the extent of a rule along the secondary dimension (**y1** and **y2** channels for ruleX, and **x1** and **x2** channels for ruleY) rather than having it span the frame. And rules support a **stroke** color encoding. The rules below plot the daily minimum and maximimum temperature for Seattle.

:::plot defer
```js
Plot.plot({
  y: {grid: true, label: "↑ Temperature (°C)"},
  color: {scheme: "BuRd"},
  marks: [
    Plot.ruleY([0]),
    Plot.ruleX(seattle, {x: "date", y1: "temp_min", y2: "temp_max", stroke: "temp_min"})
  ]
})
```
:::

In the dense [candlestick chart](https://observablehq.com/@observablehq/observable-plot-candlestick) below, three rules are drawn for each trading day: a gray rule spans the chart, showing gaps for weekends and holidays; a black rule spans the day’s low and high; and a green or red rule spans the day’s open and close.

:::plot defer https://observablehq.com/@observablehq/plot-candlestick-chart
```js
Plot.plot({
  inset: 6,
  label: null,
  y: {grid: true, label: "↑ Stock price ($)"},
  color: {type: "threshold", range: ["#e41a1c", "#4daf4a"]},
  marks: [
    Plot.ruleX(aapl, {x: "Date", y1: "Low", y2: "High"}),
    Plot.ruleX(aapl, {x: "Date", y1: "Open", y2: "Close", stroke: (d) => d.Close - d.Open, strokeWidth: 4})
  ]
})
```
:::

Rules can be used to connect graphical elements, such as in the [dot plot](./dot.md) below showing the decline of *The Simpsons*. The rules indicate the extent (minimum and maximum) for each season, computed via the [group transform](../transforms/group.md), while a red line shows the median rating trend.

:::plot defer https://observablehq.com/@observablehq/plot-simpsons-decline
```js
Plot.plot({
  marks: [
    Plot.ruleX(simpsons, Plot.groupX({y1: "min", y2: "max"}, {x: "season", y: "imdb_rating"})),
    Plot.dot(simpsons, {x: "season", y: "imdb_rating", fill: "currentColor", stroke: "var(--vp-c-bg)"}),
    Plot.lineY(simpsons, Plot.groupX({y: "median"}, {x: "season", y: "imdb_rating", stroke: "red"}))
  ]
})
```
:::

Rules can also be a stylistic choice, as in the lollipop 🍭 chart below, serving the role of a skinny [bar](./bar.md) topped with a [dot](./dot.md).

:::plot https://observablehq.com/@observablehq/plot-lollipop
```js
Plot.plot({
  x: {label: null, tickPadding: 6, tickSize: 0},
  y: {percent: true},
  marks: [
    Plot.ruleX(alphabet, {x: "letter", y: "frequency", strokeWidth: 2}),
    Plot.dot(alphabet, {x: "letter", y: "frequency", fill: "currentColor", r: 4})
  ]
})
```
:::

Rules are also used by the [grid mark](./grid) to draw grid lines.

## Rule options

For the required channels, see [ruleX](#rulex-data-options) and [ruleY](#ruley-data-options). The rule mark supports the [standard mark options](../features/marks.md#mark-options), including insets along its secondary dimension. The **stroke** defaults to *currentColor*.

## ruleX(*data*, *options*)

```js
Plot.ruleX([0]) // as annotation
```
```js
Plot.ruleX(alphabet, {x: "letter", y: "frequency"}) // like barY
```

Returns a new vertical↕︎ rule with the given *data* and *options*. The following channels are optional:

* **x** - the horizontal position; bound to the *x* scale
* **y1** - the starting vertical position; bound to the *y* scale
* **y2** - the ending vertical position; bound to the *y* scale

If **x** is not specified, it defaults to [identity](../features/transforms.md#identity) and assumes that *data* = [*x₀*, *x₁*, *x₂*, …]. If **x** is null, the rule will be centered horizontally in the plot frame.

If **y** is specified, it is shorthand for **y2** with **y1** equal to zero; this is the typical configuration for a vertical lollipop chart with rules aligned at *y* = 0. If **y1** is not specified, the rule will start at the top of the plot (or facet). If **y2** is not specified, the rule will end at the bottom of the plot (or facet).

If an **interval** is specified, such as d3.utcDay, **y1** and **y2** can be derived from **y**: *interval*.floor(*y*) is invoked for each *y* to produce *y1*, and *interval*.offset(*y1*) is invoked for each *y1* to produce *y2*. If the interval is specified as a number *n*, *y1* and *y2* are taken as the two consecutive multiples of *n* that bracket *y*.

## ruleY(*data*, *options*)

```js
Plot.ruleY([0]) // as annotation
```
```js
Plot.ruleY(alphabet, {y: "letter", x: "frequency"}) // like barX
```

Returns a new horizontal↔︎ rule with the given *data* and *options*. The following channels are optional:

* **y** - the vertical position; bound to the *y* scale
* **x1** - the starting horizontal position; bound to the *x* scale
* **x2** - the ending horizontal position; bound to the *x* scale

If **y** is not specified, it defaults to [identity](../features/transforms.md#identity) and assumes that *data* = [*y₀*, *y₁*, *y₂*, …]. If **y** is null, the rule will be centered vertically in the plot frame.

If **x** is specified, it is shorthand for **x2** with **x1** equal to zero; this is the typical configuration for a horizontal lollipop chart with rules aligned at *x* = 0. If **x1** is not specified, the rule will start at the left edge of the plot (or facet). If **x2** is not specified, the rule will end at the right edge of the plot (or facet).

If an **interval** is specified, such as d3.utcDay, **x1** and **x2** can be derived from **x**: *interval*.floor(*x*) is invoked for each *x* to produce *x1*, and *interval*.offset(*x1*) is invoked for each *x1* to produce *x2*. If the interval is specified as a number *n*, *x1* and *x2* are taken as the two consecutive multiples of *n* that bracket *x*.
