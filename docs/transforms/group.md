# Group transform

:::danger TODO
This guide is still under construction. 🚧 Please come back when it’s finished.
:::

:::tip
The group transform is for aggregating ordinal or nominal data. For quantitative or temporal data, use the [bin transform](./bin.md).
:::

The **group transform** groups ordinal data—discrete values such as name, type, species, or category. You can then compute summary statistics for each group, such as a count, sum, or proportion. The group transform is most often used to make bar charts.

The **groupX** transform groups data by *x*. This can be used to produce a *y* channel of counts suitable for the [barY mark](../marks/bar.md), as shown below. (A similar **groupY** transforms groups on *y*.)

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.barY(penguins, Plot.groupX({y: "count"}, {x: "species"})),
    Plot.ruleY([0])
  ]
})
```

To sort the groups in descending order of frequency, set the *sort* option to {x: "y"}, indicating that you want the *x* domain to be sorted by the *y* values. Include *reverse*: true for descending order. The default is natural (alphabetical) order.

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.barY(penguins, Plot.groupX({y: "count"}, {x: "species", sort: {x: "y", reverse: true}})),
    Plot.ruleY([0])
  ]
})
```

<!-- The group transform should generally not be used if the primary dimension (*e.g.*, *x* for groupX) is temporal or quantitative (continuous) rather than ordinal or categorical (discrete). If this is the case, you should use the [bin transform](./bin.md), say with a [rect mark](../marks/rect.md) instead of a bar mark. -->

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

Here are more examples. Below the *proportion* reducer computes the proportion of observations for each species: a number between 0 and 1 rather than absolute counts. The *percent* scale option multiplies these proportions by 100 and adds a percent sign to the axis label.

```js
Plot.plot({
  y: {
    grid: true,
    percent: true
  },
  marks: [
    Plot.barY(penguins, Plot.groupX({y: "proportion"}, {x: "species"})),
    Plot.ruleY([0])
  ]
})
```

The *sum* reducer adds the values for the corresponding channel for each group. Below, each bar represents the total body mass of each species. (Gentoos tend to be heavier than Adelies and Chinstraps, hence the total mass of Gentoos is largest even though there are more Adelies.)

```js
Plot.plot({
  y: {
    label: "↑ Total mass (kg)",
    grid: true,
    transform: d => d / 1000
  },
  marks: [
    Plot.barY(penguins, Plot.groupX({y: "sum"}, {x: "species", y: "body_mass_g"})),
    Plot.ruleY([0])
  ]
})
```

Below, a [rule](../marks/rule.md) shows the observed minimum and maximum body mass for each species, while a red [tick](../marks/tick.md) shows the median. (See the related [boxplot example](../marks/box.md).)

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

If the *x* channel is not specified for the groupX transform, and similarly the *y* channel for the groupY transform, it defaults to the identity function. So, passing an array of characters from *Moby Dick* to the groupX transform will compute the frequency of each character.

```js
mobydick = [...await FileAttachment("moby-dick-chapter-1.txt").text()]
  .filter(c => /\w/i.test(c))
  .map(c => c.toUpperCase())
```

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.barY(mobydick, Plot.groupX({y: "count"})),
    Plot.ruleY([0])
  ]
})
```

The group transform can be composed with other transforms, such as the [filter transform](../features/transforms.md), say to compute the frequency only of vowels. When the *proportion* reducer is used, the basis is still the entire (unfiltered) dataset.

```js
Plot.plot({
  y: {
    grid: true,
    percent: true
  },
  marks: [
    Plot.barY(mobydick, Plot.groupX({y: "proportion"}, {filter: d => /[AEIOUY]/.test(d)})),
    Plot.ruleY([0])
  ]
})
```

Grouping can be combined with [faceting](../features/facets.md) to create small multiples where the data is subdivided into facets before being grouped.

```js
Plot.plot({
  x: {
    tickFormat: d => d === null ? "N/A" : d
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
    tickFormat: d => d === null ? "N/A" : d
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
      x: d => d.date.getUTCDate(),
      y: d => d.date.getUTCMonth(),
      fill: "temp_max",
      inset: 0.5
    }))
  ]
})
```

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
