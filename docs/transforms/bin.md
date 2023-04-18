# Bin transform

:::tip
The bin transform is for aggregating quantitative or temporal data. For ordinal or nominal data, use the [group transform](./group.md).
:::

The **bin transform** groups quantitative data—continuous measurements such as heights, weights, or temperatures—into discrete bins. You can then compute summary statistics for each bin, such as a count, sum, or proportion. The bin transform is most often used to make histograms or heatmaps.

The **binX** transform bins data on *x*. This can be used to produce a *y* channel of counts, along with *x1* and *x2* channels representing the bin thresholds, suitable for the [rectY mark](../marks/rect.md) as shown below. (A similar **binY** transform bins on *y*, producing *y1*, *y2*, and typically *x*.) Because the bin transform operates on quantitative data, a rect is used instead of a [bar](../marks/bar.md).

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight"})),
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
    Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", inset: 0})),
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
    Plot.areaY(olympians, Plot.binX({y: "count", filter: null}, {x: "weight", fill: "#ccc"})),
    Plot.lineY(olympians, Plot.binX({y: "count", filter: null}, {x: "weight"})),
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
    Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", thresholds: "sturges"})),
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
    Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", cumulative: true})),
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
    Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", fill: "sex"})),
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
    Plot.rectY(olympians, Plot.stackY(Plot.binX({y: "count"}, {x: "weight", fill: "sex"}))),
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
    Plot.rectY(olympians, Plot.binX({y2: "count"}, {x: "weight", fill: "sex", mixBlendMode: "multiply"})),
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
    Plot.barX(olympians, Plot.binX({fill: "count"}, {x: "weight"}))
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
    Plot.rect(olympians, Plot.bin({fill: "count"}, {x: "weight", y: "height", inset: 0}))
  ]
})
```

Alternatively, we can use the *fillOpacity* channel. This is useful in conjunction with the *fill* channel to show overlapping distributions.

```js
Plot.plot({
  grid: true,
  round: true,
  marks: [
    Plot.rect(olympians, Plot.bin({fillOpacity: "count"}, {x: "weight", y: "height", fill: "sex", inset: 0}))
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
    Plot.dot(olympians, Plot.bin({r: "count"}, {x: "weight", y: "height"}))
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
    Plot.dot(olympians, Plot.bin({r: "count"}, {x: "weight", y: "height", stroke: "sex"}))
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
    Plot.dot(olympians, Plot.binX({r: "count"}, {x: "weight"}))
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
    domain: d3.groupSort(olympians, g => d3.median(g, d => d.weight), d => d.sport)
  },
  color: {
    scheme: "YlGnBu"
  },
  facet: {
    data: olympians,
    marginLeft: 100,
    y: "sport"
  },
  marks: [
    Plot.barX(olympians, Plot.binX({fill: "proportion-facet"}, {x: "weight", inset: 0.5}))
  ]
})
```

## Bin options

Aggregates continuous data—quantitative or temporal values such as temperatures or times—into discrete bins and then computes summary statistics for each bin such as a count or sum. The bin transform is like a continuous [group transform](#group) and is often used to make histograms. There are separate transforms depending on which dimensions need binning: [Plot.binX](#plotbinxoutputs-options) for *x*; [Plot.binY](#plotbinyoutputs-options) for *y*; and [Plot.bin](#plotbinoutputs-options) for both *x* and *y*.

Given input *data* = [*d₀*, *d₁*, *d₂*, …], by default the resulting binned data is an array of arrays where each inner array is a subset of the input data [[*d₀₀*, *d₀₁*, …], [*d₁₀*, *d₁₁*, …], [*d₂₀*, *d₂₁*, …], …]. Each inner array is in input order. The outer array is in ascending order according to the associated dimension (*x* then *y*). Empty bins are skipped. By specifying a different aggregation method for the *data* output, as described below, you can change how the binned data is computed. The outputs may also include *filter* and *sort* options specified as aggregation methods, and a *reverse* option to reverse the order of generated bins. By default, empty bins are omitted, and non-empty bins are generated in ascending threshold order.

While it is possible to compute channel values on the binned data by defining channel values as a function, more commonly channel values are computed directly by the bin transform, either implicitly or explicitly. In addition to data, the following channels are automatically aggregated:

* **x1** - the starting horizontal position of the bin
* **x2** - the ending horizontal position of the bin
* **x** - the horizontal center of the bin
* **y1** - the starting vertical position of the bin
* **y2** - the ending vertical position of the bin
* **y** - the vertical center of the bin
* **z** - the first value of the *z* channel, if any
* **fill** - the first value of the *fill* channel, if any
* **stroke** - the first value of the *stroke* channel, if any

The **x1**, **x2**, and **x** output channels are only computed by the Plot.binX and Plot.bin transform; similarly the **y1**, **y2**, and **y** output channels are only computed by the Plot.binY and Plot.bin transform. The **x** and **y** output channels are lazy: they are only computed if needed by a downstream mark or transform. Conversely, the *x1* and *x2* outputs default to undefined if *x* is explicitly defined; and the *y1* and *y2* outputs default to undefined if *y* is explicitly defined.

You can declare additional channels to aggregate by specifying the channel name and desired aggregation method in the *outputs* object which is the first argument to the transform. For example, to use [Plot.binX](#plotbinxoutputs-options) to generate a **y** channel of bin counts as in a frequency histogram:

```js
Plot.binX({y: "count"}, {x: "culmen_length_mm"})
```

The following aggregation methods are supported:

* *first* - the first value, in input order
* *last* - the last value, in input order
* *count* - the number of elements (frequency)
* *distinct* - the number of distinct values
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
* *x* - the middle of the bin’s *x* extent (when binning on *x*)
* *x1* - the lower bound of the bin’s *x* extent (when binning on *x*)
* *x2* - the upper bound of the bin’s *x* extent (when binning on *x*)
* *y* - the middle of the bin’s *y* extent (when binning on *y*)
* *y1* - the lower bound of the bin’s *y* extent (when binning on *y*)
* *y2* - the upper bound of the bin’s *y* extent (when binning on *y*)
* a function to be passed the array of values for each bin and the extent of the bin
* an object with a *reduceIndex* method, and optionally a *scope*

In the last case, the *reduceIndex* method is repeatedly passed three arguments: the index for each bin (an array of integers), the input channel’s array of values, and the extent of the bin (an object {x1, x2, y1, y2}); it must then return the corresponding aggregate value for the bin. If the reducer object’s *scope* is “data”, then the *reduceIndex* method is first invoked for the full data; the return value of the *reduceIndex* method is then made available as a third argument (making the extent the fourth argument). Similarly if the *scope* is “facet”, then the *reduceIndex* method is invoked for each facet, and the resulting reduce value is made available while reducing the facet’s bins. (This optional *scope* is used by the *proportion* and *proportion-facet* reducers.)

Most aggregation methods require binding the output channel to an input channel; for example, if you want the **y** output channel to be a *sum* (not merely a count), there should be a corresponding **y** input channel specifying which values to sum. If there is not, *sum* will be equivalent to *count*.

```js
Plot.binX({y: "sum"}, {x: "culmen_length_mm", y: "body_mass_g"})
```

You can control whether a channel is computed before or after binning. If a channel is declared only in *options* (and it is not a special group-eligible channel such as *x*, *y*, *z*, *fill*, or *stroke*), it will be computed after binning and be passed the binned data: each datum is the array of input data corresponding to the current bin.

```js
Plot.binX({y: "count"}, {x: "economy (mpg)", title: bin => bin.map(d => d.name).join("\n")})
```

This is equivalent to declaring the channel only in *outputs*.

```js
Plot.binX({y: "count", title: bin => bin.map(d => d.name).join("\n")}, {x: "economy (mpg)"})
```

However, if a channel is declared in both *outputs* and *options*, then the channel in *options* is computed before binning and can then be aggregated using any built-in reducer (or a custom reducer function) during the bin transform.

```js
Plot.binX({y: "count", title: names => names.join("\n")}, {x: "economy (mpg)", title: "name"})
```

To control how the quantitative dimensions *x* and *y* are divided into bins, the following options are supported:

* **thresholds** - the threshold values; see below
* **interval** - an alternative method of specifying thresholds
* **domain** - values outside the domain will be omitted
* **cumulative** - if positive, each bin will contain all lesser bins

These options may be specified either on the *options* or *outputs* object. If the **domain** option is not specified, it defaults to the minimum and maximum of the corresponding dimension (*x* or *y*), possibly niced to match the threshold interval to ensure that the first and last bin have the same width as other bins. If **cumulative** is negative (-1 by convention), each bin will contain all *greater* bins rather than all *lesser* bins, representing the [complementary cumulative distribution](https://en.wikipedia.org/wiki/Cumulative_distribution_function#Complementary_cumulative_distribution_function_.28tail_distribution.29).

To pass separate binning options for *x* and *y*, the **x** and **y** input channels can be specified as an object with the options above and a **value** option to specify the input channel values.

```js
Plot.binX({y: "count"}, {x: {thresholds: 20, value: "culmen_length_mm"}})
```

The **thresholds** option may be specified as a named method or a variety of other ways:

* *auto* (default) - Scott’s rule, capped at 200
* *freedman-diaconis* - the [Freedman–Diaconis rule](https://en.wikipedia.org/wiki/Freedman–Diaconis_rule)
* *scott* - [Scott’s normal reference rule](https://en.wikipedia.org/wiki/Histogram#Scott.27s_normal_reference_rule)
* *sturges* - [Sturges’ formula](https://en.wikipedia.org/wiki/Histogram#Sturges.27_formula)
* a count (hint) representing the desired number of bins
* an array of *n* threshold values for *n* - 1 bins
* an interval or time interval (for temporal binning; see below)
* a function that returns an array, count, or time interval

If the **thresholds** option is specified as a function, it is passed three arguments: the array of input values, the domain minimum, and the domain maximum. If a number, [d3.ticks](https://github.com/d3/d3-array/blob/main/README.md#ticks) or [d3.utcTicks](https://github.com/d3/d3-time/blob/main/README.md#ticks) is used to choose suitable nice thresholds. If an interval, it must expose an *interval*.floor(*value*), *interval*.ceil(*value*), *interval*.offset(*value*), and *interval*.range(*start*, *stop*) methods. If the interval is a time interval such as "day" (equivalently, d3.utcDay), or if the thresholds are specified as an array of dates, then the binned values are implicitly coerced to dates. Time intervals are intervals that are also functions that return a Date instance when called with no arguments.

If the **interval** option is used instead of **thresholds**, it may be either an interval, a time interval, or a number. If a number *n*, threshold values are consecutive multiples of *n* that span the domain; otherwise, the **interval** option is equivalent to the **thresholds** option. When the thresholds are specified as an interval, and the default **domain** is used, the domain will automatically be extended to start and end to align with the interval.

The bin transform supports grouping in addition to binning: you can subdivide bins by up to two additional ordinal or categorical dimensions (not including faceting). If any of **z**, **fill**, or **stroke** is a channel, the first of these channels will be used to subdivide bins. Similarly, Plot.binX will group on **y** if **y** is not an output channel, and Plot.binY will group on **x** if **x** is not an output channel. For example, for a stacked histogram:

```js
Plot.binX({y: "count"}, {x: "body_mass_g", fill: "species"})
```

Lastly, the bin transform changes the default [mark insets](#marks): rather than defaulting to zero, a pixel is reserved to separate adjacent bins. Plot.binX changes the defaults for **insetLeft** and **insetRight**; Plot.binY changes the defaults for **insetTop** and **insetBottom**; Plot.bin changes all four.

## bin(*outputs*, *options*)

```js
Plot.rect(olympians, Plot.bin({fillOpacity: "count"}, {x: "weight", y: "height"}))
```

Bins on *x* and *y*. Also groups on the first channel of *z*, *fill*, or *stroke*, if any.

## binX(*outputs*, *options*)

```js
Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight"}))
```

Bins on *x*. Also groups on *y* and the first channel of *z*, *fill*, or *stroke*, if any.

## binY(*outputs*, *options*)

```js
Plot.rectX(olympians, Plot.binY({x: "count"}, {y: "weight"}))
```

Bins on *y*. Also groups on *x* and first channel of *z*, *fill*, or *stroke*, if any.
