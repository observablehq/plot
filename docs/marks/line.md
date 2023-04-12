# Line mark

The **line** mark draws two-dimensional lines as in a line chart. It is closely related to the [area mark](./area.md). For example, below is a line chart of the closing price of Apple stock.

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.line(aapl, {x: "Date", y: "Close"})
  ]
})
```

If the *x* and *y* channels are not defined, the line mark assumes that the data is an iterable of points [[*x₁*, *y₁*], [*x₂*, *y₂*], …], allowing for shorthand.

```js
points = aapl.map(d => [d.Date, d.Close])
```

```js
Plot.plot({
  marks: [
    Plot.line(points)
  ]
})
```

The **lineY** mark provides default channel definitions of *x* = index and *y* = identity, letting you pass an array of numbers as data. (The **lineX** mark similarly provides *x* = identity and *y* = index defaults for lines that go up↑ instead of to the right→.) Below, a random walk is made using [d3.cumsum](https://observablehq.com/@d3/d3-cumsum?collection=@d3/d3-array) and [d3.randomNormal](https://observablehq.com/@d3/d3-random?collection=@d3/d3-random).

```js
Plot.plot({
  x: {
    axis: null
  },
  marks: [
    Plot.lineY(d3.cumsum({length: 600}, d3.randomNormal()))
  ]
})
```

Points in lines are connected in input order: the first point is connected to the second point, the second is connected to the third, and so on. This typically means that line data should be sorted chronologically. If unsorted data gives you gibberish, try a *sort* transform to fix the problem.

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.line(d3.shuffle(aapl.slice(0, 100)), {
      // sort: "Date", // uncomment to fix
      x: "Date",
      y: "Close"
    })
  ]
})
```

While the *x*-scale of a line chart often represents time, this is not required. For example, we can plot the elevation profile of a Tour de France stage (and imagine how tiring it must be to start a climb after riding 160km!). ⛰🚴💦

```js
Plot.plot({
  x: {
    label: "Distance from stage start (km) →"
  },
  y: {
    label: "↑ Elevation (m)",
    grid: true
  },
  marks: [
    Plot.line(tdf, {x: "distance", y: "elevation"}),
    Plot.ruleY([0])
  ]
})
```

There is also no requirement that *y* be dependent on *x*; lines can also be used in connected scatterplots to show two independent (but often correlated) variables. (See also [phase plots](https://en.wikipedia.org/wiki/Phase_portrait).)

```js
Plot.plot({
  inset: 10,
  grid: true,
  x: {
    label: "Miles driven (per person-year) →"
  },
  y: {
    label: "↑ Cost of gasoline ($ per gallon)"
  },
  marks: [
    Plot.line(driving, {x: "miles", y: "gas", curve: "catmull-rom", marker: "circle"}),
    Plot.text(driving, {filter: d => d.year % 5 === 0, x: "miles", y: "gas", text: d => `${d.year}`, dy: -8})
  ]
})
```

To draw multiple lines, use the *z* channel to group [tidy data](https://r4ds.had.co.nz/tidy-data.html) into series. For example, the chart below shows unemployment rates of various metro areas from the Bureau of Labor Statistics; the *z* value is the metro division name.

```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Unemployment (%)"
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(bls, {x: "date", y: "unemployment", z: "division"})
  ]
})
```

If your data is not already tidy, try [*array*.flatMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap). Below, we load additional CSV files for other stocks to compare their performance.

```js
stocks = [["AAPL", aapl], ["AMZN", amzn], ["GOOG", goog], ["IBM", ibm]]
  .flatMap(([Symbol, data]) => data.map(d => ({Symbol, ...d})))
```

If a *stroke* (or *fill*) encoding is specified, the *z* property defaults to the same, automatically grouping series by the same property. For this reason, both *stroke* and *z* are typically ordinal or categorical.

```js
Plot.plot({
  style: "overflow: visible;",
  y: {
    type: "log",
    grid: true,
    label: "↑ Change in price (%)",
    tickFormat: formatChange
  },
  marks: [
    Plot.ruleY([1]),
    Plot.line(stocks, Plot.normalizeY({
      x: "Date",
      y: "Close",
      stroke: "Symbol"
    })),
    Plot.text(stocks, Plot.selectLast(Plot.normalizeY({
      x: "Date",
      y: "Close",
      z: "Symbol",
      text: "Symbol",
      textAnchor: "start",
      dx: 3
    })))
  ]
})
```

Above, the Plot.normalizeY transform normalizes each time series (*z*) relative to its initial value, while the Plot.selectLast transform extracts the last point for labeling. A custom tick format converts multiples to percentage change (*e.g.*, 1.6× = +60%).

```js
formatChange = {
  const format = d3.format("+d");
  return x => format((x - 1) * 100);
}
```

Varying-color lines are supported. If the *stroke* value varies within series, the line will be segmented by color. (The same behavior applies to other channels, such as *strokeWidth* and *title*.) Specifying the *z* channel is strongly recommended.

```js
Plot.plot({
  x: {
    label: null
  },
  y: {
    grid: true,
    label: "↑ Unemployment (%)"
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(bls, {
      x: "date",
      y: "unemployment",
      z: "division",
      stroke: "unemployment"
    })
  ]
})
```

Color encodings can also be used to highlight specific series, say to emphasize the high unemployment rates in Michigan. When highlight returns false, the corresponding stroke is gray; when it returns true, the stroke is red.

```js
function highlight(d) {
  return /, MI /.test(d.division);
}
```

```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Unemployment (%)"
  },
  color: {
    domain: [false, true],
    range: ["#ccc", "red"]
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(bls, {
      x: "date",
      y: "unemployment",
      z: "division",
      sort: highlight,
      stroke: highlight
    })
  ]
})
```

When using *z*, lines are drawn in input order. The *sort* transform above places the red lines on top of the gray ones to improve readability.

As an alternative to *z*, you can render multiple lines using multiple marks. While more verbose, this allows you to choose different options for each line. For example, below we plot the a 14-day moving average of the daily highs and lows in temperate San Francisco using the [window transform](../transforms/window.md).

```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Temperature (°F)"
  },
  marks: [
    Plot.line(sftemps, Plot.windowY({k: 14, x: "date", y: "low", stroke: "#4e79a7"})),
    Plot.line(sftemps, Plot.windowY({k: 14, x: "date", y: "high", stroke: "#e15759"})),
    Plot.ruleY([32]) // freezing
  ]
})
```

If some channel values are undefined (or null or NaN), gaps will appear between adjacent points. To demonstrate, below we set the daily close value to NaN for the first three months of each year.

```js
someCloses = aapl.map(d => d.Date.getUTCMonth() < 3 ? NaN : d.Close)
```

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.lineY(aapl, {x: "Date", y: someCloses})
  ]
})
```

Supplying undefined values is not the same as filtering the data: the latter will interpolate between the data points. Observe the conspicuous straight lines below!

```js
someAapl = aapl.filter(d => d.Date.getUTCMonth() >= 3)
```

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.lineY(someAapl, {x: "Date", y: "Close"})
  ]
})
```

Interpolation is controlled by the *curve* property. The default curve is linear, which draws straight line segments between pairs of adjacent points. Step curves are nice for emphasizing when the value changes, while basis and Catmull–Rom curves are nice for smoothing. See the [D3 documentation](https://observablehq.com/@d3/curves) for more about curves. In the plot of unemployed construction workers below, try chosing a different curve.

<!-- viewof curve = Inputs.select([
  "linear",
  "step",
  "step-after",
  "step-before",
  // "linear-closed",
  "basis",
  // "basis-closed",
  // "basis-open",
  // "bundle",
  "cardinal",
  // "cardinal-closed",
  // "cardinal-open",
  "catmull-rom",
  // "catmull-rom-closed",
  // "catmull-rom-open",
  "monotone-x",
  // "monotone-y",
  "bump-x",
  // "bump-y",
  "natural",
], {label: "Curve", value: "step"}) -->

```js
Plot.plot({
  marks: [
    Plot.lineY(gary, {x: "date", y: "unemployment", curve, strokeWidth: 1})
  ]
})
```

```js
gary = bls.filter(d => d.division === "Gary, IN Met Div")
```

## Line options

Draws two-dimensional lines as in a line chart.

The following channels are required:

* **x** - the horizontal position; bound to the *x* scale
* **y** - the vertical position; bound to the *y* scale

In addition to the [standard mark options](#marks), the following optional channels are supported:

* **z** - a categorical value to group data into series

By default, the data is assumed to represent a single series (a single value that varies over time, *e.g.*). If the **z** channel is specified, data is grouped by *z* to form separate series. Typically *z* is a categorical value such as a series name. If **z** is not specified, it defaults to **stroke** if a channel, or **fill** if a channel.

The **fill** defaults to none. The **stroke** defaults to currentColor if the fill is none, and to none otherwise. If the stroke is defined as a channel, the line will be broken into contiguous overlapping segments when the stroke color changes; the stroke color will apply to the interval spanning the current data point and the following data point. This behavior also applies to the **fill**, **fillOpacity**, **strokeOpacity**, **strokeWidth**, **opacity**, **href**, **title**, and **ariaLabel** channels. When any of these channels are used, setting an explicit **z** channel (possibly to null) is strongly recommended. The **strokeWidth** defaults to 1.5, the **strokeLinecap** and **strokeLinejoin** default to *round*, and the **strokeMiterlimit** defaults to 1.

Points along the line are connected in input order. Likewise, if there are multiple series via the *z*, *fill*, or *stroke* channel, the series are drawn in input order such that the last series is drawn on top. Typically, the data is already in sorted order, such as chronological for time series; if sorting is needed, consider a [sort transform](#transforms).

The line mark supports [curve options](#curves) to control interpolation between points, and [marker options](#markers) to add a marker (such as a dot or an arrowhead) on each of the control points. The default curve is *auto*, which is equivalent to *linear* if there is no [projection](#projection-options), and otherwise uses the associated projection. If any of the *x* or *y* values are invalid (undefined, null, or NaN), the line will be interrupted, resulting in a break that divides the line shape into multiple segments. (See [d3-shape’s *line*.defined](https://github.com/d3/d3-shape/blob/main/README.md#line_defined) for more.) If a line segment consists of only a single point, it may appear invisible unless rendered with rounded or square line caps. In addition, some curves such as *cardinal-open* only render a visible segment if it contains multiple points.

## line(*data*, *options*)

```js
Plot.line(aapl, {x: "Date", y: "Close"})
```

Returns a new line with the given *data* and *options*. If neither the **x** nor **y** options are specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

## lineX(*data*, *options*)

```js
Plot.lineX(aapl.map(d => d.Close))
```

Similar to [Plot.line](#plotlinedata-options) except that if the **x** option is not specified, it defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …]. If the **y** option is not specified, it defaults to [0, 1, 2, …].

If the **interval** option is specified, the [binY transform](#bin) is implicitly applied to the specified *options*. The reducer of the output *x* channel may be specified via the **reduce** option, which defaults to *first*. To default to zero instead of showing gaps in data, as when the observed value represents a quantity, use the *sum* reducer.

```js
Plot.lineX(observations, {y: "date", x: "temperature", interval: "day"})
```

The **interval** option is recommended to “regularize” sampled data; for example, if your data represents timestamped temperature measurements and you expect one sample per day, use "day" as the interval.

## lineY(*data*, *options*)

```js
Plot.lineY(aapl.map(d => d.Close))
```

Similar to [Plot.line](#plotlinedata-options) except that if the **y** option is not specified, it defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …]. If the **x** option is not specified, it defaults to [0, 1, 2, …].

If the **interval** option is specified, the [binX transform](#bin) is implicitly applied to the specified *options*. The reducer of the output *y* channel may be specified via the **reduce** option, which defaults to *first*. To default to zero instead of showing gaps in data, as when the observed value represents a quantity, use the *sum* reducer.

```js
Plot.lineY(observations, {x: "date", y: "temperature", interval: "day"})
```

The **interval** option is recommended to “regularize” sampled data; for example, if your data represents timestamped temperature measurements and you expect one sample per day, use "day" as the interval.
