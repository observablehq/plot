<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref} from "vue";
import alphabet from "../data/alphabet.ts";
import civilizations from "../data/civilizations.ts";
import hadcrut from "../data/hadcrut.ts";
import penguins from "../data/penguins.ts";
import statepop from "../data/us-state-population-2010-2019.ts";

const checked = ref(true);

const timeseries = [
  {year: 2014, population: 7295.290765},
  {year: 2015, population: 7379.797139},
  {year: 2016, population: 7464.022049},
  {year: 2017, population: 7547.858925},
  // {year: 2018, population: 7631.091040},
  {year: 2019, population: 7713.468100},
  {year: 2020, population: 7794.798739}
];

</script>

# Bar mark

:::tip
The bar mark is one of several marks in Plot for drawing rectangles; it should be used when one dimension is ordinal and the other is quantitative. See also [rect](./rect.md) and [cell](./cell.md).
:::

The **bar mark** comes in two orientations: [barY](#bary-data-options) extends vertically↑ as in a vertical bar chart or column chart, while [barX](#barx-data-options) extends horizontally→ as in a (horizontal) bar chart. For example, the bar chart below shows the frequency of letters in the English language.

:::plot https://observablehq.com/@observablehq/plot-vertical-bars
```js
Plot.barY(alphabet, {x: "letter", y: "frequency"}).plot()
```
:::

Ordinal domains are sorted naturally (alphabetically) by default. Either set the [scale **domain**](../features/scales.md) explicitly to change the order, or use the mark [**sort** option](../features/marks.md#sort-option) to derive the scale domain from a channel. For example, to sort **x** by descending **y**:

:::plot https://observablehq.com/@observablehq/plot-vertical-bars
```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", reverse: true}}).plot()
```
:::

There is typically one ordinal value associated with each bar, such as a name (or above, letter), and two quantitative values defining a lower and upper bound; the lower bound is often not specified (as above) because it defaults to zero. For barY, **x** is ordinal and **y1** & **y2** are quantitative, whereas for barX, **y** is ordinal and **x1** & **x2** are quantitative.

Above, since **y** was specified instead of **y1** and **y2**, the bar spans from zero to the given *y* value: if you only specify a single quantitative value, barY applies an implicit [stackY transform](../transforms/stack.md) and likewise barX implicitly applies stackX. The stacked horizontal bar chart below draws one bar (of unit width in **x**) per penguin, colored and sorted by the penguin’s body mass, and grouped by species along **y**.

:::plot defer https://observablehq.com/@observablehq/plot-colored-stacked-bar-chart
```js
Plot.plot({
  marginLeft: 60,
  x: {label: "Frequency →"},
  y: {label: null},
  color: {legend: true},
  marks: [
    Plot.barX(penguins, {y: "species", x: 1, inset: 0.5, fill: "body_mass_g", sort: "body_mass_g"}),
    Plot.ruleX([0])
  ]
})
```
:::

:::tip
The [group transform](../transforms/group.md) with the *count* reducer could be used to produce one bar per species.
:::

You can specify a [*min*, *max*] extent instead and opt-out of the implicit stack transform by specifying two quantitative values: **x1** and **x2** for barX, or **y1** and **y2** for barY. For example, here is a historical timeline of civilizations, where each has a beginning and an end.

:::plot https://observablehq.com/@observablehq/plot-civilizations-timeline
```js
Plot.plot({
  marginLeft: 130,
  axis: null,
  x: {
    axis: "top",
    grid: true,
    tickFormat: (x) => x < 0 ? `${-x} BC` : `${x} AD`
  },
  marks: [
    Plot.barX(civilizations, {
      x1: "start",
      x2: "end",
      y: "civilization",
      sort: {y: "x1"}
    }),
    Plot.text(civilizations, {
      x: "start",
      y: "civilization",
      text: "civilization",
      textAnchor: "end",
      dx: -3
    })
  ]
})
```
:::

:::tip
This uses a [text mark](../marks/text.md) to label the bars directly instead of a *y* axis. It also uses a custom tick format for the *x* axis to show the calendar era.
:::

For a diverging bar chart, simply specify a negative value. The chart below shows change in population from 2010 to 2019. States whose population increased are <span :style="{borderBottom: `solid ${d3.schemePiYG[3][2]} 3px`}">green</span>, while states whose population decreased are <span :style="{borderBottom: `solid ${d3.schemePiYG[3][0]} 3px`}">pink</span>. (Puerto Rico’s population declined sharply after hurricanes Maria and Irma.)

:::plot https://observablehq.com/@observablehq/plot-state-population-change
```js
Plot.plot({
  label: null,
  x: {
    axis: "top",
    label: "← decrease · Change in population, 2010–2019 (%) · increase →",
    labelAnchor: "center",
    tickFormat: "+",
    percent: true
  },
  color: {
    scheme: "PiYg",
    type: "ordinal"
  },
  marks: [
    Plot.barX(statepop, {y: "State", x: (d) => (d[2019] - d[2010]) / d[2010], fill: (d) => Math.sign(d[2019] - d[2010]), sort: {y: "x"}}),
    Plot.gridX({stroke: "var(--vp-c-bg)", strokeOpacity: 0.5}),
    Plot.axisY({x: 0}),
    Plot.ruleX([0])
  ]
})
```
:::

:::tip
The **percent** scale option is useful for showing percentages; it applies a [scale transform](../features/scales.md#scale-transforms) that multiplies associated channel values by 100.
:::

When ordinal data is regular, such as the yearly observations of the time-series bar chart of world population below, use the **interval** option to enforce uniformity and show gaps for missing data. It can be set to a named interval such as *hour* or *day*, a number for numeric intervals, a [d3-time interval](https://github.com/d3/d3-time/blob/main/README.md#api-reference), or a custom implementation.

<p>
  <label class="label-input">
    Use interval:
    <input type="checkbox" v-model="checked">
  </label>
</p>

:::plot https://observablehq.com/@observablehq/plot-ordinal-scale-interval
```js
Plot
  .barY(timeseries, {x: "year", y: "population"})
  .plot({x: {tickFormat: "", interval: checked ? 1 : undefined}})
```
:::

:::tip
You can also make a time-series bar chart with a [rect mark](./rect.md), possibly with the [bin transform](../transforms/bin.md) to bin observations at regular intervals.
:::

A bar’s ordinal dimension is optional; if missing, the bar spans the chart along this dimension. Such bars typically also have a color encoding. For example, here are [warming stripes](https://showyourstripes.info/) showing the increase in average temperature globally over the last 172 years.

:::plot https://observablehq.com/@observablehq/plot-warming-stripes-2
```js
Plot.plot({
  x: {round: true, tickFormat: "d"},
  color: {scheme: "BuRd"},
  marks: [
    Plot.barX(hadcrut, {
      x: "year",
      fill: "anomaly",
      interval: 1, // annual observations
      inset: 0 // no gaps
    })
  ]
})
```
:::

With the [stack transform](../transforms/stack.md), a one-dimensional bar can show the proportions of each value relative to the whole, as a compact alternative to a pie or donut chart.

:::plot https://observablehq.com/@observablehq/plot-stacked-percentages
```js
Plot.plot({
  x: {percent: true},
  marks: [
    Plot.barX(alphabet, Plot.stackX({x: "frequency", fillOpacity: 0.3, inset: 0.5})),
    Plot.textX(alphabet, Plot.stackX({x: "frequency", text: "letter", inset: 0.5})),
    Plot.ruleX([0, 1])
  ]
})
```
:::

:::tip
Although barX applies an implicit stackX transform, [textX](./text.md) does not; this example uses an explicit stackX transform in both cases for clarity.
:::

For a grouped bar chart, use [faceting](../features/facets.md). The chart below uses **fy** to partition the bar chart of penguins by island.

:::plot defer https://observablehq.com/@observablehq/plot-grouped-unit-chart
```js
Plot.plot({
  marginLeft: 60,
  marginRight: 60,
  label: null,
  x: {label: "Frequency →"},
  y: {padding: 0},
  marks: [
    Plot.barX(penguins, {fy: "island", y: "sex", x: 1, inset: 0.5}),
    Plot.ruleX([0])
  ]
})
```
:::

## Bar options

For required channels, see [barX](#barx-data-options) and [barY](#bary-data-options). The bar mark supports the [standard mark options](../features/marks.md), including insets and rounded corners. The **stroke** defaults to *none*. The **fill** defaults to *currentColor* if the stroke is *none*, and to *none* otherwise.

## barX(*data*, *options*)

```js
Plot.barX(alphabet, {y: "letter", x: "frequency"})
```

Returns a new horizontal→ bar with the given *data* and *options*. The following channels are required:

* **x1** - the starting horizontal position; bound to the *x* scale
* **x2** - the ending horizontal position; bound to the *x* scale

The following optional channels are supported:

* **y** - the vertical position; bound to the *y* scale, which must be *band*

If neither the **x1** nor **x2** option is specified, the **x** option may be specified as shorthand to apply an implicit [stackX transform](../transforms/stack.md); this is the typical configuration for a horizontal bar chart with bars aligned at *x* = 0. If the **x** option is not specified, it defaults to [identity](../features/transforms.md#identity). If *options* is undefined, then it defaults to **x2** as identity and **y** as the zero-based index [0, 1, 2, …]; this allows an array of numbers to be passed to barX to make a quick sequential bar chart. If the **y** channel is not specified, the bar will span the full vertical extent of the plot (or facet).

If an **interval** is specified, such as d3.utcDay, **x1** and **x2** can be derived from **x**: *interval*.floor(*x*) is invoked for each *x* to produce *x1*, and *interval*.offset(*x1*) is invoked for each *x1* to produce *x2*. If the interval is specified as a number *n*, *x1* and *x2* are taken as the two consecutive multiples of *n* that bracket *x*.

## barY(*data*, *options*)

```js
Plot.barY(alphabet, {x: "letter", y: "frequency"})
```

Returns a new vertical↑ bar with the given *data* and *options*. The following channels are required:

* **y1** - the starting vertical position; bound to the *y* scale
* **y2** - the ending vertical position; bound to the *y* scale

The following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale, which must be *band*

If neither the **y1** nor **y2** option is specified, the **y** option may be specified as shorthand to apply an implicit [stackY transform](../transforms/stack.md); this is the typical configuration for a vertical bar chart with bars aligned at *y* = 0. If the **y** option is not specified, it defaults to [identity](../features/transforms.md#identity). If *options* is undefined, then it defaults to **y2** as identity and **x** as the zero-based index [0, 1, 2, …]; this allows an array of numbers to be passed to barY to make a quick sequential bar chart. If the **x** channel is not specified, the bar will span the full horizontal extent of the plot (or facet).

If an **interval** is specified, such as d3.utcDay, **y1** and **y2** can be derived from **y**: *interval*.floor(*y*) is invoked for each *y* to produce *y1*, and *interval*.offset(*y1*) is invoked for each *y1* to produce *y2*. If the interval is specified as a number *n*, *y1* and *y2* are taken as the two consecutive multiples of *n* that bracket *y*.
