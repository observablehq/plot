<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, shallowRef, onMounted} from "vue";
import {useDark} from "../components/useDark.js";

const dark = useDark();
const diamonds = shallowRef([]);
const seattle = shallowRef([]);
const olympians = shallowRef([{weight: 31, height: 1.21, sex: "female"}, {weight: 170, height: 2.21, sex: "male"}]);
const povcalnet = shallowRef([]);
const us = shallowRef(null);
const counties = computed(() => us.value ? topojson.feature(us.value, us.value.objects.counties).features : []);
const countyboxes = computed(() => counties.value.map((d) => d3.geoBounds(d).flat()));
const bins = d3.bin()(d3.range(1000).map(d3.randomNormal.source(d3.randomLcg(42))()));

onMounted(() => {
  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
  d3.csv("../data/diamonds.csv", d3.autoType).then((data) => (diamonds.value = data));
  d3.csv("../data/seattle-weather.csv", d3.autoType).then((data) => (seattle.value = data));
  d3.csv("../data/povcalnet.csv", d3.autoType).then((data) => (povcalnet.value = data));
  d3.json("../data/us-counties-10m.json").then((data) => (us.value = data));
});

</script>

# Rect mark

:::tip
The rect mark is one of several marks in Plot for drawing rectangles; it should be used when both dimensions are quantitative. See also [bar](./bar.md) and [cell](./cell.md).
:::

The **rect mark** draws axis-aligned rectangles defined by **x1**, **y1**, **x2**, and **y2**. For example, here we display geographic bounding boxes of U.S. counties represented as [*x1*, *y1*, *x2*, *y2*] tuples, where *x1* & *x2* are degrees longitude and *y1* & *y2* are degrees latitude.

:::plot defer
```js
Plot.plot({
  projection: "albers-usa",
  marks: [
    Plot.rect(countyboxes, {
      x1: "0", // or ([x1]) => x1
      y1: "1", // or ([, y1]) => y1
      x2: "2", // or ([,, x2]) => x2
      y2: "3", // or ([,,, y2]) => y2
      stroke: "currentColor"
    })
  ]
})
```
:::

More commonly, the rect mark is used to produce histograms or heatmaps of quantitative data. For example, given some binned observations computed by [d3.bin](https://github.com/d3/d3-array/blob/main/README.md#bins), we can produce a basic histogram with [rectY](#recty-data-options) as follows:

:::plot
```js
Plot.rectY(bins, {x1: "x0", x2: "x1", y: "length"}).plot({round: true})
```
:::

```js
bins = d3.bin()(d3.range(1000).map(d3.randomNormal()))
```

:::info
d3.bin uses *x0* and *x1* to represent the lower and upper bound of each bin, whereas the rect mark uses **x1** and **x2**. The *length* field is the count of values in each bin, which is encoded as **y**.
:::

Most often, the rect mark is paired with the [bin transform](../transforms/bin.md) to bin quantitative values as part of the plot itself. As an added bonus, this sets default [inset options](../features/marks.md#mark-options) for a 1px gap separating adjacent rects, improving readability.

:::plot
```js
Plot.rectY(d3.range(1000).map(d3.randomNormal()), Plot.binX()).plot()
```
:::

Like the [bar mark](./bar.md), the rect mark has two convenience constructors for common orientations: [rectX](#rectx-data-options) is for horizontal→ rects and applies an implicit [stackX transform](../transforms/stack.md#stackx-stack-options), while [rectY](#recty-data-options) is for vertical↑ rects and applies an implicit [stackY transform](../transforms/stack.md#stacky-stack-options).

:::plot defer
```js
Plot.plot({
  color: {legend: true},
  marks: [
    Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", fill: "sex"})),
    Plot.ruleY([0])
  ]
})
```
:::

For overlapping rects, you can opt-out of the implicit stack transform by specifying either **x1** or **x2** for rectX, and likewise either **y1** or **y2** for rectY.

:::plot defer
```js-vue
Plot.plot({
  round: true,
  color: {legend: true},
  marks: [
    Plot.rectY(olympians, Plot.binX({y2: "count"}, {x: "weight", fill: "sex", mixBlendMode: "{{dark ? "screen" : "multiply"}}"})),
    Plot.ruleY([0])
  ]
})
```
:::

:::warning CAUTION
While the **mixBlendMode** option is useful for mitigating occlusion, it can be slow to render if there are many elements. More than two overlapping histograms may also be hard to read.
:::

The rect mark and bin transform naturally support [faceting](../features/facets.md), too.

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", fy: "sex"})),
    Plot.ruleY([0])
  ]
})
```
:::

The [rect constructor](#rect-data-options), again with the [bin transform](../transforms/bin.md), can produce two-dimensional histograms (heatmaps) where density is represented by the **fill** color encoding.

:::plot defer
```js
Plot.plot({
  height: 640,
  marginLeft: 60,
  color: {
    scheme: "BuPu",
    type: "symlog"
  },
  marks: [
    Plot.rect(diamonds, Plot.bin({fill: "count"}, {x: "carat", y: "price", thresholds: 100}))
  ]
})
```
:::

:::tip
A similar plot can be made with the [dot mark](./dot.md), if you’d prefer a size encoding.
:::

Below we recreate an uncommon [chart by Max Roser](https://ourworldindata.org/poverty-minimum-growth-needed) that visualizes global poverty. Each rect represents a country: *x* encodes the country’s population, while *y* encodes the proportion of that population living in poverty; hence area represents the number of people living in poverty. Rects are [stacked](../transforms/stack.md) along *x* in order of descending *y*.

:::plot defer
```js
Plot.plot({
  x: {label: "Population (millions) →"},
  y: {percent: true, label: "↑ Proportion living on less than $30 per day (%)"},
  marks: [
    Plot.rectY(povcalnet, Plot.stackX({
      filter: (d) => ["N", "A"].includes(d.CoverageType),
      x: "ReqYearPopulation",
      order: "HeadCount",
      reverse: true,
      y2: "HeadCount", // y2 to avoid stacking by y
      title: (d) => `${d.CountryName}\n${(d.HeadCount * 100).toFixed(1)}%`,
      insetLeft: 0.2,
      insetRight: 0.2
    })),
    Plot.ruleY([0])
  ]
})
```
:::

The [interval transform](../transforms/interval.md) may be used to convert a single value in **x** or **y** (or both) into an extent. For example, the chart below shows the observed daily maximum temperature in Seattle for the year 2015. The day-in-month and month-in-year numbers are expanded to unit intervals by setting the **interval** option to 1.

:::plot defer
```js
Plot.plot({
  aspectRatio: 1,
  y: {ticks: 12, tickFormat: Plot.formatMonth("en", "narrow")},
  marks: [
    Plot.rect(seattle, {
      filter: (d) => d.date.getUTCFullYear() === 2015,
      x: (d) => d.date.getUTCDate(),
      y: (d) => d.date.getUTCMonth(),
      interval: 1,
      fill: "temp_max",
      inset: 0.5
    })
  ]
})
```
:::

:::tip
A similar chart could be made with the [cell mark](./cell.md) using ordinal *x* and *y* scales instead, or with the [dot mark](./dot.md) as a scatterplot.
:::

## Rect options

The following channels are optional:

* **x1** - the starting horizontal position; bound to the *x* scale
* **y1** - the starting vertical position; bound to the *y* scale
* **x2** - the ending horizontal position; bound to the *x* scale
* **y2** - the ending vertical position; bound to the *y* scale

Typically either **x1** and **x2** are specified, or **y1** and **y2**, or both.

If an **interval** is specified, such as d3.utcDay, **x1** and **x2** can be derived from **x**: *interval*.floor(*x*) is invoked for each **x** to produce **x1**, and *interval*.offset(*x1*) is invoked for each **x1** to produce **x2**. The same is true for **y**, **y1**, and **y2**, respectively. If the interval is specified as a number *n*, **x1** and **x2** are taken as the two consecutive multiples of *n* that bracket **x**.

The rect mark supports the [standard mark options](../features/marks.md#mark-options), including insets and rounded corners. The **stroke** defaults to *none*. The **fill** defaults to *currentColor* if the stroke is *none*, and to *none* otherwise.

## rect(*data*, *options*)

```js
Plot.rect(olympians, Plot.bin({fill: "count"}, {x: "weight", y: "height"}))
```

Returns a new rect with the given *data* and *options*.

## rectX(*data*, *options*)

```js
Plot.rectX(olympians, Plot.binY({x: "count"}, {y: "weight"}))
```

Equivalent to [rect](#rect-data-options), except that if neither the **x1** nor **x2** option is specified, the **x** option may be specified as shorthand to apply an implicit [stackX transform](../transforms/stack.md); this is the typical configuration for a histogram with horizontal→ rects aligned at *x* = 0. If the **x** option is not specified, it defaults to the identity function.

## rectY(*data*, *options*)

```js
Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight"}))
```

Equivalent to [rect](#rect-data-options), except that if neither the **y1** nor **y2** option is specified, the **y** option may be specified as shorthand to apply an implicit [stackY transform](../transforms/stack.md); this is the typical configuration for a histogram with vertical↑ rects aligned at *y* = 0. If the **y** option is not specified, it defaults to the identity function.
