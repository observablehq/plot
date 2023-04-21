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

:::danger TODO
This guide is still under construction. 🚧 Please come back when it’s finished.
:::

:::tip
The group transform is for aggregating ordinal or nominal data. For quantitative or temporal data, use the [bin transform](./bin.md).
:::

The **group transform** groups ordinal or nominal data—discrete values such as name, type, or category. You can then compute summary statistics for each group, such as a count, sum, or proportion. The group transform is most often used to make bar charts with the [bar mark](../marks/bar.md).

For example, the bar chart below shows a distribution of Olympic athletes by sport.

:::plot defer
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

While the groupX transform is often used to generate **y**, it can output any channel. Below, the **fill** channel represents count per group, resulting in a one-dimensional heatmap.

:::plot
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

Or, we could use this form to show which sex is more prevalent in each sport: <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[1]}`}">men</span> are represented more often than <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[0]}`}">women</span> in every sport except gymnastics and fencing.

:::plot defer
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

:::plot defer
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

:::plot defer
```js
Plot.plot({
  style: "isolation: isolate;", // for mix-blend-mode
  marginBottom: 100,
  x: {label: null, tickRotate: 90},
  y: {grid: true},
  color: {legend: true},
  marks: [
    Plot.barY(olympians, Plot.groupX({y2: "count"}, {x: "sport", fill: "sex", mixBlendMode: "difference"})),
    Plot.ruleY([0])
  ]
})
```
:::

:::warning CAUTION
While the **mixBlendMode** option is useful for mitigating occlusion, it can be slow to render if there are many elements. More than two overlapping histograms may also be hard to read.
:::

Perhaps better would be to make a grouped bar chart using faceting?

:::plot defer
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

:::plot defer
```js
Plot.plot({
  marginBottom: 100,
  x: {label: null, tickRotate: 90},
  y: {grid: true, label: "↑ Frequency"},
  marks: [
    Plot.ruleY([0]),
    Plot.link(
      olympians,
      Plot.groupX(
        {y1: "sum", y2: "sum", stroke: "mode"},
        {
          x: "sport",
          y1: (d) => d.sex === "female",
          y2: (d) => d.sex === "male",
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

:::plot defer
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

You can produce a two-dimensional heatmap with group transform and a cell mark by generating a **fill** output channel. Below, color encodes the number of athletes of a given sport and number of gold medals.

:::plot defer
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

:::plot defer
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

:::plot defer
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



---

The *sum* reducer adds the values for the corresponding channel for each group. Below, each bar represents the total body mass of each species. (Gentoos tend to be heavier than Adelies and Chinstraps, hence the total mass of Gentoos is largest even though there are more Adelies.)

:::plot
```js
Plot.plot({
  y: {
    label: "↑ Total mass (kg)",
    grid: true,
    transform: (d) => d / 1000
  },
  marks: [
    Plot.barY(penguins, Plot.groupX({y: "sum"}, {x: "species", y: "body_mass_g"})),
    Plot.ruleY([0])
  ]
})
```
:::

Below, a [rule](../marks/rule.md) shows the observed minimum and maximum body mass for each species, while a red [tick](../marks/tick.md) shows the median. (See the related [boxplot example](../marks/box.md).)

:::plot
```js
Plot.plot({
  marginLeft: 60,
  x: {
    inset: 6
  },
  y: {
    label: null
  },
  marks: [
    Plot.dot(penguins, {y: "species", x: "body_mass_g"}),
    Plot.ruleY(penguins, Plot.groupY({x1: "min", x2: "max"}, {y: "species", x: "body_mass_g"})),
    Plot.tickX(penguins, Plot.groupY({x: "median"}, {y: "species", x: "body_mass_g", stroke: "red"}))
  ]
})
```
:::

<!-- [I think we can omit this, or link to the shorthand guide.] If the *x* channel is not specified for the groupX transform, and similarly the *y* channel for the groupY transform, it defaults to the identity function. So, passing an array of characters from *Moby Dick* to the groupX transform will compute the frequency of each character. -->

The group transform can be composed with other transforms, such as the [filter transform](../features/transforms.md), say to compute the frequency only of vowels. When the *proportion* reducer is used, the basis is still the entire (unfiltered) dataset.

```js
Plot.plot({
  y: {
    grid: true,
    percent: true
  },
  marks: [
    Plot.barY(mobydick, Plot.groupX({y: "proportion"}, {filter: (d) => /[AEIOUY]/.test(d)})),
    Plot.ruleY([0])
  ]
})
```

Grouping can be combined with [faceting](../features/facets.md) to create small multiples where the data is subdivided into facets before being grouped.

```js
Plot.plot({
  x: {
    tickFormat: (d) => d === null ? "N/A" : d
  },
  y: {
    grid: true
  },
  facet: {
    data: penguins,
    x: "species"
  },
  marks: [
    Plot.barY(penguins, Plot.groupX({y: "count"}, {x: "sex"})),
    Plot.ruleY([0])
  ]
})
```

The *proportion-facet* reducer behaves similarly to *proportion*, except that it computes the frequency relative to the facet rather than to the entire dataset. We use it to show percentages within each species below.

```js
Plot.plot({
  x: {
    tickFormat: (d) => d === null ? "N/A" : d
  },
  y: {
    grid: true,
    percent: true
  },
  facet: {
    data: penguins,
    x: "species"
  },
  marks: [
    Plot.barY(penguins, Plot.groupX({y: "proportion-facet"}, {x: "sex"})),
    Plot.ruleY([0])
  ]
})
```

While groupX and groupY group on *x* and *y*, respectively, you can further partition (subdivide) groups by an additional *z* dimension, say for stacked bars. If the *z* dimension is undefined, it defaults to either the *fill* or *stroke* dimension. Below we group by *x* = species and *z* = *fill* = sex, and then implicitly stack *y*.

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.barY(penguins, Plot.groupX({y: "count"}, {x: "species", fill: "sex"})),
    Plot.ruleY([0])
  ]
})
```

To group solely on *z* (or *fill* or *stroke*), use the **groupZ** transform instead of groupX or groupY. This example also uses the *first* reducer to label the bars by pulling out the first value for each group.

```js
Plot.plot({
  x: {
    percent: true
  },
  marks: [
    Plot.barX(penguins, Plot.stackX(Plot.groupZ({x: "proportion"}, {fill: "sex"}))),
    Plot.text(penguins, Plot.stackX(Plot.groupZ({x: "proportion", text: "first"}, {z: "sex", text: "sex"}))),
    Plot.ruleX([0, 1])
  ]
})
```

As an alternative to groupX, we can stack bars using groupZ while faceting. This lets us use *proportion-facet* to compute percentages within each facet.

```js
Plot.plot({
  y: {
    grid: true,
    percent: true
  },
  facet: {
    data: penguins,
    x: "species"
  },
  marks: [
    Plot.barY(penguins, Plot.groupZ({y: "proportion-facet"}, {fill: "sex"})),
    Plot.ruleY([0, 1])
  ]
})
```

Lastly, the **group** transform groups on both *x* and *y*. This is typically used in conjunction with a [cell](../marks/cell.md) or [dot](../marks/dot.md) to produce a discrete heatmap. Below, we plot the maximum observed temperature in Seattle between 2012 and 2015 where *y* = month and *x* = day of the month.

```js
Plot.plot({
  padding: 0,
  y: {
    tickFormat: Plot.formatMonth()
  },
  color: {
    scheme: "BuRd"
  },
  marks: [
    Plot.cell(seattle, Plot.group({fill: "max"}, {
      x: (d) => d.date.getUTCDate(),
      y: (d) => d.date.getUTCMonth(),
      fill: "temp_max",
      inset: 0.5
    }))
  ]
})
```

A similar **groupY** transforms groups on *y*.

Each grouped output channel (the keys of the object passed as the first argument to the group transform) has an associated reducer which controls how the summary value for each group is derived. The examples above use *count*, but a variety of built-in reducers are provided:

* *count* - the number of observations in each group
* *sum* - the sum of values
* *proportion* - like *sum*, but divided by the total
* *proportion-facet* - like *sum*, but divided by the facet’s total
* *min* - the minimum value
* *max* - the maximum value
* *mean*  - the mean (average) value
* *median* - the median value
* *mode* - the value with the most occurrences
* *variance* - an unbiased estimator of [population variance](https://github.com/d3/d3-array/blob/master/README.md#variance)
* *deviation* - the [standard deviation](https://github.com/d3/d3-array/blob/master/README.md#deviation)
* *first* - the first value (in input order)
* *last* - the last value (in input order)

You can also implement a custom reducer: this function is repeatedly passed the array of data for each group and should return the corresponding summary value.

## Group options

Aggregates ordinal or categorical data—such as names—into groups and then computes summary statistics for each group such as a count or sum. The group transform is like a discrete [bin transform](#bin). There are separate transforms depending on which dimensions need grouping: [Plot.groupZ](#plotgroupzoutputs-options) for *z*; [Plot.groupX](#plotgroupxoutputs-options) for *x* and *z*; [Plot.groupY](#plotgroupyoutputs-options) for *y* and *z*; and [Plot.group](#plotgroupoutputs-options) for *x*, *y*, and *z*.

Given input *data* = [*d₀*, *d₁*, *d₂*, …], by default the resulting grouped data is an array of arrays where each inner array is a subset of the input data [[*d₀₀*, *d₀₁*, …], [*d₁₀*, *d₁₁*, …], [*d₂₀*, *d₂₁*, …], …]. Each inner array is in input order. The outer array is in natural ascending order according to the associated dimension (*x* then *y*). Empty groups are skipped. By specifying a different aggregation method for the *data* output, as described below, you can change how the grouped data is computed. The outputs may also include *filter* and *sort* options specified as aggregation methods, and a *reverse* option to reverse the order of generated groups. By default, all (non-empty) groups are generated in ascending natural order.

While it is possible to compute channel values on the grouped data by defining channel values as a function, more commonly channel values are computed directly by the group transform, either implicitly or explicitly. In addition to data, the following channels are automatically aggregated:

* **x** - the horizontal position of the group
* **y** - the vertical position of the group
* **z** - the first value of the *z* channel, if any
* **fill** - the first value of the *fill* channel, if any
* **stroke** - the first value of the *stroke* channel, if any

The **x** output channel is only computed by the Plot.groupX and Plot.group transform; similarly the **y** output channel is only computed by the Plot.groupY and Plot.group transform.

You can declare additional channels to aggregate by specifying the channel name and desired aggregation method in the *outputs* object which is the first argument to the transform. For example, to use [Plot.groupX](#plotgroupxoutputs-options) to generate a **y** channel of group counts as in a frequency histogram:

```js
Plot.groupX({y: "count"}, {x: "species"})
```

The following aggregation methods are supported:

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
* a function - passed the array of values for each group
* an object with a *reduceIndex* method, an optionally a *scope*

In the last case, the *reduceIndex* method is repeatedly passed two arguments: the index for each group (an array of integers), and the input channel’s array of values; it must then return the corresponding aggregate value for the group. If the reducer object’s *scope* is “data”, then the *reduceIndex* method is first invoked for the full data; the return value of the *reduceIndex* method is then made available as a third argument. Similarly if the *scope* is “facet”, then the *reduceIndex* method is invoked for each facet, and the resulting reduce value is made available while reducing the facet’s groups. (This optional *scope* is used by the *proportion* and *proportion-facet* reducers.)

Most aggregation methods require binding the output channel to an input channel; for example, if you want the **y** output channel to be a *sum* (not merely a count), there should be a corresponding **y** input channel specifying which values to sum. If there is not, *sum* will be equivalent to *count*.

```js
Plot.groupX({y: "sum"}, {x: "species", y: "body_mass_g"})
```

You can control whether a channel is computed before or after grouping. If a channel is declared only in *options* (and it is not a special group-eligible channel such as *x*, *y*, *z*, *fill*, or *stroke*), it will be computed after grouping and be passed the grouped data: each datum is the array of input data corresponding to the current group.

```js
Plot.groupX({y: "count"}, {x: "species", title: group => group.map(d => d.body_mass_g).join("\n")})
```

This is equivalent to declaring the channel only in *outputs*.

```js
Plot.groupX({y: "count", title: group => group.map(d => d.body_mass_g).join("\n")}, {x: "species"})
```

However, if a channel is declared in both *outputs* and *options*, then the channel in *options* is computed before grouping and can be aggregated using any built-in reducer (or a custom reducer function) during the group transform.

```js
Plot.groupX({y: "count", title: masses => masses.join("\n")}, {x: "species", title: "body_mass_g"})
```

If any of **z**, **fill**, or **stroke** is a channel, the first of these channels is considered the *z* dimension and will be used to subdivide groups.

The default reducer for the **title** channel returns a summary list of the top 5 values with the corresponding number of occurrences.

## group(*outputs*, *options*)

```js
Plot.group({fill: "count"}, {x: "island", y: "species"})
```

Groups on *x*, *y*, and the first channel of *z*, *fill*, or *stroke*, if any.

## groupX(*outputs*, *options*)

```js
Plot.groupX({y: "sum"}, {x: "species", y: "body_mass_g"})
```

Groups on *x* and the first channel of *z*, *fill*, or *stroke*, if any.

## groupY(*outputs*, *options*)

```js
Plot.groupY({x: "sum"}, {y: "species", x: "body_mass_g"})
```

Groups on *y* and the first channel of *z*, *fill*, or *stroke*, if any.

## groupZ(*outputs*, *options*)

```js
Plot.groupZ({x: "proportion"}, {fill: "species"})
```

Groups on the first channel of *z*, *fill*, or *stroke*, if any. If none of *z*, *fill*, or *stroke* are channels, then all data (within each facet) is placed into a single group.
