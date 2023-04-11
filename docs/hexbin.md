# Hexbin

The **hexbin** transform aggregates two-dimensional points (in *x* and *y*) into discrete hexagonal bins. Like the [bin transform](/@observablehq/plot-bin), you can then compute summary statistics for each bin, such as a count, sum, or proportion. The hexbin transform is most often used to make heatmaps; it is an alternative to dense scatterplots that may suffer from occlusion.

The hexbin transform produces *x* and *y* channels representing the centers of the hexagonal bins. The hexbin transform operates in “screen space” (_i.e._, in pixel coordinates) after the *x* and *y* scales have been applied to the input data. Only hexagons with at least one constituent point are generated.

The hexbin transform is typically paired with the hexagon mark, which is simply the dot mark with the **symbol** option set to _hexagon_.

```js
Plot.plot({
  color: {
    scheme: "ylgnbu"
  },
  marks: [
    Plot.hexagon(
      cars,
      Plot.hexbin(
        { fill: "count" },
        { x: "displacement (cc)", y: "economy (mpg)" }
      )
    )
  ]
})
```

Above, the _fill_ output channel encodes the number (*count*) of points in each hexagonal bin as a sequential color. The _r_ output channel can be used instead for an areal encoding. When an _r_ output channel is used, the default range of the _r_ scale is set such that the hexagons cannot overlap.

```js
Plot.plot({
  marks: [
    Plot.hexagon(
      cars,
      Plot.hexbin(
        { r: "count" },
        { x: "displacement (cc)", y: "economy (mpg)" }
      )
    )
  ]
})
```

A redundant encoding can be generated with both _fill_ and _r_.

```js
Plot.plot({
  color: {
    scheme: "ylgnbu"
  },
  marks: [
    Plot.hexagon(
      cars,
      Plot.hexbin(
        { r: "count", fill: "count" },
        {
          x: "displacement (cc)",
          y: "economy (mpg)",
          stroke: "black",
          strokeWidth: 1
        }
      )
    )
  ]
})
```

Alternatively, the _fill_ and _r_ channels can encode independent (or “bivariate”) dimensions of data. Below, the _r_ channel encodes density (the number of cars in each hexagonal bin), while the _fill_ channel encodes the average weight of cars in each bin. As you might expect, weight is positively correlated with engine displacement and inversely correlated with fuel economy.

```js
Plot.plot({
  color: {
    legend: true
  },
  marks: [
    Plot.hexagon(
      cars,
      Plot.hexbin(
        {r: "count", fill: "mean"},
        {x:  "displacement (cc)", y: "economy (mpg)", fill: "weight (lb)"}
      )
    )
  ]
})
```

Each binned output channel (the keys of the object passed as the first argument to the hexbin transform) has an associated reducer which controls how the summary value for each group is derived. A variety of built-in reducers are provided:

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

Given a *z* input channel, the hexbin transform can generate coincident hexagons for separate series. If the *z* channel is not specified, it defaults to the *fill* input channel (if there is no *fill* output channel), or the *stroke* input channel (if there is no *stroke* output channel). Below, cars are categorized by number of cylinders. A few hexagons are coincident, representing cars with similar fuel economy and displacement but a different number of cylinders.

```js
Plot.plot({
  color: {
    type: "ordinal",
    scheme: "spectral",
    legend: true
  },
  marks: [
    Plot.hexagon(
      cars,
      Plot.hexbin(
        { r: "count" },
        { x: "displacement (cc)", y: "economy (mpg)", stroke: "cylinders" }
      )
    )
  ]
})
```

If you pair the hexbin transform with Plot.dot instead of Plot.hexagon, you can set the **symbol** option to something other than _hexagon_.

<!-- viewof symbol = Inputs.select(["circle", "hexagon", "square", "wye", "cross"], {label: "Symbol"}) -->

```js
Plot.plot({
  marks: [
    Plot.dot(
      cars,
      Plot.hexbin(
        { r: "count" },
        { x: "displacement (cc)", y: "economy (mpg)", symbol }
      )
    )
  ]
})
```

The **binWidth** option specifies the width of the pointy-topped hexagonal bins in pixels—defaults to 20. If an _r_ output channel is not generated, the hexbin transform will product a default **r** option of half the bin width such that hexagons (or circles) are contiguous.

<!-- viewof binWidth = Inputs.range([1, 40], {label: "Bin width", step: 1, value: 10}) -->

```js
Plot.plot({
  marks: [
    Plot.dot(
      cars,
      Plot.hexbin(
        { r: "count" },
        { x: "displacement (cc)", y: "economy (mpg)", binWidth }
      )
    )
  ]
})
```

The hexbin layout can be paired with any mark that supports _x_ and _y_ channels. The Plot.text mark is useful for labelling.

```js
Plot.plot({
  inset: 10,
  color: { scheme: "ylgnbu" },
  marks: [
    Plot.hexagon(
      cars,
      Plot.hexbin(
        { fill: "count" },
        { x: "displacement (cc)", y: "economy (mpg)" }
      )
    ),
    Plot.text(
      cars,
      Plot.hexbin(
        { text: "count" },
        {
          x: "displacement (cc)",
          y: "economy (mpg)",
          fill: "black",
          stroke: "white"
        }
      )
    )
  ]
})
```

The Plot.hexgrid decoration mark is the similar to the axis **grid** option: it draws the base hexagonal grid as a mesh. Use the common options (_e.g._, **stroke**) to style it. For consistency, pass the same **binWidth** option to all the marks.

```js
Plot.plot({
  color: { scheme: "ylgnbu" },
  marks: [
    Plot.dot(
      cars,
      Plot.hexbin(
        { fill: "count" },
        { x: "displacement (cc)", y: "economy (mpg)" }
      )
    ),
    Plot.hexgrid()
  ]
})
```

Hexbins work best when there is an interesting density of dots in the center of the chart, but sometimes hexagons near the extrema of the _x_ and _y_ domains will appear to “bleed” and cover the axes. To mitigate this, you can use the **inset** option to recenter the data or set the **clip** option to true.

```js
Plot.plot({
  inset: 10,
  color: { scheme: "ylgnbu" },
  marks: [
    Plot.dot(
      cars,
      Plot.hexbin(
        { fill: "count" },
        {
          x: "displacement (cc)",
          y: "economy (mpg)",
          stroke: "lightgray",
          strokeWidth: 1
        }
      )
    )
  ]
})
```

```js
Plot.plot({
  color: { scheme: "ylgnbu" },
  marks: [
    Plot.dot(
      cars,
      Plot.hexbin(
        { fill: "count" },
        { x: "displacement (cc)", y: "economy (mpg)", clip: true }
      )
    ),
    Plot.hexgrid()
  ]
})
```

Since Plot version 0.6.3, you can also draw the axes on top of hexagons.

```js
Plot.plot({
  color: { scheme: "ylgnbu" },
  marks: [
    Plot.dot(
      cars,
      Plot.hexbin(
        { fill: "count" },
        {
          x: "displacement (cc)",
          y: "economy (mpg)",
          stroke: "lightgray",
          strokeWidth: 1
        }
      )
    ),
    Plot.axisY()
  ]
})
```
