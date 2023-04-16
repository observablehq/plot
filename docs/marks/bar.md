<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import alphabet from "../data/alphabet.ts";
import civilizations from "../data/civilizations.ts";

</script>

# Bar mark

The **bar mark** draws bars as in a bar chart. It comes in two orientations: [barY](#bary-data-options) extends vertically↑ as in a vertical bar chart or column chart, while [barX](#barx-data-options) extends horizontally→ as in a (horizontal) bar chart. For example, the bar chart below shows the frequency of letters in the English language.

:::plot
```js
Plot.barY(alphabet, {x: "letter", y: "frequency"}).plot()
```
:::

There is typically one ordinal value associated with each bar, such as a name (or above, letter), and two quantitative values defining a lower and upper bound; the lower bound is often not specified (as above) because it defaults to zero. For barY, **x** is ordinal and **y** is quantitative, whereas for barX, **y** is ordinal and **x** is quantitative.

:::tip
For a time-series bar chart, where one dimension is temporal and the other is quantitative, use the [rect mark](./rect.md) with the **interval** option instead.
:::

We can improve this plot by adding a grid, a rule at *y* = 0, and the **percent** *y*-scale option.

:::plot
```js
Plot.plot({
  y: {
    grid: true,
    percent: true
  },
  marks: [
    Plot.barY(alphabet, {x: "letter", y: "frequency"}),
    Plot.ruleY([0])
  ]
})
```
:::

<!-- The bar mark is closely related to the [rect mark](./rect.md). Both generate a rectangle; the difference is in how the coordinates are specified. For a bar, one side is a quantitative interval (*e.g.*, from 0 to a percentage) while the other is an ordinal or categorical value (*e.g.*, an English letter); whereas for a rect, both sides are quantitative intervals. Hence a bar is used for a bar chart but a rect is needed for a histogram. -->

<!-- The bar mark should generally not be used if the independent dimension (*e.g.*, *x* for barY) is temporal rather than ordinal. In this case, you should use the rect mark with the [interval transform](../transforms/interval.md). -->

A bar’s ordinal dimension uses a [band scale](https://github.com/d3/d3-scale/blob/main/README.md#band-scales) with a default **padding** of 0.1 to separate bars. For finer separation, you can set the *x*-scale **padding** to zero and use inset. The bar mark supports four options for insetting the sides of the bar: **insetTop**, **insetRight**, **insetBottom**, and **insetLeft**. The **inset** option is shorthand for setting all four sides to the same value. The chart below separates each bar by a single pixel.

:::plot
```js
Plot.plot({
  x: {
    padding: 0
  },
  y: {
    grid: true,
    percent: true
  },
  marks: [
    Plot.barY(alphabet, {x: "letter", y: "frequency", insetLeft: 0.5, insetRight: 0.5}),
    Plot.ruleY([0])
  ]
})
```
:::

<!-- Band scales round by default, which can leave extra space between the axes and the bars; set the corresponding scale’s align to zero or one, or disable rounding, if you don’t want a gap. -->

Ordinal domains are sorted naturally (lexicographically) by default. You can set the **domain** [scale option](../features/scales.md) explicitly to change the order, or use the **sort** [mark option](../features/marks.md#mark-options) to derive the scale domain from a channel. For example, to sort **x** by descending **y**:

:::plot
```js
Plot.plot({
  y: {
    grid: true,
    percent: true
  },
  marks: [
    Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", reverse: true}}),
    Plot.ruleY([0])
  ]
})
```
:::

If you specify a single quantitative value, as above, the bar spans from zero to the given value; you can specify a [*min*, *max*] extent instead by specifying two values. For example, here is a historical timeline of civilizations, where each has a beginning and an end.

:::plot
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
      dx: -6
    })
  ]
})
```
:::

:::tip
The above uses a [text mark](../marks/text.md) to label the bars directly instead of a *y*-axis. It also uses a custom tick format for the *x*-axis to show the calendar era.
:::

For (horizontal) bar charts, consider setting the chart height based on the number of bars to allow the chart to expand or contract automatically to fit the dataset.

For a diverging bar chart, simply specify a negative length. The chart below shows change in population from 2010 to 2019. States whose population increased are blue, while states whose population decreased are red. (Puerto Rico’s population declined sharply after hurricanes Maria and Irma.)

```js
Plot.plot({
  height: 780,
  marginLeft: 100,
  grid: true,
  x: {
    axis: "top",
    round: true,
    label: "← decrease · Change in population, 2010–2019 (%) · increase →",
    labelAnchor: "center",
    tickFormat: "+",
    transform: d => d * 100
  },
  y: {
    label: null,
    domain: d3.sort(popchange, d => (d[2010] - d[2019]) / d[2010]).map(d => d.State)
  },
  color: {
    range: ["#e15759", "#4e79a7"]
  },
  marks: [
    Plot.barX(popchange, {
      y: "State",
      x: d => (d[2019] - d[2010]) / d[2010],
      fill: d => Math.sign(d[2019] - d[2010])
    }),
    Plot.ruleX([0])
  ]
})
```

For a one-dimensional dataset, such as an array of numbers, you can use the index of the datum as the ordinal dimension: channel functions are passed a second argument *i* representing the zero-based index.

```js
frequencies = alphabet.map(d => d.frequency)
```

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.barY(frequencies, {x: (d, i) => i}),
    Plot.ruleY([0])
  ]
})
```

A bar’s quantitative dimension is optional; if missing, the bar spans the chart along this dimension. Such bars typically also have a color encoding. For example, here are [warming stripes](https://showyourstripes.info/) showing the increase in average temperature globally over the last 172 years.

```js
hadcrut = (await FileAttachment("hadcrut-annual.txt").text())
  .trim().split(/\n/g) // split into lines
  .map(line => line.split(/\s+/g)) // split each line into fields
  .map(([year, anomaly]) => ({ // extract the year and median anomaly
    year: new Date(Date.UTC(year, 0, 1)),
    anomaly: +anomaly
  }))
```

```js
Plot.plot({
  x: {
    round: true
  },
  color: {
    scheme: "BuRd"
  },
  marks: [
    Plot.barX(hadcrut, {
      x: "year",
      interval: d3.utcYear, // yearly data
      inset: 0, // no gaps
      fill: "anomaly"
    })
  ]
})
```

With the [stack transform](../transforms/stack.md), a one-dimensional bar can show the proportions of each value relative to the whole, as a compact alternative to a pie or donut chart.

```js
Plot.plot({
  x: {
    label: "Frequency (%)",
    transform: d => d * 100
  },
  marks: [
    Plot.ruleX([0, 1]),
    Plot.barX(alphabet, Plot.stackX({order: "letter", x: "frequency", fill: "#ccc", insetLeft: 1})),
    Plot.textX(alphabet, Plot.stackX({order: "letter", x: "frequency", text: "letter", insetLeft: 1}))
  ]
})
```

One-dimensional bars can also be used to highlight regions of interest. Below, for example, the expected frequency if all English letters were equally likely (¹/₂₆) is highlighted in orange.

```js
Plot.plot({
  x: {
    domain: d3.sort(alphabet, d => -d.frequency).map(d => d.letter)
  },
  y: {
    grid: true
  },
  marks: [
    Plot.barY([1 / 26], {fill: "orange", fillOpacity: 0.4}),
    Plot.barY(alphabet, {x: "letter", y: "frequency"}),
    Plot.ruleY([0])
  ]
})
```

[Faceting](../features/facets.md) can produce a grouped bar chart. The chart below shows the populations of the six most-populous states broken down by age group. The youngest age group (<10) is on the left in red, while the oldest age group (≥80) is on the right in blue.

```js
stateage = {
  const data = await FileAttachment("us-population-state-age.csv").csv({typed: true});
  const ages = data.columns.slice(1); // convert wide data to tidy data
  return Object.assign(ages.flatMap(age => data.map(d => ({state: d.name, age, population: d[age]}))), {ages});
}
```

```js
Plot.plot({
  x: {
    axis: null,
    domain: stateage.ages
  },
  y: {
    grid: true,
    tickFormat: "s"
  },
  color: {
    domain: stateage.ages,
    scheme: "spectral"
  },
  fx: {
    domain: d3.groupSort(stateage, v => d3.sum(v, d => -d.population), d => d.state).slice(0, 6),
    label: null,
    tickSize: 6
  },
  marks: [
    Plot.barY(stateage, {fx: "state", x: "age", y: "population", fill: "age", title: "age"}),
    Plot.ruleY([0])
  ]
})
```

Bars are often used in conjunction with transforms: the [*group* transform](../transforms/group.md) groups data by discrete value so that bar length can represent the size (frequency) of each group; the [*stack* transform](../transforms/stack.md) can arrange bars into stacks, as in a stacked bar chart. The [*bin* transform](../transforms/bin.md), which can be used to construct histograms of quantitative data, is typically paired with the [*rect* mark](./rect.md) instead of bar.

Bars support a *z* channel to control *z*-order. This is typically only needed to control occlusion when bars overlap. Bars also support the SVG *rx* and *ry* attributes for rounding, along with the standard SVG style attributes.

## Bar options

For the required channels, see [Plot.barX](#barxdata-options) and [Plot.barY](#barydata-options). The bar mark supports the [standard mark options](../features/marks.md), including insets and rounded corners. The **stroke** defaults to none. The **fill** defaults to currentColor if the stroke is none, and to none otherwise.

## barX(*data*, *options*)

```js
Plot.barX(alphabet, {y: "letter", x: "frequency"})
```

Returns a new horizontal bar↔︎ with the given *data* and *options*. The following channels are required:

* **x1** - the starting horizontal position; bound to the *x* scale
* **x2** - the ending horizontal position; bound to the *x* scale

If neither the **x1** nor **x2** option is specified, the **x** option may be specified as shorthand to apply an implicit [stackX transform](../transforms/stack.md); this is the typical configuration for a horizontal bar chart with bars aligned at *x* = 0. If the **x** option is not specified, it defaults to the identity function. If *options* is undefined, then it defaults to **x2** as the identity function and **y** as the index of data; this allows an array of numbers to be passed to Plot.barX to make a quick sequential bar chart.

If an **interval** is specified, such as d3.utcDay, **x1** and **x2** can be derived from **x**: *interval*.floor(*x*) is invoked for each *x* to produce *x1*, and *interval*.offset(*x1*) is invoked for each *x1* to produce *x2*. If the interval is specified as a number *n*, *x1* and *x2* are taken as the two consecutive multiples of *n* that bracket *x*.

In addition to the [standard bar channels](#bar-options), the following optional channels are supported:

* **y** - the vertical position; bound to the *y* scale, which must be *band*

If the **y** channel is not specified, the bar will span the full vertical extent of the plot (or facet).

## barY(*data*, *options*)

```js
Plot.barY(alphabet, {x: "letter", y: "frequency"})
```

Returns a new vertical bar↕︎ with the given *data* and *options*. The following channels are required:

* **y1** - the starting vertical position; bound to the *y* scale
* **y2** - the ending vertical position; bound to the *y* scale

If neither the **y1** nor **y2** option is specified, the **y** option may be specified as shorthand to apply an implicit [stackY transform](../transforms/stack.md); this is the typical configuration for a vertical bar chart with bars aligned at *y* = 0. If the **y** option is not specified, it defaults to the identity function. If *options* is undefined, then it defaults to **y2** as the identity function and **x** as the index of data; this allows an array of numbers to be passed to Plot.barY to make a quick sequential bar chart.

If an **interval** is specified, such as d3.utcDay, **y1** and **y2** can be derived from **y**: *interval*.floor(*y*) is invoked for each *y* to produce *y1*, and *interval*.offset(*y1*) is invoked for each *y1* to produce *y2*. If the interval is specified as a number *n*, *y1* and *y2* are taken as the two consecutive multiples of *n* that bracket *y*.

In addition to the [standard bar channels](#bar-options), the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale, which must be *band*

If the **x** channel is not specified, the bar will span the full horizontal extent of the plot (or facet).
