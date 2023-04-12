# Tick mark

Ticks are horizontal or vertical lines. A **tickY**↔︎ has a *y*-value, while a **tickX**↕︎ has an *x*-value. Ticks have an optional secondary position dimension (*x* for tickY and *y* for tickX); this second dimension is ordinal, unlike a [rule](./rule.md), requiring a [band scale](../scales.md). Ticks are often used to show one-dimensional distributions, as in the “barcode” plot below showing the proportion of population in each age bracket across U.S. states.

```js
Plot.plot({
  marginLeft: 50,
  grid: true,
  x: {
    axis: "top",
    label: "Percent (%) →",
    transform: d => d * 100
  },
  y: {
    domain: ages,
    label: "Age"
  },
  marks: [
    Plot.ruleX([0]),
    Plot.tickX(stateages, Plot.normalizeX({basis: "sum", z: "state", x: "population", y: "age"}))
  ]
})
```

As another example, a random normal distribution is plotted below with ticks. Reducing opacity allows better perception of density when ticks are coincident.

```js
Plot.plot({
  x: {
    domain: [-4, 4]
  },
  marks: [
    Plot.tickX({length: 500}, {x: d3.randomNormal(), strokeOpacity: 0.2}),
  ]
})
```

Ticks can also be used in a [box plot](./box.md) to mark the median value for each group (the thick black vertical line within the gray bar representing the [interquartile range](https://en.wikipedia.org/wiki/Interquartile_range)). Here the reduce transform is used to group observations by experiment and then compute summary statistics.

```js
Plot.plot({
  x: {
    grid: true,
    inset: 6
  },
  marks: [
    Plot.ruleY(morley, Plot.groupY({x1: iqr1, x2: iqr2}, {x: "Speed", y: "Expt"})),
    Plot.barX(morley, Plot.groupY({x1: quartile1, x2: quartile3}, {x: "Speed", y: "Expt", fill: "#ccc"})),
    Plot.tickX(morley, Plot.groupY({x: "median"}, {x: "Speed", y: "Expt", strokeWidth: 2})),
  ]
})
```

A one-dimensional tick — *i.e.*, tickX with only an *x* channel or tickY with only a *y* channel — is equivalent to a one-dimensional [rule](./rule.md). While equivalent, a one-dimensional rule should be preferred to a tick in a two-dimensional plot, if only because the name “rule” is more descriptive.

When used as annotations, ticks often have hard-coded data (below, the value zero). The default position definition of the tick (*x* for tickX and *y* for tickY) is the identity function, allowing the tick’s data to be a literal array of values.

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.tickY([0], {stroke: "red"}),
    Plot.line(aapl, {x: "Date", y: "Close"})
  ]
})
```

## Tick options

Draws an orthogonal line at the given horizontal ([Plot.tickX](#plottickxdata-options)) or vertical ([Plot.tickY](#plottickydata-options)) position, with an optional secondary position dimension along a band scale. (If the secondary dimension is quantitative instead of ordinal, use a [rule](#rule).) Ticks are often used to visualize distributions as in a “barcode” plot.

For the required channels, see [Plot.tickX](#plottickxdata-options) and [Plot.tickY](#plottickydata-options). The tick mark supports the [standard mark options](#marks), including insets. The **stroke** defaults to currentColor.

## tickX(*data*, *options*)

```js
Plot.tickX(stateage, {x: "population", y: "age"})
```

Returns a new tick↕︎ with the given *data* and *options*. The following channels are required:

* **x** - the horizontal position; bound to the *x* scale

The following optional channels are supported:

* **y** - the vertical position; bound to the *y* scale, which must be *band*

If the **y** channel is not specified, the tick will span the full vertical extent of the plot (or facet).

## tickY(*data*, *options*)

```js
Plot.tickY(stateage, {y: "population", x: "age"})
```

Returns a new tick↔︎ with the given *data* and *options*. The following channels are required:

* **y** - the vertical position; bound to the *y* scale

The following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale, which must be *band*

If the **x** channel is not specified, the tick will span the full vertical extent of the plot (or facet).