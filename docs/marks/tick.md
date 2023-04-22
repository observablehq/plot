<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import aapl from "../data/aapl.ts";
import alphabet from "../data/alphabet.ts";

const stateage = shallowRef([]);

onMounted(() => {
  d3.csv("../data/us-population-state-age.csv", d3.autoType).then((data) => {
    const ages = data.columns.slice(1); // convert wide data to tidy data
    stateage.value = Object.assign(ages.flatMap(age => data.map((d) => ({state: d.name, age, population: d[age]}))), {ages});
  });
});

</script>

# Tick mark

:::tip
The tick mark is one of two marks in Plot for drawing horizontal or vertical lines; it should be used when the secondary position dimension, if any, is ordinal. When it is quantitative, use a [rule](./rule.md).
:::

The **tick mark** comes in two orientations: [tickY](#ticky-data-options) draws a horizontal↔︎ line with a given *y* value, while [tickX](#tickx-data-options) draws a vertical↕︎ line with a given *x* value. Ticks have an optional secondary position dimension (**x** for tickY and **y** for tickX); this second dimension is ordinal, unlike a [rule](./rule.md), and requires a corresponding [band scale](../features/scales.md).

Ticks are often used to show one-dimensional distributions, as in the “barcode” plot below showing the proportion of the population in each age bracket across U.S. states.

:::plot defer https://observablehq.com/@observablehq/plot-barcode
```js
Plot.plot({
  x: {
    grid: true,
    label: "Population (%) →",
    percent: true
  },
  y: {
    domain: stateage.ages, // in age order
    reverse: true,
    label: "↑ Age (years)",
    labelAnchor: "top"
  },
  marks: [
    Plot.ruleX([0]),
    Plot.tickX(stateage, Plot.normalizeX("sum", {z: "state", x: "population", y: "age"}))
  ]
})
```
:::

Both ticks and [bars](./bar.md) have an ordinal secondary position dimension; a tick is therefore convenient for stroking the upper bound of a bar for emphasis, as in the bar chart below. A separate [rule](./rule.md) is also used to denote *y* = 0.

:::plot https://observablehq.com/@observablehq/plot-bar-and-tick
```js
Plot.plot({
  x: {label: null},
  y: {percent: true},
  marks: [
    Plot.barY(alphabet, {x: "letter", y: "frequency", fillOpacity: 0.2}),
    Plot.tickY(alphabet, {x: "letter", y: "frequency"}),
    Plot.ruleY([0])
  ]
})
```
:::

When there is no secondary position dimension, a tick behaves identically to a [rule](./rule.md). While a one-dimensional rule and tick are equivalent, a one-dimensional rule is generally preferred, if only because the name “rule” is more descriptive. But as an example below, a random normal distribution is plotted below with ticks.

:::plot https://observablehq.com/@observablehq/plot-random-ticks
```js
Plot.plot({
  x: {domain: [-4, 4]},
  marks: [
    Plot.tickX({length: 500}, {x: d3.randomNormal(), strokeOpacity: 0.2})
  ]
})
```
:::

:::tip
Reducing opacity allows better perception of density when ticks overlap.
:::

Ticks are also used by the [box mark](./box.md) to denote the median value for each group.

## Tick options

For the required channels, see [tickX](#tickx-data-options) and [tickY](#ticky-data-options). The tick mark supports the [standard mark options](../features/marks.md#mark-options), including insets. The **stroke** defaults to *currentColor*.

## tickX(*data*, *options*)

```js
Plot.tickX(stateage, {x: "population", y: "age"})
```

Returns a new vertical↕︎ tick with the given *data* and *options*. The following channels are required:

* **x** - the horizontal position; bound to the *x* scale

The following optional channels are supported:

* **y** - the vertical position; bound to the *y* scale, which must be *band*

If the **y** channel is not specified, the tick will span the full vertical extent of the frame.

## tickY(*data*, *options*)

```js
Plot.tickY(stateage, {y: "population", x: "age"})
```

Returns a new horizontal↔︎ tick with the given *data* and *options*. The following channels are required:

* **y** - the vertical position; bound to the *y* scale

The following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale, which must be *band*

If the **x** channel is not specified, the tick will span the full vertical extent of the frame.
