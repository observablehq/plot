<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import aapl from "../data/aapl.ts";
import bls from "../data/bls-industry-unemployment.ts";
import sftemp from "../data/sf-temperatures.ts";

</script>

# Area mark

The **area mark** draws the region between a baseline (**x1**, **y1**) and a topline (**x2**, **y2**) as in an area chart. Often the baseline represents *y* = 0, and typically both the *x* and *y* scales are quantitative or temporal.

:::plot
```js
Plot.areaY(aapl, {x: "Date", y: "Close"}).plot()
```
:::

The area mark has three constructors: [areaY](#areay-data-options) for when the baseline and topline share *x* values, as in a time-series area chart where time goes right→; [areaX](#areax-data-options) for when the baseline and topline share *y* values, as in a time-series area chart where time goes up↑ (or down↓); and lastly the rarely-used [area](#area-data-options) where the baseline and topline share neither *x* nor *y* values.

The area mark is often paired with a [line](./line.md) and [rule](./rule.md) mark to accentuate the topline and baseline.

:::plot
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

With the default definitions of **x** = *index* and **y** = *identity*, you can pass an array of numbers as data. Below, a random walk is constructed with [d3.cumsum](https://observablehq.com/@d3/d3-cumsum?collection=@d3/d3-array) and [d3.randomNormal](https://observablehq.com/@d3/d3-random?collection=@d3/d3-random).

:::plot
```js
Plot.areaY(d3.cumsum({length: 600}, d3.randomNormal())).plot()
```
:::

As with [lines](./line.md), points in areas are connected in input order: the first point is connected to the second point, the second is connected to the third, and so on. Area data is typically in chronological order. Unsorted data may produce gibberish.

:::plot
```js
Plot.areaY(d3.shuffle(aapl.slice()), {x: "Date", y: "Close"}).plot() // 🌶️
```
:::

If your data is unsorted, you can use the [sort transform](../transforms/sort.md).

:::plot
```js{4}
Plot.areaY(d3.shuffle(aapl.slice()), {x: "Date", y: "Close", sort: "Date"}).plot()
```
:::

When the baseline is not *y* = 0 but instead represents another dimension of data as in a band chart, specify **y1** and **y2** instead of **y**.

:::plot
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
Since **y1** and **y2** refer to different fields here, a *y*-scale label is specified to improve readability.
:::

The band above is spikey; we can smooth it by applying a 14-day moving average to **y1** and **y2** with the [window transform](../transforms/window.md), and do the same for a midline. We can also add a [rule](./rule.md) to indicate the freezing point, 32°F.

:::plot
```js
Plot.plot({
  y: {
    label: "↑ Temperature (°F)",
    grid: true
  },
  marks: [
    Plot.ruleY([32]),
    Plot.areaY(sftemp, Plot.windowY(14, {x: "date", y1: "low", y2: "high", fillOpacity: 0.3})),
    Plot.line(sftemp, Plot.windowY(14, {x: "date", y: (d) => (d.low + d.high) / 2}))
  ]
})
```
:::

:::danger TODO
Cut this example, and just link to the window transform?
:::

While charts typically put *y* = 0 on the bottom edge, such that the area grows up↑, this is not required; reversing the *y* scale will produce a “hanging” area that grows down↓.

:::plot
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

:::plot
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

:::plot
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

:::plot
```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.areaY(aapl, {filter: (d) => d.Date.getUTCMonth() >= 3, x: "Date", y: "Close", fillOpacity: 0.3}),
    Plot.lineY(aapl, {filter: (d) => d.Date.getUTCMonth() >= 3, x: "Date", y: "Close"}),
    Plot.ruleY([0])
  ]
})
```
:::

Interpolation is controlled by the [**curve** option](../features/curves.md). The default curve is *linear*, which draws straight line segments between pairs of adjacent points. A *step* curve is nice for emphasizing when the value changes, while *basis* and *catmull–rom* are nice for smoothing.

:::plot
```js
Plot.plot({
  marks: [
    Plot.areaY(bls, {filter: (d) => d.industry === "Construction", x: "date", y: "unemployed", curve: "step", fillOpacity: 0.1}),
    Plot.lineY(bls, {filter: (d) => d.industry === "Construction", x: "date", y: "unemployed", curve: "step"}),
    Plot.ruleY([0])
  ]
})
```
:::

:::danger TODO
Cut this example, and just link to the curve documentation?
:::

The **z** channel groups data along an ordinal or nominal dimension, producing multiple areas. This is typically used with the [stack transform](../transforms/stack.md) for a stacked area chart or streamgraph, but it can also be used for overlapping areas by setting **y2** instead of **y**.

:::plot
```js
Plot.plot({
  marks: [
    Plot.areaY(bls, {x: "date", y2: "unemployed", z: "industry", fillOpacity: 0.1}),
    Plot.lineY(bls, {x: "date", y: "unemployed", z: "industry", strokeWidth: 1})
  ]
})
```
:::

:::danger TODO
Show the stacked example first, since that’s more common.
:::

If the **z** channel is not specified, but a varying **fill** channel is, the **fill** channel is used for **z**. The **z** channel will further fallback to a varying **stroke** channel if needed.

:::plot
```js
Plot.plot({
  y: {
    transform: d => d / 1000,
    label: "↑ Unemployed (thousands)"
  },
  marks: [
    Plot.areaY(bls, {x: "date", y: "unemployed", fill: "industry"}), // implicit stacking
    Plot.ruleY([0])
  ]
})
```
:::

To vary **fill** within a single series, set the **z** option to null.

:::plot defer
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

As an alternative to overlapping or stacking, faceting can be used to produce small multiples, here arranged vertically with a shared *x*-axis.

:::plot
```js
Plot.plot({
  height: 600,
  marginRight: 140,
  axis: null,
  fy: {
    axis: "right",
    label: null
  },
  marks: [
    Plot.areaY(bls, {x: "date", y: "unemployed", fy: "industry", fillOpacity: 0.2}),
    Plot.lineY(bls, {x: "date", y: "unemployed", fy: "industry", strokeWidth: 1})
  ]
})
```
:::

:::danger TODO
Cut this example, and the one below, and just link to the faceting documentation? Or perhaps move these examples there?
:::

Above, smaller industries such as agriculture and mining & extraction are dwarfed by larger industries such as wholesale & retail trade. To emphasize each industry’s trend, instead of comparing absolute numbers across industries, we can normalize unemployment relative to the median for each industry. Now the job loss in mining & extraction is more readily apparent.

:::plot
```js
Plot.plot({
  height: 600,
  marginRight: 140,
  axis: null,
  fy: {
    axis: "right",
    label: null
  },
  marks: [
    Plot.areaY(bls, Plot.normalizeY("median", {x: "date", y: "unemployed", fy: "industry", fillOpacity: 0.2})),
    Plot.lineY(bls, Plot.normalizeY("median", {x: "date", y: "unemployed", fy: "industry", strokeWidth: 1}))
  ]
})
```
:::

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

Points along the baseline and topline are connected in input order. Likewise, if there are multiple series via the **z**, **fill**, or **stroke** channel, the series are drawn in input order such that the last series is drawn on top. Typically, the data is already in sorted order, such as chronological for time series; if sorting is needed, consider a [sort transform](#transforms).

The area mark supports [curve options](#curves) to control interpolation between points. If any of the **x1**, **y1**, **x2**, or **y2** values are invalid (undefined, null, or NaN), the baseline and topline will be interrupted, resulting in a break that divides the area shape into multiple segments. (See [d3-shape’s *area*.defined](https://github.com/d3/d3-shape/blob/main/README.md#area_defined) for more.) If an area segment consists of only a single point, it may appear invisible unless rendered with rounded or square line caps. In addition, some curves such as *cardinal-open* only render a visible segment if it contains multiple points.

## areaY(*data*, *options*)

```js
Plot.areaY(aapl, {x: "Date", y: "Close"})
```

Returns a new area with the given *data* and *options*. This constructor is used when the baseline and topline share *x* values, as in a time-series area chart where time goes right→. If neither the **y1** nor **y2** option is specified, the **y** option may be specified as shorthand to apply an implicit [stackY transform](#plotstackystack-options); this is the typical configuration for an area chart with a baseline at *y* = 0. If the **y** option is not specified, it defaults to the identity function. The **x** option specifies the **x1** channel; and the **x1** and **x2** options are ignored.

If the **interval** option is specified, the [binX transform](#bin) is implicitly applied to the specified *options*. The reducer of the output *y* channel may be specified via the **reduce** option, which defaults to *first*. To default to zero instead of showing gaps in data, as when the observed value represents a quantity, use the *sum* reducer.

```js
Plot.areaY(observations, {x: "date", y: "temperature", interval: "day"})
```

:::danger TODO
Cut this example and link to the interval transform?
:::

The **interval** option is recommended to “regularize” sampled data; for example, if your data represents timestamped temperature measurements and you expect one sample per day, use "day" as the interval.

The **areaY** mark draws the region between a baseline (*y1*) and a topline (*y2*) as in an area chart. When the baseline is *y* = 0, the *y* channel can be specified instead of *y1* and *y2*. For example, here is an area chart of Apple’s stock price.

## areaX(*data*, *options*)

```js
Plot.areaX(aapl, {y: "Date", x: "Close"})
```

Returns a new area with the given *data* and *options*. This constructor is used when the baseline and topline share *y* values, as in a time-series area chart where time goes up↑. If neither the **x1** nor **x2** option is specified, the **x** option may be specified as shorthand to apply an implicit [stackX transform](#plotstackxstack-options); this is the typical configuration for an area chart with a baseline at *x* = 0. If the **x** option is not specified, it defaults to the identity function. The **y** option specifies the **y1** channel; and the **y1** and **y2** options are ignored.

If the **interval** option is specified, the [binY transform](#bin) is implicitly applied to the specified *options*. The reducer of the output *x* channel may be specified via the **reduce** option, which defaults to *first*. To default to zero instead of showing gaps in data, as when the observed value represents a quantity, use the *sum* reducer.

```js
Plot.areaX(observations, {y: "date", x: "temperature", interval: "day"})
```

:::danger TODO
Cut this example and link to the interval transform?
:::

The **interval** option is recommended to “regularize” sampled data; for example, if your data represents timestamped temperature measurements and you expect one sample per day, use "day" as the interval.

## area(*data*, *options*)

```js
Plot.area(aapl, {x1: "Date", y1: 0, y2: "Close"})
```

Returns a new area with the given *data* and *options*. This method is rarely used directly; it is only needed when the baseline and topline have neither common **x** nor **y** values. [areaY](#areay-data-options) is used in the common horizontal orientation where the baseline and topline share **x** values, while [areaX](#areax-data-options) is used in the vertical orientation where the baseline and topline share **y** values.
