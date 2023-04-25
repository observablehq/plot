<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import {useDark} from "../components/useDark.js";
import penguins from "../data/penguins.ts";

const dark = useDark();
const olympians = shallowRef([{weight: 31, height: 1.21, sex: "female"}, {weight: 170, height: 2.21, sex: "male"}]);

onMounted(() => {
  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
});

</script>

# Group transform

:::tip
The group transform is for aggregating ordinal or nominal data. For quantitative or temporal data, use the [bin transform](./bin.md).
:::

The **group transform** groups ordinal or nominal data—discrete values such as name, type, or category. You can then compute summary statistics for each group, such as a count, sum, or proportion. The group transform is most often used to make bar charts with the [bar mark](../marks/bar.md).

For example, the bar chart below shows a distribution of Olympic athletes by sport.

:::plot defer https://observablehq.com/@observablehq/plot-group-olympic-athletes-by-sport
```js
Plot.plot({
  marginBottom: 100,
  x: {label: null, tickRotate: 90},
  y: {grid: true},
  marks: [
    Plot.barY(olympians, Plot.groupX({y: "count"}, {x: "sport"})),
    Plot.ruleY([0])
  ]
})
```
:::

:::tip
Ordinal domains are sorted naturally (alphabetically) by default. Either set the [scale **domain**](../features/scales.md) explicitly to change the order, or use the mark [**sort** option](../features/marks.md#sort-option) to derive the scale domain from a channel.
:::

The groupX transform groups on **x**. The *outputs* argument (here `{y: "count"}`) declares desired output channels (**y**) and the associated reducer (*count*). Hence the height of each bar above represents the number of penguins of each species.

<!-- For example, to sort **x** by descending **y**: -->

<!-- :::plot
```js
Plot.plot({
  marginBottom: 100,
  x: {label: null, tickRotate: 90},
  y: {grid: true},
  marks: [
    Plot.barY(olympians, Plot.groupX({y: "count"}, {x: "sport", sort: {x: "y", reverse: true}})),
    Plot.ruleY([0])
  ]
})
```
::: -->

While the groupX transform is often used to generate **y**, it can output to any channel. For example, by declaring **r** in *outputs*, we can generate dots of size proportional to the number of athletes in each sport.

:::plot https://observablehq.com/@observablehq/plot-groups-as-dots
```js
Plot.plot({
  marginBottom: 100,
  x: {label: null, tickRotate: 90},
  r: {range: [0, 14]},
  marks: [
    Plot.dot(olympians, Plot.groupX({r: "count"}, {x: "sport"}))
  ]
})
```
:::

The **fill** channel meanwhile will produce a one-dimensional heatmap. Since there is no **y** channel below, we use a [cell](../marks/cell.md) instead of a bar.

:::plot defer https://observablehq.com/@observablehq/plot-groups-as-cells
```js-vue
Plot.plot({
  marginBottom: 80,
  x: {tickRotate: 90},
  color: {scheme: "{{dark ? "turbo" : "YlGnBu"}}"},
  marks: [
    Plot.cell(olympians, Plot.groupX({fill: "count"}, {x: "sport"}))
  ]
})
```
:::

We aren’t limited to the *count* reducer. We can use the *mode* reducer, for example, to show which sex is more prevalent in each sport: <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[1]}`}">men</span> are represented more often than <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[0]}`}">women</span> in every sport except gymnastics and fencing.

:::plot defer https://observablehq.com/@observablehq/plot-group-and-mode-reducer
```js
Plot.plot({
  marginBottom: 80,
  x: {tickRotate: 90},
  marks: [
    Plot.cell(olympians, Plot.groupX({fill: "mode"}, {fill: "sex", x: "sport"}))
  ]
})
```
:::

You can partition groups using **z**. If **z** is undefined, it defaults to **fill** or **stroke**, if any. In conjunction with the barY mark’s implicit [stackY transform](./stack.md), this will produce stacked bars.

:::plot defer https://observablehq.com/@observablehq/plot-two-class-stacked-bars
```js
Plot.plot({
  marginBottom: 100,
  x: {label: null, tickRotate: 90},
  y: {grid: true},
  color: {legend: true},
  marks: [
    Plot.barY(olympians, Plot.groupX({y: "count"}, {x: "sport", fill: "sex"})),
    Plot.ruleY([0])
  ]
})
```
:::

:::tip
You can invoke the stack transform explicitly as `Plot.stackY(Plot.groupX({y: "count"}, {x: "sport", fill: "sex"}))`, producing an identical chart.
:::

You can opt-out of the implicit stackY transform by having groupX generate **y1** or **y2** instead of **y** (and similarly **x1** or **x2** for stackX and groupY). When overlapping marks, use either opacity or blending to make the overlap visible.

:::plot defer https://observablehq.com/@observablehq/plot-two-class-overlapping-bars
```js-vue
Plot.plot({
  marginBottom: 100,
  x: {label: null, tickRotate: 90},
  y: {grid: true},
  color: {legend: true},
  marks: [
    Plot.barY(olympians, Plot.groupX({y2: "count"}, {x: "sport", fill: "sex", mixBlendMode: "{{dark ? "screen" : "multiply"}}"})),
    Plot.ruleY([0])
  ]
})
```
:::

:::warning CAUTION
While the **mixBlendMode** option is useful for mitigating occlusion, it can be slow to render if there are many elements. More than two overlapping histograms may also be hard to read.
:::

Perhaps better would be to make a grouped bar chart using [faceting](../features/facets.md). This is accomplished by setting the **fx** channel to facet horizontally on *sport*, while the **x** channel is used within each facet to draw side-by-side bars for each *sex*. The group transform automatically partitions groups by facet.

:::plot defer https://observablehq.com/@observablehq/plot-olympians-grouped-bar-chart
```js
Plot.plot({
  marginBottom: 100,
  fx: {padding: 0, label: null, tickRotate: 90, tickSize: 6},
  x: {axis: null, paddingOuter: 0.2},
  y: {grid: true},
  color: {legend: true},
  marks: [
    Plot.barY(olympians, Plot.groupX({y2: "count"}, {x: "sex", fx: "sport", fill: "sex"})),
    Plot.ruleY([0])
  ]
})
```
:::

Alternatively, below we use directional arrows (a [link mark](../marks/link.md) with [markers](../features/markers.md)) to indicate the difference in counts of <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[1]}`}">male</span> and <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[0]}`}">female</span> athletes by sport. The color of the arrow indicates which sex is more prevalent, while its length is proportional to the difference.

:::plot defer https://observablehq.com/@observablehq/plot-difference-arrows
```js
Plot.plot({
  marginBottom: 100,
  x: {label: null, tickRotate: 90},
  y: {grid: true, label: "↑ Frequency"},
  color: {type: "categorical", domain: [-1, 1], unknown: "#aaa", transform: Math.sign},
  marks: [
    Plot.ruleY([0]),
    Plot.link(
      olympians,
      Plot.groupX(
        {
          y1: (D) => d3.sum(D, (d) => d === "female"),
          y2: (D) => d3.sum(D, (d) => d === "male"),
          stroke: (D) => d3.sum(D, (d) => d === "male") - d3.sum(D, (d) => d === "female")
        },
        {
          x: "sport",
          y1: "sex",
          y2: "sex",
          markerStart: "dot",
          markerEnd: "arrow",
          stroke: "sex",
          strokeWidth: 2
        }
      )
    )
  ]
})
```
:::

The group transform comes in four orientations:

- [groupX](#groupx-outputs-options) groups on **x**, and often outputs **y** as in a vertical↑ bar chart;
- [groupY](#groupy-outputs-options) groups on **y**, and often outputs **x** as in a horizontal→ bar chart;
- [groupZ](#groupz-outputs-options) groups on *neither* **x** nor **y**, combining everything into one group; and
- [group](#group-outputs-options) groups on *both* **x** and **y**, and often outputs to **fill** or **r** as in a heatmap.

As you might guess, the groupY transform with the barX mark produces a horizontal→ bar chart. (We must increase the **marginLeft** to avoid the *y* axis labels from being cut off.)

:::plot defer https://observablehq.com/@observablehq/plot-sorted-horizontal-bars
```js
Plot.plot({
  marginLeft: 100,
  x: {grid: true},
  y: {label: null},
  marks: [
    Plot.barX(olympians, Plot.groupY({x: "count"}, {y: "sport", sort: {y: "x"}})),
    Plot.ruleX([0])
  ]
})
```
:::

You can produce a two-dimensional heatmap with group transform and a cell mark by generating a **fill** output channel. For example, we could show the median weight of athletes by sport (**x**) and sex (**y**).

:::plot defer https://observablehq.com/@observablehq/plot-grouped-olympians-heatmap
```js-vue
Plot.plot({
  marginBottom: 80,
  x: {label: null, tickRotate: 90},
  y: {label: null},
  color: {label: "Median weight (kg)", legend: true, scheme: "{{dark ? "turbo" : "YlGnBu"}}"},
  marks: [
    Plot.cell(olympians, Plot.group({fill: "median"}, {fill: "weight", x: "sport", y: "sex"}))
  ]
})
```
:::

Or, we could group athletes by sport and the number of gold medals 🥇 won. ([Michael Phelps](https://en.wikipedia.org/wiki/Michael_Phelps), the most decorated Olympian of all time, won five gold medals in the 2016 Summer Olympics. [Simone Biles](https://en.wikipedia.org/wiki/Simone_Biles) and [Katie Ledecky](https://en.wikipedia.org/wiki/Katie_Ledecky) each won four.)

:::plot defer https://observablehq.com/@observablehq/plot-olympians-by-gold-medals
```js-vue
Plot.plot({
  marginBottom: 100,
  x: {label: null, tickRotate: 90},
  y: {label: "↑ gold", labelAnchor: "top", reverse: true},
  color: {type: "sqrt", scheme: "{{dark ? "turbo" : "YlGnBu"}}"},
  marks: [
    Plot.cell(olympians, Plot.group({fill: "count"}, {x: "sport", y: "gold"}))
  ]
})
```
:::

We could instead output **r** and use a [dot mark](../marks/dot.md) whose size again represents the number of athletes in each group.

:::plot defer https://observablehq.com/@observablehq/plot-olympians-by-gold-medals-proportional-dots
```js-vue
Plot.plot({
  marginBottom: 100,
  x: {label: null, tickRotate: 90},
  y: {type: "point", label: "↑ gold", labelAnchor: "top", reverse: true},
  r: {range: [0, 12]},
  marks: [
    Plot.dot(olympians, Plot.group({r: "count"}, {x: "sport", y: "gold"}))
  ]
})
```
:::

We can add the **stroke** channel to show overlapping distributions by sex.

:::plot defer https://observablehq.com/@observablehq/plot-olympians-by-gold-medals-overlapping-dots
```js-vue
Plot.plot({
  marginBottom: 100,
  x: {label: null, tickRotate: 90},
  y: {type: "point", label: "↑ gold", labelAnchor: "top", reverse: true},
  r: {range: [0, 12]},
  marks: [
    Plot.dot(olympians, Plot.group({r: "count"}, {x: "sport", y: "gold", stroke: "sex"}))
  ]
})
```
:::

To group solely on **z** (or **fill** or **stroke**), use [groupZ](#groupz-outputs-options). The single stacked bar chart below (an alternative to a pie chart) shows the proportion of athletes by sport. The *proportion* reducer converts counts into normalized proportions adding up to 1, while the *first* reducer pulls out the name of the sport for labeling.

:::plot defer https://observablehq.com/@observablehq/plot-single-stacked-bar
```js
Plot.plot({
  height: 100,
  x: {percent: true},
  marks: [
    Plot.barX(
      olympians,
      Plot.stackX(
        {order: "x", reverse: true},
        Plot.groupZ(
          {x: "proportion"},
          {z: "sport", fillOpacity: 0.2, inset: 0.5}
        )
      )
    ),
    Plot.text(
      olympians,
      Plot.filter(
        (D) => D.length > 200,
        Plot.stackX(
          {order: "x", reverse: true},
          Plot.groupZ(
            {x: "proportion", text: "first"},
            {z: "sport", text: "sport", rotate: 90}
          )
        )
      )
    ),
    Plot.ruleX([0, 1])
  ]
})
```
:::

:::info
Although barX applies an implicit stackX transform, [textX](../marks/text.md) does not; this example uses an explicit stackX transform in both cases for clarity, and to pass the additional **order** and **reverse** options to place the largest sport on the left. The [filter transform](./filter.md) is applied after the stack transform to hide the labels on the smallest sports where the bars are too thin.
:::

## Group options

Given input *data* = [*d₀*, *d₁*, *d₂*, …], by default the resulting grouped data is an array of arrays where each inner array is a subset of the input data such as [[*d₁*, *d₂*, …], [*d₀*, …], …]. Each inner array is in input order. The outer array is in natural ascending order according to the associated dimension (*x* then *y*).

By specifying a different reducer for the **data** output, as described below, you can change how the grouped data is computed. The outputs may also include **filter** and **sort** options specified as reducers, and a **reverse** option to reverse the order of generated groups. By default, empty groups are omitted, and non-empty groups are generated in ascending (natural) order.

In addition to data, the following channels are automatically output:

* **x** - the horizontal position of the group
* **y** - the vertical position of the group
* **z** - the first value of the *z* channel, if any
* **fill** - the first value of the *fill* channel, if any
* **stroke** - the first value of the *stroke* channel, if any

The **x** output channel is only computed by the groupX and group transform; similarly the **y** output channel is only computed by the groupY and group transform.

You can declare additional output channels by specifying the channel name and desired reducer in the *outputs* object which is the first argument to the transform. For example, to use groupX to generate a **y** channel of group counts as in a frequency histogram:

```js
Plot.groupX({y: "count"}, {x: "species"})
```

The following named reducers are supported:

* *first* - the first value, in input order
* *last* - the last value, in input order
* *count* - the number of elements (frequency)
* *sum* - the sum of values
* *proportion* - the sum proportional to the overall total (weighted frequency)
* *proportion-facet* - the sum proportional to the facet total
* *min* - the minimum value
* *min-index* - the zero-based index of the minimum value
* *max* - the maximum value
* *max-index* - the zero-based index of the maximum value
* *mean* - the mean value (average)
* *median* - the median value
* *mode* - the value with the most occurrences
* *pXX* - the percentile value, where XX is a number in [00,99]
* *deviation* - the standard deviation
* *variance* - the variance per [Welford’s algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
* *identity* - the array of values

In addition, a reducer may be specified as:

* a function - passed the array of values for each group
* an object with a **reduceIndex** method, an optionally a **scope**

In the last case, the **reduceIndex** method is repeatedly passed two arguments: the index for each group (an array of integers), and the input channel’s array of values; it must then return the corresponding aggregate value for the group.

If the reducer object’s **scope** is *data*, then the **reduceIndex** method is first invoked for the full data; the return value of the **reduceIndex** method is then made available as a third argument. Similarly if the **scope** is *facet*, then the **reduceIndex** method is invoked for each facet, and the resulting reduce value is made available while reducing the facet’s groups. (This optional **scope** is used by the *proportion* and *proportion-facet* reducers.)

Most reducers require binding the output channel to an input channel; for example, if you want the **y** output channel to be a *sum* (not merely a count), there should be a corresponding **y** input channel specifying which values to sum. If there is not, *sum* will be equivalent to *count*.

```js
Plot.groupX({y: "sum"}, {x: "species", y: "body_mass_g"})
```

You can control whether a channel is computed before or after grouping. If a channel is declared only in *options* (and it is not a special group-eligible channel such as **x**, **y**, **z**, **fill**, or **stroke**), it will be computed after grouping and be passed the grouped data: each datum is the array of input data corresponding to the current group.

```js
Plot.groupX({y: "count"}, {x: "species", title: (group) => group.map((d) => d.body_mass_g).join("\n")})
```

This is equivalent to declaring the channel only in *outputs*.

```js
Plot.groupX({y: "count", title: (group) => group.map((d) => d.body_mass_g).join("\n")}, {x: "species"})
```

However, if a channel is declared in both *outputs* and *options*, then the channel in *options* is computed before grouping and can be aggregated using any built-in reducer (or a custom reducer function) during the group transform.

```js
Plot.groupX({y: "count", title: (masses) => masses.join("\n")}, {x: "species", title: "body_mass_g"})
```

If any of **z**, **fill**, or **stroke** is a channel, the first of these channels is considered the *z* dimension and will be used to subdivide groups.

The default reducer for the **title** channel returns a summary list of the top 5 values with the corresponding number of occurrences.

## group(*outputs*, *options*)

```js
Plot.group({fill: "count"}, {x: "island", y: "species"})
```

Groups on **x**, **y**, and the first channel of **z**, **fill**, or **stroke**, if any.

## groupX(*outputs*, *options*)

```js
Plot.groupX({y: "sum"}, {x: "species", y: "body_mass_g"})
```

Groups on **x** and the first channel of **z**, **fill**, or **stroke**, if any.

## groupY(*outputs*, *options*)

```js
Plot.groupY({x: "sum"}, {y: "species", x: "body_mass_g"})
```

Groups on **y** and the first channel of **z**, **fill**, or **stroke**, if any.

## groupZ(*outputs*, *options*)

```js
Plot.groupZ({x: "proportion"}, {fill: "species"})
```

Groups on the first channel of **z**, **fill**, or **stroke**, if any. If none of **z**, **fill**, or **stroke** are channels, then all data (within each facet) is placed into a single group.
