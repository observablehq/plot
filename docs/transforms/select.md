# Select

The select transform filters marks. It is similar to the basic [filter transform](../transforms.md) except that it provides convenient shorthand for pulling a single value out of each series. The data are grouped into series using the *z*, *fill*, or *stroke* channel in the same fashion as the [area](../marks/area.md) and [line](../marks/line.md) marks.

<!-- stocks = (await Promise.all([FileAttachment("aapl.csv"), FileAttachment("amzn.csv"), FileAttachment("goog.csv"), FileAttachment("ibm.csv")]
  .map(async file => [file.name.slice(0, -4).toUpperCase(), await file.csv({typed: "true"})])))
  .flatMap(([Symbol, data]) => data.map(d => ({Symbol, ...d}))) -->

```js
Plot.plot({
  marginRight: 40,
  y: {
    grid: true,
    label: "↑ Price ($)"
  },
  marks: [
    Plot.line(stocks, {x: "Date", y: "Close", stroke: "Symbol"}),
    Plot.text(stocks, Plot.selectLast({x: "Date", y: "Close", z: "Symbol", text: "Symbol", textAnchor: "start", dx: 3}))
  ]
})
```
