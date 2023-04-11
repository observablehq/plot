# Group

You often want to aggregate data before visualizing; for example, given a set of penguin observations you may wish to count the number of each species seen. Plot’s group transforms let you derive summary values for each group, such as a count, sum, or proportion. The group transform is like a [bin transform](/@observablehq/plot-bin?collection=@observablehq/plot) for ordinal or categorical data, and is most often used to make bar charts.

The **groupX** transform groups data by *x*. This can be used to produce a *y* channel of counts suitable for the [barY mark](/@observablehq/plot-bar?collection=@observablehq/plot), as shown below. (A similar **groupY** transforms groups on *y*.)

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

The group transform should generally not be used if the primary dimension (*e.g.*, *x* for groupX) is temporal or quantitative (continuous) rather than ordinal or categorical (discrete). If this is the case, you should use the [bin transform](/@observablehq/plot-bin?collection=@observablehq/plot), say with a [rect mark](/@observablehq/plot-rect?collection=@observablehq/plot) instead of a bar mark.

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

Below, a [rule](/@observablehq/plot-rule?collection=@observablehq/plot) shows the observed minimum and maximum body mass for each species, while a red [tick](/@observablehq/plot-tick?collection=@observablehq/plot) shows the median. (See the related [boxplot example](/@observablehq/plot-box).)

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

The group transform can be composed with other transforms, such as the [filter transform](/@observablehq/plot-transforms?collection=@observablehq/plot), say to compute the frequency only of vowels. When the *proportion* reducer is used, the basis is still the entire (unfiltered) dataset.

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

Grouping can be combined with [faceting](/@observablehq/plot-facets?collection=@observablehq/plot) to create small multiples where the data is subdivided into facets before being grouped.

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

Lastly, the **group** transform groups on both *x* and *y*. This is typically used in conjunction with a [cell](/@observablehq/plot-cell?collection=@observablehq/plot) or [dot](/@observablehq/plot-dot?collection=@observablehq/plot) to produce a discrete heatmap. Below, we plot the maximum observed temperature in Seattle between 2012 and 2015 where *y* = month and *x* = day of the month.

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
