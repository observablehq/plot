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
