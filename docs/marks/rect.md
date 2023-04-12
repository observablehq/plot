# Rect mark

The **rect** mark draws a rectangular, axis-aligned region defined by the channels *x1*, *y1*, *x2*, and *y2*. It is most often used in conjunction with the [bin transform](../transforms/bin.md) to produce a histogram. The **rectX** mark is shorthand for *x1* = zero, *x2* = *x*, while the **rectY** mark is shorthand for *y1* = zero, *y2* = *y*. For example, below is a histogram of (log) daily trade volume for Apple stock.

```js
Plot.plot({
  x: {
    round: true,
    label: "Trade volume (log₁₀) →"
  },
  y: {
    grid: true
  },
  marks: [
    Plot.rectY(aapl, Plot.binX({y: "count"}, {x: d => Math.log10(d.Volume)})),
    Plot.ruleY([0])
  ]
})
```

The rect mark is closely related to the [bar mark](./bar.md). Both generate a rectangle; the difference is in how the coordinates are specified. For a bar, one side is a quantitative interval (*e.g.*, from 0 to a number of units sold) while the other is an ordinal or categorical value (*e.g.*, a fruit name); whereas for a rect, both sides are quantitative intervals. Hence a bar is used for a bar chart but a rect is needed for a histogram.

As another example, below we recreate a [chart by Max Roser](https://ourworldindata.org/poverty-minimum-growth-needed) that visualizes global poverty. Each rect here represents a country: *x* encodes the country’s population, while *y* encodes the proportion of the country’s population living in poverty; hence the rect *area* encodes the number of people living in poverty. Rects are [stacked](../transforms/stack.md) along *x* in order of descending *y*.

```js
Plot.plot({
  width: 928,
  x: {
    label: "Population (millions) →"
  },
  y: {
    label: "↑ Proportion living on less than $30 per day (%)",
    transform: d => d * 100,
    grid: true
  },
  marks: [
    Plot.rectY(povcalnet, Plot.stackX({
      filter: d => ["N", "A"].includes(d.CoverageType),
      x: "ReqYearPopulation",
      order: "HeadCount",
      reverse: true,
      y2: "HeadCount", // y2 to avoid stacking by y
      title: d => `${d.CountryName}\n${(d.HeadCount * 100).toFixed(1)}%`,
      insetLeft: 0.2,
      insetRight: 0.2
    })),
    Plot.ruleY([0])
  ]
})
```

rectX and rectY are suitable for one-dimensional histograms, while rect is for two-dimensional histograms, also known as heatmaps, where density is represented by the *fill* color encoding. (A similar plot can be made with [dots](./dot.md), if you’d prefer a size encoding. If both *x* and *y* are ordinal dimensions, use a [cell](./cell.md) instead; and if one is an ordinal dimension and the other is quantitative, use a [bar](./bar.md).)

```js
Plot.plot({
  height: 640,
  color: {
    scheme: "bupu",
    type: "symlog"
  },
  marks: [
    Plot.rect(diamonds, Plot.bin({fill: "count"}, {x: "carat", y: "price", thresholds: 100}))
  ]
})
```

The rect mark supports four options for insetting the sides of the rect: *insetTop*, *insetRight*, *insetBottom*, and *insetLeft*. (The bin transform automatically applies a half-pixel inset on the relevant sides.) The *inset* option is shorthand for setting all four sides to the same value. Compare the heatmap below to the one above.

```js
Plot.plot({
  height: 640,
  round: true,
  color: {
    scheme: "bupu",
    type: "symlog"
  },
  marks: [
    Plot.rect(diamonds, Plot.bin({fill: "count"}, {x: "carat", y: "price", thresholds: 100, inset: 0}))
  ]
})
```

The rect mark exposes SVG’s [*rx* and *ry* attributes](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx) for rounded corners. The rounded corners will get squished if the rects are too small, which may not be desirable.

```js
Plot.plot({
  x: {
    round: true,
    label: "Trade volume (log₁₀) →"
  },
  y: {
    grid: true
  },
  marks: [
    Plot.rectY(aapl, Plot.binX({y: "count"}, {rx: 8, x: d => Math.log10(d.Volume)})),
    Plot.ruleY([0])
  ]
})
```

## Rect options

Draws rectangles where both *x* and *y* are quantitative as in a histogram. Both pairs of quantitative values represent lower and upper bounds, and often one of the lower bounds is implicitly zero. If one of the dimensions is ordinal, use a [bar](#bar) instead; if both dimensions are ordinal, use a [cell](#cell) instead. Rects are often used in conjunction with a [bin transform](#bin).

The following channels are optional:

* **x1** - the starting horizontal position; bound to the *x* scale
* **y1** - the starting vertical position; bound to the *y* scale
* **x2** - the ending horizontal position; bound to the *x* scale
* **y2** - the ending vertical position; bound to the *y* scale

Typically either **x1** and **x2** are specified, or **y1** and **y2**, or both.

If an **interval** is specified, such as d3.utcDay, **x1** and **x2** can be derived from **x**: *interval*.floor(*x*) is invoked for each *x* to produce *x1*, and *interval*.offset(*x1*) is invoked for each *x1* to produce *x2*. The same is true for *y*, *y1*, and *y2*, respectively. If the interval is specified as a number *n*, *x1* and *x2* are taken as the two consecutive multiples of *n* that bracket *x*. The interval may be specified either as as {x, interval} or x: {value, interval} to apply different intervals to x and y.

The rect mark supports the [standard mark options](#marks), including insets and rounded corners. The **stroke** defaults to none. The **fill** defaults to currentColor if the stroke is none, and to none otherwise.

## rect(*data*, *options*)

```js
Plot.rect(athletes, Plot.bin({fill: "count"}, {x: "weight", y: "height"}))
```

Returns a new rect with the given *data* and *options*.

## rectX(*data*, *options*)

```js
Plot.rectX(athletes, Plot.binY({x: "count"}, {y: "weight"}))
```

Equivalent to [Plot.rect](#plotrectdata-options), except that if neither the **x1** nor **x2** option is specified, the **x** option may be specified as shorthand to apply an implicit [stackX transform](#plotstackxstack-options); this is the typical configuration for a histogram with rects aligned at *x* = 0. If the **x** option is not specified, it defaults to the identity function.

## rectY(*data*, *options*)

```js
Plot.rectY(athletes, Plot.binX({y: "count"}, {x: "weight"}))
```

Equivalent to [Plot.rect](#plotrectdata-options), except that if neither the **y1** nor **y2** option is specified, the **y** option may be specified as shorthand to apply an implicit [stackY transform](#plotstackystack-options); this is the typical configuration for a histogram with rects aligned at *y* = 0. If the **y** option is not specified, it defaults to the identity function.
