# Select transform

The select transform filters marks. It is similar to the basic [filter transform](../features/transforms.md) except that it provides convenient shorthand for pulling a single value out of each series. The data are grouped into series using the *z*, *fill*, or *stroke* channel in the same fashion as the [area](../marks/area.md) and [line](../marks/line.md) marks.

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

## Select options

Selects a value from each series, say to label a line or annotate extremes.

The select transform derives a filtered mark index; it does not affect the mark’s data or channels. It is similar to the basic [filter transform](#transforms) except that provides convenient shorthand for pulling a single value out of each series. The data are grouped into series using the *z*, *fill*, or *stroke* channel in the same fashion as the [area](#area) and [line](#line) marks.

## select(*selector*, *options*)

Selects the points of each series selected by the *selector*, which can be specified either as a function which receives as input the index of the series, the shorthand “first” or “last”, or as a {*key*: *value*} object with exactly one *key* being the name of a channel and the *value* being a function which receives as input the index of the series and the channel values. The *value* may alternatively be specified as the shorthand “min” and “max” which respectively select the minimum and maximum points for the specified channel.

For example, to select the point within each series that is the closest to the median of the *y* channel:

```js
Plot.select({
  y: (I, V) => {
    const median = d3.median(I, i => V[i]);
    const i = d3.least(I, i => Math.abs(V[i] - median));
    return [i];
  }
}, {
  x: "year",
  y: "revenue",
  fill: "format"
})
```

To pick three points at random in each series:

```js
Plot.select(I => d3.shuffle(I.slice()).slice(0, 3), {z: "year", ...})
```

To pick the point in each city with the highest temperature:

```js
Plot.select({fill: "max"}, {x: "date", y: "city", fill: "temperature", z: "city"})
```

## selectFirst(*options*)

Selects the first point of each series according to input order.

## selectLast(*options*)

Selects the last point of each series according to input order.

## selectMinX(*options*)

Selects the leftmost point of each series.

## selectMinY(*options*)

Selects the lowest point of each series.

## selectMaxX(*options*)

Selects the rightmost point of each series.

## selectMaxY(*options*)

Selects the highest point of each series.
