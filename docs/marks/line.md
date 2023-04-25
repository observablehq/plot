<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, shallowRef, onMounted} from "vue";
import aapl from "../data/aapl.ts";
import driving from "../data/driving.ts";
import sftemp from "../data/sf-temperatures.ts";
import tdf from "../data/tdf.ts";

const beagle = shallowRef([]);
const bls = shallowRef([]);
const stateage = shallowRef([]);
const stocks = shallowRef([]);
const world = shallowRef(null);
const land = computed(() => world.value ? topojson.feature(world.value, world.value.objects.land) : {type: null});

onMounted(() => {
  d3.text("../data/beagle.csv").then((text) => (beagle.value = d3.csvParseRows(text).map(d3.autoType)));
  d3.csv("../data/bls-metro-unemployment.csv", d3.autoType).then((data) => (bls.value = data));
  d3.json("../data/countries-110m.json").then((data) => (world.value = data));
  d3.csv("../data/us-population-state-age.csv", d3.autoType).then((data) => {
    const ages = data.columns.slice(1); // convert wide data to tidy data
    stateage.value = Object.assign(ages.flatMap(age => data.map((d) => ({state: d.name, age, population: d[age]}))), {ages});
  });
  Promise.all([
    d3.csv("../data/amzn.csv", d3.autoType),
    d3.csv("../data/goog.csv", d3.autoType),
    d3.csv("../data/ibm.csv", d3.autoType)
  ]).then((datas) => {
    stocks.value = d3.zip(["AAPL", "AMZN", "GOOG", "IBM"], [aapl].concat(datas)).flatMap(([Symbol, data]) => data.map(d => ({Symbol, ...d})));
  });
});

</script>

# Line mark

The **line mark** draws two-dimensional lines as in a line chart. Because the line mark interpolates between adjacent data points, typically both the *x* and *y* scales are quantitative or temporal. For example, below is a line chart of the closing price of Apple stock.

:::plot https://observablehq.com/@observablehq/plot-simple-line-chart
```js
Plot.line(aapl, {x: "Date", y: "Close"}).plot({y: {grid: true}})
```
:::

If the **x** and **y** options are not defined, the line mark assumes that the data is an iterable of points [[*x₁*, *y₁*], [*x₂*, *y₂*], …], allowing for [shorthand](../features/shorthand.md).

:::plot https://observablehq.com/@observablehq/plot-shorthand-line-chart
```js
Plot.line(aapl.map((d) => [d.Date, d.Close])).plot()
```
:::

:::tip
This shorthand loses the automatic *x*- and *y*-axis labels, reducing legibility. Use the **label** [scale option](../features/scales.md) to restore them.
:::

The [lineY constructor](#liney-data-options) provides default channel definitions of **x** = index and **y** = [identity](../features/transforms.md#identity), letting you pass an array of numbers as data. The [lineX constructor](#linex-data-options) similarly provides **x** = identity and **y** = index defaults for lines that go up↑ instead of to the right→. Below, a random walk is made using [d3.cumsum](https://observablehq.com/@d3/d3-cumsum?collection=@d3/d3-array) and [d3.randomNormal](https://observablehq.com/@d3/d3-random?collection=@d3/d3-random).

:::plot defer https://observablehq.com/@observablehq/plot-shorthand-liney
```js
Plot.lineY(d3.cumsum({length: 600}, d3.randomNormal())).plot()
```
:::

As with [areas](./area.md), points in lines are connected in input order: the first point is connected to the second point, the second is connected to the third, and so on. Line data is typically in chronological order. Unsorted data may produce gibberish.

:::plot defer https://observablehq.com/@observablehq/plot-line-sort
```js
Plot.lineY(d3.shuffle(aapl.slice()), {x: "Date", y: "Close"}).plot() // 🌶️
```
:::

If your data isn’t sorted, use the [sort transform](../transforms/sort.md).

:::plot defer https://observablehq.com/@observablehq/plot-line-sort
```js
Plot.lineY(d3.shuffle(aapl.slice()), {x: "Date", y: "Close", sort: "Date"}).plot()
```
:::

While the *x* scale of a line chart often represents time, this is not required. For example, we can plot the elevation profile of a Tour de France stage—and imagine how tiring it must be to start a climb after riding 160km! ⛰🚴💦

:::plot defer https://observablehq.com/@observablehq/plot-tour-de-france-elevation-profile
```js
Plot.plot({
  x: {
    label: "Distance from stage start (km) →"
  },
  y: {
    label: "↑ Elevation (m)",
    grid: true
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(tdf, {x: "distance", y: "elevation"})
  ]
})
```
:::

There is no requirement that **y** be dependent on **x**; lines can be used in connected scatterplots to show two independent (but often correlated) variables. (See also [phase plots](https://en.wikipedia.org/wiki/Phase_portrait).) The chart below recreates Hannah Fairfield’s [“Driving Shifts Into Reverse”](http://www.nytimes.com/imagepages/2010/05/02/business/02metrics.html) from 2009.

:::plot defer https://observablehq.com/@observablehq/plot-connected-scatterplot
```js
Plot.plot({
  inset: 10,
  grid: true,
  x: {label: "Miles driven (per person-year) →"},
  y: {label: "↑ Cost of gasoline ($ per gallon)"},
  marks: [
    Plot.line(driving, {x: "miles", y: "gas", curve: "catmull-rom", marker: true}),
    Plot.text(driving, {filter: (d) => d.year % 5 === 0, x: "miles", y: "gas", text: (d) => `${d.year}`, dy: -8})
  ]
})
```
:::

To draw multiple lines, use the **z** channel to group [tidy data](https://r4ds.had.co.nz/tidy-data.html) into series. For example, the chart below shows unemployment rates of various metro areas from the Bureau of Labor Statistics; the **z** value is the metro division name.

:::plot defer https://observablehq.com/@observablehq/plot-multiple-line-chart
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Unemployment (%)"
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(bls, {x: "date", y: "unemployment", z: "division"})
  ]
})
```
:::

:::tip
If your data is not tidy, you can use [*array*.flatMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap) to pivot.
:::

<!-- Below, we load additional CSV files for other stocks to compare their performance. -->

If a **stroke** (or **fill**) channel is specified, the **z** option defaults to the same, automatically grouping series. For this reason, both **stroke** and **z** are typically ordinal or categorical.

:::plot defer https://observablehq.com/@observablehq/plot-index-chart
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

:::info
Here the [normalize transform](../transforms/normalize.md) normalizes each time series (**z**) relative to its initial value, while the [select transform](../transforms/select.md) extracts the last point for labeling. A custom tick format converts multiples to percentage change (*e.g.*, 1.6× = +60%).
:::

Varying-color lines are supported. If the **stroke** value varies within series, the line will be segmented by color. (The same behavior applies to other channels, such as **strokeWidth** and **title**.) Specifying the **z** channel (say to null for a single series) is recommended.

:::plot defer https://observablehq.com/@observablehq/plot-varying-stroke-line
```js
Plot.plot({
  x: {
    label: null
  },
  y: {
    grid: true,
    label: "↑ Unemployment (%)"
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(bls, {
      x: "date",
      y: "unemployment",
      z: "division",
      stroke: "unemployment"
    })
  ]
})
```
:::

Color encodings can also be used to highlight specific series, such as here to emphasize high unemployment in Michigan.

:::plot defer https://observablehq.com/@observablehq/plot-multiple-line-highlight
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Unemployment (%)"
  },
  color: {
    domain: [false, true],
    range: ["#ccc", "red"]
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(bls, {
      x: "date",
      y: "unemployment",
      z: "division",
      stroke: (d) => /, MI /.test(d.division),
      sort: {channel: "stroke"}
    })
  ]
})
```
:::

When using **z**, lines are drawn in input order. The [sort transform](../transforms/sort.md) above places the red lines on top of the gray ones to improve readability.

As an alternative to **z**, you can render multiple lines using multiple marks. While more verbose, this allows you to choose different options for each line. For example, below we plot the a 14-day moving average of the daily highs and lows in temperate San Francisco using the [window transform](../transforms/window.md).

:::plot defer https://observablehq.com/@observablehq/plot-moving-average-line
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Temperature (°F)"
  },
  marks: [
    Plot.line(sftemp, Plot.windowY(14, {x: "date", y: "low", stroke: "#4e79a7"})),
    Plot.line(sftemp, Plot.windowY(14, {x: "date", y: "high", stroke: "#e15759"})),
    Plot.ruleY([32]) // freezing
  ]
})
```
:::

If some channel values are undefined (or null or NaN), gaps will appear between adjacent points. To demonstrate, below we set the **y** value to NaN for the first three months of each year.

:::plot defer https://observablehq.com/@observablehq/plot-line-chart-with-gaps
```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.lineY(aapl, {x: "Date", y: (d) => d.Date.getUTCMonth() < 3 ? NaN : d.Close})
  ]
})
```
:::

Supplying undefined values is not the same as filtering the data: the latter will interpolate between the data points. Observe the conspicuous straight lines below!

:::plot defer https://observablehq.com/@observablehq/plot-line-chart-with-gaps
```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.lineY(aapl, {filter: (d) => d.Date.getUTCMonth() >= 3, x: "Date", y: "Close", strokeOpacity: 0.3}),
    Plot.lineY(aapl, {x: "Date", y: (d) => d.Date.getUTCMonth() < 3 ? NaN : d.Close})
  ]
})
```
:::

While uncommon, you can draw a line with ordinal position values. For example below, each line represents a U.S. state; **x** represents an (ordinal) age group while **y** represents the proportion of the state’s population in that age group. This chart emphasizes the overall age distribution of the United States, while giving a hint to variation across states.

:::plot defer https://observablehq.com/@observablehq/plot-ordinal-line
```js
Plot.plot({
  x: {
    domain: stateage.ages, // in age order
    label: "Age range (years) →",
    labelAnchor: "right"
  },
  y: {
    label: "↑ Population (%)",
    percent: true,
    grid: true
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(stateage, Plot.normalizeY("sum", {x: "age", y: "population", z: "state", strokeWidth: 1}))
  ]
})
```
:::

With a [spherical projection](../features/projections.md), line segments become [geodesics](https://en.wikipedia.org/wiki/Great-circle_distance), taking the shortest path between two points on the sphere and wrapping around the antimeridian at 180° longitude. The line below shows Charles Darwin’s voyage on HMS _Beagle_. (Data via [Benjamin Schmidt](https://observablehq.com/@bmschmidt/data-driven-projections-darwins-world).)

:::plot defer https://observablehq.com/@observablehq/plot-spherical-line
```js
Plot.plot({
  projection: "equirectangular",
  marks: [
    Plot.geo(land), // MultiPolygon
    Plot.line(beagle, {stroke: "red"}), // [[lon, lat], …]
    Plot.geo({type: "Point", coordinates: [-0.13, 51.5]}, {fill: "red"}) // London
  ]
})
```
:::

:::tip
Disable spherical interpolation by setting the **curve** option to *linear* instead of the default *auto*.
:::

A projected line can use varying color, too. Below, color reveals the westward direction of the Beagle’s journey around the world, starting and ending in London.

:::plot defer https://observablehq.com/@observablehq/plot-spherical-line-with-a-varying-stroke
```js
Plot.plot({
  projection: "equirectangular",
  marks: [
    Plot.geo(land),
    Plot.line(beagle, {stroke: (d, i) => i, z: null})
  ]
})
```
:::

:::info
Setting **z** to null forces a single line; we want the **stroke** to vary within the line instead of producing a separate line for each color.
:::

Interpolation is controlled by the [**curve** option](../features/curves.md). The default curve is *linear*, which draws straight line segments between pairs of adjacent points. A *step* curve is nice for emphasizing when the value changes, while *basis* and *catmull–rom* are nice for smoothing.

## Line options

The following channels are required:

* **x** - the horizontal position; bound to the *x* scale
* **y** - the vertical position; bound to the *y* scale

In addition to the [standard mark options](../features/marks.md#mark-options), the following optional channels are supported:

* **z** - a categorical value to group data into series

By default, the data is assumed to represent a single series (a single value that varies over time, *e.g.*). If the **z** channel is specified, data is grouped by **z** to form separate series. Typically **z** is a categorical value such as a series name. If **z** is not specified, it defaults to **stroke** if a channel, or **fill** if a channel.

The **fill** defaults to *none*. The **stroke** defaults to *currentColor* if the fill is *none*, and to *none* otherwise. If the stroke is defined as a channel, the line will be broken into contiguous overlapping segments when the stroke color changes; the stroke color will apply to the interval spanning the current data point and the following data point. This behavior also applies to the **fill**, **fillOpacity**, **strokeOpacity**, **strokeWidth**, **opacity**, **href**, **title**, and **ariaLabel** channels. When any of these channels are used, setting an explicit **z** channel (possibly to null) is strongly recommended. The **strokeWidth** defaults to 1.5, the **strokeLinecap** and **strokeLinejoin** default to *round*, and the **strokeMiterlimit** defaults to 1.

Points along the line are connected in input order. Likewise, if there are multiple series via the **z**, **fill**, or **stroke** channel, the series are drawn in input order such that the last series is drawn on top. Typically, the data is already in sorted order, such as chronological for time series; if sorting is needed, consider a [sort transform](../transforms/sort.md).

The line mark supports [curve options](../features/curves.md) to control interpolation between points, and [marker options](../features/markers.md) to add a marker (such as a dot or an arrowhead) on each of the control points. The default curve is *auto*, which is equivalent to *linear* if there is no [projection](../features/projections.md), and otherwise uses the associated projection. If any of the **x** or **y** values are invalid (undefined, null, or NaN), the line will be interrupted, resulting in a break that divides the line shape into multiple segments. (See [d3-shape’s *line*.defined](https://github.com/d3/d3-shape/blob/main/README.md#line_defined) for more.) If a line segment consists of only a single point, it may appear invisible unless rendered with rounded or square line caps. In addition, some curves such as *cardinal-open* only render a visible segment if it contains multiple points.

## line(*data*, *options*)

```js
Plot.line(aapl, {x: "Date", y: "Close"})
```

Returns a new line with the given *data* and *options*. If neither the **x** nor **y** options are specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

## lineX(*data*, *options*)

```js
Plot.lineX(aapl.map(d => d.Close))
```

Similar to [line](#line-data-options) except that if the **x** option is not specified, it defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …]. If the **y** option is not specified, it defaults to [0, 1, 2, …].

If the **interval** option is specified, the [binY transform](../transforms/bin.md) is implicitly applied to the specified *options*. The reducer of the output *x* channel may be specified via the **reduce** option, which defaults to *first*. To default to zero instead of showing gaps in data, as when the observed value represents a quantity, use the *sum* reducer.

```js
Plot.lineX(observations, {y: "date", x: "temperature", interval: "day"})
```

The **interval** option is recommended to “regularize” sampled data; for example, if your data represents timestamped temperature measurements and you expect one sample per day, use "day" as the interval.

## lineY(*data*, *options*)

```js
Plot.lineY(aapl.map(d => d.Close))
```

Similar to [line](#line-data-options) except that if the **y** option is not specified, it defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …]. If the **x** option is not specified, it defaults to [0, 1, 2, …].

If the **interval** option is specified, the [binX transform](../transforms/bin.md) is implicitly applied to the specified *options*. The reducer of the output *y* channel may be specified via the **reduce** option, which defaults to *first*. To default to zero instead of showing gaps in data, as when the observed value represents a quantity, use the *sum* reducer.

```js
Plot.lineY(observations, {x: "date", y: "temperature", interval: "day"})
```

The **interval** option is recommended to “regularize” sampled data; for example, if your data represents timestamped temperature measurements and you expect one sample per day, use "day" as the interval.
