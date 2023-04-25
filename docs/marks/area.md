<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {useDark} from "../components/useDark.js";
import aapl from "../data/aapl.ts";
import industries from "../data/bls-industry-unemployment.ts";
import sftemp from "../data/sf-temperatures.ts";

const dark = useDark();

</script>

# Area mark

The **area mark** draws the region between a baseline (**x1**, **y1**) and a topline (**x2**, **y2**) as in an area chart. Often the baseline represents *y* = 0, and because the area mark interpolates between adjacent data points, typically both the *x* and *y* scales are quantitative or temporal.

:::plot https://observablehq.com/@observablehq/plot-area-simple
```js
Plot.areaY(aapl, {x: "Date", y: "Close"}).plot()
```
:::

The area mark has three constructors: [areaY](#areay-data-options) for when the baseline and topline share *x* values, as in a time-series area chart where time goes right→ (or ←left); [areaX](#areax-data-options) for when the baseline and topline share *y* values, as in a time-series area chart where time goes up↑ (or down↓); and lastly the rarely-used [area](#area-data-options) where the baseline and topline share neither *x* nor *y* values.

The area mark is often paired with a [line](./line.md) and [rule](./rule.md) mark to accentuate the topline and baseline.

:::plot https://observablehq.com/@observablehq/plot-area-and-line
```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.areaY(aapl, {x: "Date", y: "Close", fillOpacity: 0.3}),
    Plot.lineY(aapl, {x: "Date", y: "Close"}),
    Plot.ruleY([0])
  ]
})
```
:::

With the default definitions of **x** = index and **y** = [identity](../features/transforms.md#identity), you can pass an array of numbers as data. Below, a random walk is constructed with [d3.cumsum](https://observablehq.com/@d3/d3-cumsum?collection=@d3/d3-array) and [d3.randomNormal](https://observablehq.com/@d3/d3-random?collection=@d3/d3-random).

:::plot defer https://observablehq.com/@observablehq/plot-random-walk-area
```js
Plot.areaY(d3.cumsum({length: 600}, d3.randomNormal())).plot()
```
:::

As with [lines](./line.md), points in areas are connected in input order: the first point is connected to the second point, the second is connected to the third, and so on. Area data is typically in chronological order. Unsorted data may produce gibberish.

:::plot defer https://observablehq.com/@observablehq/plot-area-sort
```js
Plot.areaY(d3.shuffle(aapl.slice()), {x: "Date", y: "Close"}).plot() // 🌶️
```
:::

If your data isn’t sorted, use the [sort transform](../transforms/sort.md).

:::plot defer https://observablehq.com/@observablehq/plot-area-sort
```js
Plot.areaY(d3.shuffle(aapl.slice()), {x: "Date", y: "Close", sort: "Date"}).plot()
```
:::

When the baseline is not *y* = 0 but instead represents another dimension of data as in a band chart, specify **y1** and **y2** instead of **y**.

:::plot defer https://observablehq.com/@observablehq/plot-temperature-band
```js
Plot.plot({
  y: {
    label: "↑ Temperature (°F)",
    grid: true
  },
  marks: [
    Plot.areaY(sftemp, {x: "date", y1: "low", y2: "high"})
  ]
})
```
:::

:::tip
Since **y1** and **y2** refer to different fields here, a *y*-scale label is specified to improve readability. Also, the band above is spiky; you can smooth it by applying a [window transform](../transforms/window.md).
:::

While charts typically put *y* = 0 on the bottom edge, such that the area grows up↑, this is not required; reversing the *y* scale will produce a “hanging” area that grows down↓.

:::plot defer https://observablehq.com/@observablehq/plot-top-down-area-chart
```js
Plot.plot({
  x: {
    label: null
  },
  y: {
    grid: true,
    reverse: true
  },
  marks: [
    Plot.areaY(aapl, {x: "Date", y: "Close", fillOpacity: 0.3}),
    Plot.lineY(aapl, {x: "Date", y: "Close"}),
    Plot.ruleY([0])
  ]
})
```
:::

For a vertically-oriented baseline and topline, such as when time goes up↑ instead of right→, use [areaX](#areax-data-options) instead of [areaY](#areay-data-options) and swap **x** and **y**.

:::plot defer https://observablehq.com/@observablehq/plot-vertical-area-chart
```js
Plot.plot({
  x: {
    grid: true
  },
  marks: [
    Plot.areaX(aapl, {y: "Date", x: "Close", fillOpacity: 0.3}),
    Plot.lineX(aapl, {y: "Date", x: "Close"}),
    Plot.ruleX([0])
  ]
})
```
:::

If some channel values are undefined (or null or NaN), gaps will appear between adjacent points. To demonstrate, below we set the **y** value to NaN for the first three months of each year.

:::plot defer https://observablehq.com/@observablehq/plot-area-chart-with-missing-data
```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.areaY(aapl, {x: "Date", y: (d) => d.Date.getUTCMonth() < 3 ? NaN : d.Close, fillOpacity: 0.3}),
    Plot.lineY(aapl, {x: "Date", y: (d) => d.Date.getUTCMonth() < 3 ? NaN : d.Close}),
    Plot.ruleY([0])
  ]
})
```
:::

Supplying undefined values is not the same as filtering the data: the latter will interpolate between the data points. Observe the conspicuous straight lines below!

:::plot defer
```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.areaY(aapl, {filter: (d) => d.Date.getUTCMonth() >= 3, x: "Date", y: "Close", fillOpacity: 0.3}),
    Plot.lineY(aapl, {x: "Date", y: (d) => d.Date.getUTCMonth() < 3 ? NaN : d.Close}),
    Plot.ruleY([0])
  ]
})
```
:::

If a **fill** channel is specified, it is assumed to be ordinal or nominal; data is grouped into series and then implicitly [stacked](../transforms/stack.md).

:::plot defer https://observablehq.com/@observablehq/plot-stacked-areas
```js
Plot.plot({
  y: {
    transform: (d) => d / 1000,
    label: "↑ Unemployed (thousands)"
  },
  marks: [
    Plot.areaY(industries, {x: "date", y: "unemployed", fill: "industry"}),
    Plot.ruleY([0])
  ]
})
```
:::

:::warning CAUTION
This area chart uses color but does not include a [legend](../features/legends.md). This should usually be avoided because color cannot be interpreted without a legend, titles, or labels.
:::

Or, as a streamgraph with the **offset** stack transform option:

:::plot defer https://observablehq.com/@observablehq/plot-centered-streamgraph
```js
Plot.plot({
  y: {
    transform: (d) => d / 1000,
    label: "↑ Unemployed (thousands)"
  },
  marks: [
    Plot.areaY(industries, {x: "date", y: "unemployed", fill: "industry", offset: "wiggle"}),
  ]
})
```
:::

The **z** channel determines how data is grouped: if the **z** channel is not specified, but a varying **fill** channel is, the **fill** channel is used for **z**; the **z** channel will further fallback to a varying **stroke** channel if needed.

The **z** channel (either implicitly or explicitly) is typically used with the [stack transform](../transforms/stack.md) for a stacked area chart or streamgraph. You can disable the implicit stack transform and produce overlapping areas by setting **y2** instead of **y**.

:::plot defer https://observablehq.com/@observablehq/plot-overlapping-areas
```js
Plot.plot({
  marks: [
    Plot.areaY(industries, {x: "date", y2: "unemployed", z: "industry", fillOpacity: 0.1}),
    Plot.lineY(industries, {x: "date", y: "unemployed", z: "industry", strokeWidth: 1})
  ]
})
```
:::

To vary **fill** within a single series, set the **z** option to null.

:::plot defer https://observablehq.com/@observablehq/plot-variable-fill-area
```js
Plot.plot({
  color: {
    type: "log",
    legend: true
  },
  marks: [
    Plot.areaY(aapl, {x: "Date", y: "Close", fill: "Volume", z: null}),
    Plot.ruleY([0])
  ]
})
```
:::

As an alternative to overlapping or stacking, [faceting](../features/facets.md) will produce small multiples, here arranged vertically with a shared *x*-axis.

:::plot defer https://observablehq.com/@observablehq/plot-faceted-areas
```js
Plot.plot({
  height: 720,
  axis: null,
  marks: [
    Plot.areaY(industries, {x: "date", y: "unemployed", fy: "industry"}),
    Plot.text(industries, Plot.selectFirst({text: "industry", fy: "industry", frameAnchor: "top-left", dx: 6, dy: 6})),
    Plot.frame()
  ]
})
```
:::

:::tip
Above, smaller industries such as agriculture and mining & extraction are dwarfed by larger industries such as wholesale & retail trade. To emphasize each industry’s trend, instead of comparing absolute numbers across industries, you could use the [normalize transform](../transforms/normalize.md).
:::

Or, as a [horizon chart](https://observablehq.com/@observablehq/plot-horizon), where the area is repeated at different scales with different colors, showing both small-scale variation in position and large-scale variation in color:

:::plot defer https://observablehq.com/@observablehq/plot-faceted-areas
```js-vue
Plot.plot((() => {
  const bands = 7;
  const step = d3.max(industries, (d) => d.unemployed) / bands;
  return {
    height: 720,
    axis: null,
    y: {domain: [0, step]},
    color: {scheme: "{{dark ? "viridis" : "YlGnBu"}}"},
    facet: {data: industries, y: "industry"},
    marks: [
      d3.range(bands).map((i) => Plot.areaY(industries, {x: "date", y: (d) => d.unemployed - i * step, fill: i, clip: true})),
      Plot.text(industries, Plot.selectFirst({text: "industry", frameAnchor: "top-left", dx: 6, dy: 6})),
      Plot.frame()
    ]
  };
})())
```
:::

See also the [ridgeline chart](https://observablehq.com/@observablehq/plot-ridgeline) example.

Interpolation is controlled by the [**curve** option](../features/curves.md). The default curve is *linear*, which draws straight line segments between pairs of adjacent points. A *step* curve is nice for emphasizing when the value changes, while *basis* and *catmull–rom* are nice for smoothing.

## Area options

The following channels are required:

* **x1** - the horizontal position of the baseline; bound to the *x* scale
* **y1** - the vertical position of the baseline; bound to the *y* scale

In addition to the [standard mark options](../features/marks.md#mark-options), the following optional channels are supported:

* **x2** - the horizontal position of the topline; bound to the *x* scale
* **y2** - the vertical position of the topline; bound to the *y* scale
* **z** - a categorical value to group data into series

If **x2** is not specified, it defaults to **x1**. If **y2** is not specified, it defaults to **y1**. These defaults facilitate sharing *x* or *y* coordinates between the baseline and topline. See also the implicit stack transform and shorthand **x** and **y** options supported by [areaY](#areay-data-options) and [areaX](#areax-data-options).

By default, the data is assumed to represent a single series (*i.e.*, a single value that varies over time). If the **z** channel is specified, data is grouped by **z** to form separate series. Typically **z** is a categorical value such as a series name. If **z** is not specified, it defaults to **fill** if a channel, or **stroke** if a channel.

The **stroke** defaults to *none*. The **fill** defaults to *currentColor* if the stroke is *none*, and to *none* otherwise. If the fill is defined as a channel, the area will be broken into contiguous overlapping segments when the fill color changes; the fill color will apply to the interval spanning the current data point and the following data point. This behavior also applies to the **fillOpacity**, **stroke**, **strokeOpacity**, **strokeWidth**, **opacity**, **href**, **title**, and **ariaLabel** channels. When any of these channels are used, setting an explicit **z** channel (possibly to null) is strongly recommended. The **strokeLinecap** and **strokeLinejoin** default to *round*, and the **strokeMiterlimit** defaults to 1.

Points along the baseline and topline are connected in input order. Likewise, if there are multiple series via the **z**, **fill**, or **stroke** channel, the series are drawn in input order such that the last series is drawn on top. Typically, the data is already in sorted order, such as chronological for time series; if sorting is needed, consider a [sort transform](../transforms/sort.md).

The area mark supports [curve options](../features/curves.md) to control interpolation between points. If any of the **x1**, **y1**, **x2**, or **y2** values are invalid (undefined, null, or NaN), the baseline and topline will be interrupted, resulting in a break that divides the area shape into multiple segments. (See [d3-shape’s *area*.defined](https://github.com/d3/d3-shape/blob/main/README.md#area_defined) for more.) If an area segment consists of only a single point, it may appear invisible unless rendered with rounded or square line caps. In addition, some curves such as *cardinal-open* only render a visible segment if it contains multiple points.

## areaY(*data*, *options*)

```js
Plot.areaY(aapl, {x: "Date", y: "Close"})
```

Returns a new area with the given *data* and *options*. This constructor is used when the baseline and topline share *x* values, as in a time-series area chart where time goes right→. If neither the **y1** nor **y2** option is specified, the **y** option may be specified as shorthand to apply an implicit [stackY transform](../transforms/stack.md); this is the typical configuration for an area chart with a baseline at *y* = 0. If the **y** option is not specified, it defaults to the identity function. The **x** option specifies the **x1** channel; and the **x1** and **x2** options are ignored.

If the **interval** option is specified, the [binX transform](../transforms/bin.md) is implicitly applied to the specified *options*. The reducer of the output *y* channel may be specified via the **reduce** option, which defaults to *first*. To default to zero instead of showing gaps in data, as when the observed value represents a quantity, use the *sum* reducer.

```js
Plot.areaY(observations, {x: "date", y: "temperature", interval: "day"})
```

The **interval** option is recommended to “regularize” sampled data; for example, if your data represents timestamped temperature measurements and you expect one sample per day, use "day" as the interval.

The **areaY** mark draws the region between a baseline (*y1*) and a topline (*y2*) as in an area chart. When the baseline is *y* = 0, the *y* channel can be specified instead of *y1* and *y2*. For example, here is an area chart of Apple’s stock price.

## areaX(*data*, *options*)

```js
Plot.areaX(aapl, {y: "Date", x: "Close"})
```

Returns a new area with the given *data* and *options*. This constructor is used when the baseline and topline share *y* values, as in a time-series area chart where time goes up↑. If neither the **x1** nor **x2** option is specified, the **x** option may be specified as shorthand to apply an implicit [stackX transform](../transforms/stack.md); this is the typical configuration for an area chart with a baseline at *x* = 0. If the **x** option is not specified, it defaults to the identity function. The **y** option specifies the **y1** channel; and the **y1** and **y2** options are ignored.

If the **interval** option is specified, the [binY transform](../transforms/bin.md) is implicitly applied to the specified *options*. The reducer of the output *x* channel may be specified via the **reduce** option, which defaults to *first*. To default to zero instead of showing gaps in data, as when the observed value represents a quantity, use the *sum* reducer.

```js
Plot.areaX(observations, {y: "date", x: "temperature", interval: "day"})
```

The **interval** option is recommended to “regularize” sampled data; for example, if your data represents timestamped temperature measurements and you expect one sample per day, use "day" as the interval.

## area(*data*, *options*)

```js
Plot.area(aapl, {x1: "Date", y1: 0, y2: "Close"})
```

Returns a new area with the given *data* and *options*. This method is rarely used directly; it is only needed when the baseline and topline have neither common **x** nor **y** values. [areaY](#areay-data-options) is used in the common horizontal orientation where the baseline and topline share **x** values, while [areaX](#areax-data-options) is used in the vertical orientation where the baseline and topline share **y** values.
