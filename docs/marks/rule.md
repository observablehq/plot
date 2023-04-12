# Rule mark

Rules are horizontal or vertical lines. A **ruleY**↔︎ has a *y*-value, while a **ruleX**↕︎ has an *x*-value. Rules are often used as annotations, say to mark the *y* = 0 baseline (in red below for emphasis) in a line chart.

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.ruleY([0], {stroke: "red"}),
    Plot.line(aapl, {x: "Date", y: "Close"})
  ]
})
```

As annotations, rules often have hard-coded data (above, the value zero, or below, the value one). The default position definition of the rule (*y* for ruleY and *x* for ruleX) is the identity function, allowing the rule’s data to be a literal array of values.

```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Change in price (%)",
    type: "log",
    tickFormat: d => d3.format("+d")((d - 1) * 100)
  },
  marks: [
    Plot.ruleY([1], {stroke: "red"}),
    Plot.line(aapl, Plot.normalizeY({basis: "first", x: "Date", y: "Close"}))
  ]
})
```

Yet rules can also be used to visualize data. Below, a random normal distribution is plotted with rules, looking a bit like the [emission spectrum of Hydrogen](https://en.wikipedia.org/wiki/Hydrogen_spectral_series). Reducing opacity allows better perception of density when rules are coincident.

```js
Plot.plot({
  x: {
    domain: [-4, 4]
  },
  marks: [
    Plot.ruleX({length: 500}, {x: d3.randomNormal(), strokeOpacity: 0.2}),
  ]
})
```

Rules can also be an alternative to an [area mark](./area.md) as in a band chart, provided the data is sufficiently dense: using the *y1* and *y2* channels, you can limit the extent of a rule along the secondary dimension. And rules support a *stroke* color encoding. The rules below plot the daily minimum and maximimum temperature for Seattle.

```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Temperature (°F)",
    transform: d => d * 9 / 5 + 32 // Celsius to Fahrenheit
  },
  color: {
    scheme: "BuRd"
  },
  marks: [
    Plot.ruleY([0]),
    Plot.ruleX(seattle, {x: "date", y1: "temp_min", y2: "temp_max", stroke: "temp_max"})
  ]
})
```

In the candlestick chart below, three rules are drawn for each trading day: a gray rule spans the chart, showing gaps for weekends and holidays; a black rule spans the day’s low and high; and a green or red rule spans the day’s open and close.

```js
Plot.plot({
  width,
  inset: 6,
  x: {
    label: null
  },
  y: {
    grid: true,
    label: "↑ Stock price ($)"
  },
  color: {
    range: ["#e41a1c", "#000000", "#4daf4a"]
  },
  marks: [
    Plot.ruleX(aapl120, {
      x: "Date",
      strokeOpacity: 0.1
    }),
    Plot.ruleX(aapl120, {
      x: "Date",
      y1: "Low",
      y2: "High"
    }),
    Plot.ruleX(aapl120, {
      x: "Date",
      y1: "Open",
      y2: "Close",
      stroke: d => Math.sign(d.Close - d.Open),
      strokeWidth: 4,
      strokeLinecap: "round"
    })
  ]
})
```

Rules can also be used for visually grouping, such as in the [dot plot](./dot.md) below showing the decline of *The Simpsons*. The rules indicate the extent (minimum and maximum) for each season, while a red line shows the median rating trend.

```js
Plot.plot({
  x: {
    type: "point",
    label: "Season →",
    labelAnchor: "right"
  },
  y: {
    label: "↑ IMDb rating"
  },
  marks: [
    Plot.ruleX(simpsons, Plot.groupX({y1: "min", y2: "max"}, {x: "season", y: "imdb_rating"})),
    Plot.line(simpsons, Plot.groupX({y: "median"}, {x: "season", y: "imdb_rating", stroke: "red"})),
    Plot.dot(simpsons, {x: "season", y: "imdb_rating"})
  ]
})
```

Rules can also be a stylistic choice, as in the lollipop chart below, serving the role of a pixel-wide skinny [bar](./bar.md) topped with a [dot](./dot.md).

```js
Plot.plot({
  x: {
    label: null,
    tickSize: 0
  },
  y: {
    label: "↑ Frequency (%)",
    transform: d => d * 100
  },
  marks: [
    Plot.ruleY([0]),
    Plot.ruleX(alphabet, {x: "letter", y: "frequency", fill: "black"}),
    Plot.dot(alphabet, {x: "letter", y: "frequency", fill: "black", r: 4})
  ]
})
```

## Rule options

Draws an orthogonal line at the given horizontal ([Plot.ruleX](#plotrulexdata-options)) or vertical ([Plot.ruleY](#plotruleydata-options)) position, either across the entire plot (or facet) or bounded in the opposite dimension. Rules are often used with hard-coded data to annotate special values such as *y* = 0, though they can also be used to visualize data as in a lollipop chart.

For the required channels, see [Plot.ruleX](#plotrulexdata-options) and [Plot.ruleY](#plotruleydata-options). The rule mark supports the [standard mark options](#marks), including insets along its secondary dimension. The **stroke** defaults to currentColor.

## ruleX(*data*, *options*)

```js
Plot.ruleX([0]) // as annotation
```
```js
Plot.ruleX(alphabet, {x: "letter", y: "frequency"}) // like barY
```

Returns a new rule↕︎ with the given *data* and *options*. In addition to the [standard mark options](#marks), the following channels are optional:

* **x** - the horizontal position; bound to the *x* scale
* **y1** - the starting vertical position; bound to the *y* scale
* **y2** - the ending vertical position; bound to the *y* scale

If the **x** option is not specified, it defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …]. If a **y** option is specified, it is shorthand for the **y2** option with **y1** equal to zero; this is the typical configuration for a vertical lollipop chart with rules aligned at *y* = 0. If the **y1** channel is not specified, the rule will start at the top of the plot (or facet). If the **y2** channel is not specified, the rule will end at the bottom of the plot (or facet).

If an **interval** is specified, such as d3.utcDay, **y1** and **y2** can be derived from **y**: *interval*.floor(*y*) is invoked for each *y* to produce *y1*, and *interval*.offset(*y1*) is invoked for each *y1* to produce *y2*. If the interval is specified as a number *n*, *y1* and *y2* are taken as the two consecutive multiples of *n* that bracket *y*.

## ruleY(*data*, *options*)

```js
Plot.ruleY([0]) // as annotation
```

```js
Plot.ruleY(alphabet, {y: "letter", x: "frequency"}) // like barX
```

Returns a new rule↔︎ with the given *data* and *options*. In addition to the [standard mark options](#marks), the following channels are optional:

* **y** - the vertical position; bound to the *y* scale
* **x1** - the starting horizontal position; bound to the *x* scale
* **x2** - the ending horizontal position; bound to the *x* scale

If the **y** option is not specified, it defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …]. If the **x** option is specified, it is shorthand for the **x2** option with **x1** equal to zero; this is the typical configuration for a horizontal lollipop chart with rules aligned at *x* = 0. If the **x1** channel is not specified, the rule will start at the left edge of the plot (or facet). If the **x2** channel is not specified, the rule will end at the right edge of the plot (or facet).

If an **interval** is specified, such as d3.utcDay, **x1** and **x2** can be derived from **x**: *interval*.floor(*x*) is invoked for each *x* to produce *x1*, and *interval*.offset(*x1*) is invoked for each *x1* to produce *x2*. If the interval is specified as a number *n*, *x1* and *x2* are taken as the two consecutive multiples of *n* that bracket *x*.
