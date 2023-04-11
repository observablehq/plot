# Bin

The bin transform groups quantitative data—continuous measurements such as heights, weights, or temperatures—into discrete bins. You can then compute summary statistics for each bin, such as a count, sum, or proportion. The bin transform is like a [group transform](./group.md) for quantitative data, and is most often used to make histograms or heatmaps.

The **binX** transform bins data on *x*. This can be used to produce a *y* channel of counts, along with *x1* and *x2* channels representing the bin thresholds, suitable for the [rectY mark](../marks/rect.md) as shown below. (A similar **binY** transform bins on *y*, producing *y1*, *y2*, and typically *x*.) Because the bin transform operates on quantitative data, a rect is used instead of a [bar](../marks/bar.md).

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.rectY(athletes, Plot.binX({y: "count"}, {x: "weight"})),
    Plot.ruleY([0])
  ]
})
```

The bin transform sets default insets for a one-pixel gap between rects. You can set explicit insets if you prefer, say if you want the rects to touch. In this case we recommend rounding on the _x_ scale to avoid antialiasing artifacts between rects.

```js
Plot.plot({
  x: {
    round: true
  },
  y: {
    grid: true
  },
  marks: [
    Plot.rectY(athletes, Plot.binX({y: "count"}, {x: "weight", inset: 0})),
    Plot.ruleY([0])
  ]
})
```

While the rect mark is the most common pairing with the bin transform, you can use other marks, such as an [area](../marks/area.md) and [line](../marks/line.md). With a continuous mark, you should set the bin transform’s _filter_ option to null so that empty bins are included in the output; otherwise, the area or line would mislead by interpolating over missing bins.

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.areaY(athletes, Plot.binX({y: "count", filter: null}, {x: "weight", fill: "#ccc"})),
    Plot.lineY(athletes, Plot.binX({y: "count", filter: null}, {x: "weight"})),
    Plot.ruleY([0])
  ]
})
```

The bin transform uses [Scott’s normal reference rule](https://en.wikipedia.org/wiki/Histogram#Scott's_normal_reference_rule) (capped to a maximum of 200) to determine the default desired number of bins and [d3.ticks](https://github.com/d3/d3-array/blob/master/README.md#ticks) to generate thresholds at nice round values. The following methods of specifying thresholds are supported:

* *freedman-diaconis* - the Freedman–Diaconis rule
* *scott* - Scott’s normal reference rule
* *sturges* - Sturges’ formula
* a number representing the desired number of bins
* an array of *n* sorted thresholds for *n* + 1 bins
* a [time interval](http://github.com/d3/d3-time/blob/master/README.md#intervals) (for temporal binning)
* a function to return the desired thresholds given an array of values

Sturges is the default for many statistical software packages, but it [may be a dubious choice](https://robjhyndman.com/papers/sturges.pdf). See d3-array’s [*bin*.thresholds](https://github.com/d3/d3-array/blob/master/README.md#bin_thresholds) for more.

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.rectY(athletes, Plot.binX({y: "count"}, {x: "weight", thresholds: "sturges"})),
    Plot.ruleY([0])
  ]
})
```

The *cumulative* option produces a cumulative distribution: below, each bin represents the number of athletes with the given weight *or less*. (For the reverse cumulative distribution where each bin represents the number of athletes with the given weight *or more*, set *cumulative* to −1.)

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.rectY(athletes, Plot.binX({y: "count"}, {x: "weight", cumulative: true})),
    Plot.ruleY([0])
  ]
})
```

While binX and binY bin on *x* and *y*, respectively, you can further partition (subdivide) bins by an additional *z* dimension. If the *z* dimension is undefined, it defaults to either the *fill* or *stroke* dimension. This can be used in conjunction with the rect mark’s implicit [stack transform](./stack.md) to produce a stacked histogram, which is useful to compare distributions across an ordinal dimension.

```js
Plot.plot({
  y: {
    grid: true
  },
  color: {
    legend: true
  },
  marks: [
    Plot.rectY(athletes, Plot.binX({y: "count"}, {x: "weight", fill: "sex"})),
    Plot.ruleY([0])
  ]
})
```

If desired, you can invoke the stack transform explicitly.

```js
Plot.plot({
  y: {
    grid: true
  },
  color: {
    legend: true
  },
  marks: [
    Plot.rectY(athletes, Plot.stackY(Plot.binX({y: "count"}, {x: "weight", fill: "sex"}))),
    Plot.ruleY([0])
  ]
})
```

You can opt-out of the implicit stack transform by having the bin transform generate a _y1_ or _y2_ channel instead of a _y_ channel (and similarly *x1* or *x2* for binY). When generating overlapping marks, you should use either opacity or blending so that the occlusion is apparent.

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.rectY(athletes, Plot.binX({y2: "count"}, {x: "weight", fill: "sex", mixBlendMode: "multiply"})),
    Plot.ruleY([0])
  ]
})
```

While the binX transform is often used to generate a count (or proportion) on *y*, we use it to generate any output channel. Below, the *fill* channel represents count per bin, resulting in a one-dimensional heatmap.

```js
Plot.plot({
  x: {
    round: true
  },
  color: {
    scheme: "YlGnBu"
  },
  marks: [
    Plot.barX(athletes, Plot.binX({fill: "count"}, {x: "weight"}))
  ]
})
```

And heatmaps in two dimensions can be constructed with the **bin** transform. Here the *thresholds* option applies to both dimensions, but you can specify separate thresholds for *x* and *y* if desired as an object of the form {*value*, *thresholds*}.

```js
Plot.plot({
  grid: true,
  round: true,
  color: {
    scheme: "YlGnBu"
  },
  marks: [
    Plot.rect(athletes, Plot.bin({fill: "count"}, {x: "weight", y: "height", inset: 0}))
  ]
})
```

Alternatively, we can use the *fillOpacity* channel. This is useful in conjunction with the *fill* channel to show overlapping distributions.

```js
Plot.plot({
  grid: true,
  round: true,
  marks: [
    Plot.rect(athletes, Plot.bin({fillOpacity: "count"}, {x: "weight", y: "height", fill: "sex", inset: 0}))
  ]
})
```

The bin transform also generates *x* and *y* output channels; these can be used to place a dot at the center of each bin, here scaled so that the dot’s area is proportional to the number of observations in the associated bin.

```js
Plot.plot({
  grid: true,
  round: true,
  r: {
    range: [0, 10]
  },
  color: {
    scheme: "YlGnBu"
  },
  marks: [
    Plot.dot(athletes, Plot.bin({r: "count"}, {x: "weight", y: "height"}))
  ]
})
```

We can add the *stroke* channel to show overlapping distributions by sex.

```js
Plot.plot({
  grid: true,
  round: true,
  r: {
    range: [0, 10]
  },
  marks: [
    Plot.dot(athletes, Plot.bin({r: "count"}, {x: "weight", y: "height", stroke: "sex"}))
  ]
})
```

Similarly the binX and binY transforms generate respective *x* and *y* channels for one-dimensional binning.

```js
Plot.plot({
  r: {
    range: [0, 14]
  },
  marks: [
    Plot.dot(athletes, Plot.binX({r: "count"}, {x: "weight"}))
  ]
})
```

Each binned output channel (the keys of the object passed as the first argument to the bin transform) has an associated reducer which controls how the summary value for each group is derived. The examples above use *count*, but a variety of built-in reducers are provided:

* *count* - the number of observations in each group
* *sum* - the sum of values
* *proportion* - like *sum*, but divided by the total
* *proportion-facet* - like *sum*, but divided by the facet’s total
* *min* - the minimum value
* *max* - the maximum value
* *mean*  - the mean (average) value
* *median* - the median value
* *variance* - an unbiased estimator of [population variance](https://github.com/d3/d3-array/blob/master/README.md#variance)
* *deviation* - the [standard deviation](https://github.com/d3/d3-array/blob/master/README.md#deviation)
* *first* - the first value (in input order)
* *last* - the last value (in input order)

You can also implement a custom reducer: this function is repeatedly passed the array of data for each group and should return the corresponding summary value.

The *proportion-facet* reducer is used with faceting. Below, we compare the weight distributions for each sport with small multiple one-dimensional heatmaps. Sports are sorted by their median weight: gymnasts tend to be the lightest, and basketball players the heaviest. The weight limits in weightlifting and ([lightweight](https://en.wikipedia.org/wiki/Lightweight_rowing)) rowing are also visible.

```js
Plot.plot({
  marginLeft: 100,
  padding: 0,
  x: {
    round: true,
    grid: true
  },
  fy: {
    label: null,
    domain: d3.groupSort(athletes, g => d3.median(g, d => d.weight), d => d.sport)
  },
  color: {
    scheme: "YlGnBu"
  },
  facet: {
    data: athletes,
    marginLeft: 100,
    y: "sport"
  },
  marks: [
    Plot.barX(athletes, Plot.binX({fill: "proportion-facet"}, {x: "weight", inset: 0.5}))
  ]
})
```
