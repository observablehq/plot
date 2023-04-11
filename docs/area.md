# Area

The **areaY** mark draws the region between a baseline (*y1*) and a topline (*y2*) as in an area chart. When the baseline is *y* = 0, the *y* channel can be specified instead of *y1* and *y2*. For example, here is an area chart of Apple’s stock price.

```js
Plot.plot({
  marks: [
    Plot.areaY(aapl, {x: "Date", y: "Close"})
  ]
})
```

Areas are often used in conjunction with [line](./line.md) and [rule](./rule.md) marks to accentuate the topline and baseline:

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.areaY(aapl, {x: "Date", y: "Close", fill: "#ccc"}),
    Plot.lineY(aapl, {x: "Date", y: "Close"}),
    Plot.ruleY([0])
  ]
})
```

With the default channel definitions of *x* = index and *y* = identity, you can pass an array of numbers as data. Below, a random walk is constructed with [d3.cumsum](https://observablehq.com/@d3/d3-cumsum?collection=@d3/d3-array) and [d3.randomNormal](https://observablehq.com/@d3/d3-random?collection=@d3/d3-random).

```js
numbers = d3.cumsum({length: 600}, d3.randomNormal())
```

```js
Plot.plot({
  marks: [
    Plot.areaY(numbers, {})
  ]
})
```

As with lines, points in areas are connected in input order: the first point is connected to the second point, the second is connected to the third, and so on. This typically means that area data should be sorted chronologically. If unsorted data gives you gibberish, try a *sort* transform to fix the problem.

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.areaY(d3.shuffle(aapl.slice(0, 100)), {
      // sort: "Date", // uncomment to fix
      x: "Date",
      y: "Close"
    })
  ]
})
```

When the baseline is not *y* = 0 but instead represents another dimension of data as in a band chart, specify *y1* and *y2* channels instead of *y*. Note that below since the *y1* and *y2* channels refer to different fields, a *y*-label is specified to improve readability.

```js
Plot.plot({
  y: {
    label: "↑ Temperature (°F)",
    grid: true
  },
  marks: [
    Plot.areaY(sftemp, {x: "date", y1: "low", y2: "high"})
  ]
})
```

The band above is spikey; we can smooth it by applying a 14-day moving average to the *y1* and *y2* channels with the [window transform](./window.md), and do the same for a midline. We can also add a *y*-rule to indicate the freezing point, 32°F.

```js
Plot.plot({
  y: {
    label: "↑ Temperature (°F)",
    grid: true
  },
  marks: [
    Plot.ruleY([32]),
    Plot.areaY(sftemp, Plot.windowY({
      x: "date",
      y1: "low",
      y2: "high",
      fill: "#ccc",
      k: 14
    })),
    Plot.line(sftemp, Plot.windowY({
      x: "date",
      y: d => (d.low + d.high) / 2,
      k: 14
    }))
  ]
})
```

While charts typically put *y* = 0 on the bottom edge, such that the area grows up, this is not required; reversing the *y*-scale will produce a “hanging” area that grows down.

```js
Plot.plot({
  x: {
    label: null
  },
  y: {
    grid: true,
    reverse: true
  },
  marks: [
    Plot.areaY(aapl, {x: "Date", y: "Close", fill: "#ccc"}),
    Plot.lineY(aapl, {x: "Date", y: "Close"}),
    Plot.ruleY([0])
  ]
})
```

The **areaY** mark is a special case of the more general **area** mark which allows the *x* definition of the baseline (*x1*) and topline (*x2*) to differ. For a vertically-oriented baseline and topline, such as when time goes up instead of right, use **areaX** and swap the *x*  and *y* channels.

```js
Plot.plot({
  x: {
    grid: true
  },
  marks: [
    Plot.areaX(aapl, {y: "Date", x: "Close", fill: "#ccc"}),
    Plot.lineX(aapl, {y: "Date", x: "Close"}),
    Plot.ruleX([0])
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
    Plot.areaY(aapl, {x: "Date", y: someCloses, fill: "#ccc"}),
    Plot.lineY(aapl, {x: "Date", y: someCloses}),
    Plot.ruleY([0])
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
    Plot.areaY(someAapl, {x: "Date", y: "Close", fill: "#ccc"}),
    Plot.lineY(someAapl, {x: "Date", y: "Close"}),
    Plot.ruleY([0])
  ]
})
```

Interpolation is controlled by the *curve* property. The default curve is linear, which draws straight line segments between pairs of adjacent points. Step curves are nice for emphasizing when the value changes, while basis and Catmull–Rom curves are nice for smoothing. See the [D3 documentation](https://observablehq.com/@d3/curves?collection=@d3/d3-shape) for more about curves. In the plot of unemployed construction workers below, try chosing a different curve.

```js
Plot.plot({
  marks: [
    Plot.areaY(construction, {x: "date", y: "unemployed", curve, fillOpacity: 0.1}),
    Plot.lineY(construction, {x: "date", y: "unemployed", curve, strokeWidth: 1}),
    Plot.ruleY([0])
  ]
})
```

```js
construction = bls.filter(d => d.industry === "Construction")
```

An area mark’s *z* channel groups data along an ordinal (discrete) dimension, producing multiple areas. This is typically used with the [stack transform](./stack.md) for a stacked area chart or streamgraph, but it can also be used for overlapping areas.

```js
Plot.plot({
  marks: [
    Plot.areaY(bls, {x: "date", y2: "unemployed", z: "industry", fillOpacity: 0.1}),
    Plot.lineY(bls, {x: "date", y: "unemployed", z: "industry", strokeWidth: 1})
  ]
})
```

If the *z* channel is not specified, but a varying *fill* channel is, the *fill* channel is used for *z*. The *z* channel will further fallback to a varying *stroke* channel if needed.

```js
Plot.plot({
  y: {
    transform: d => d / 1000,
    label: "↑ Unemployed (thousands)"
  },
  marks: [
    Plot.areaY(bls, {x: "date", y: "unemployed", fill: "industry"}), // implicit stacking
    Plot.ruleY([0])
  ]
})
```

As an alternative to overlapping or stacking, faceting can be used to produce small multiples, here arranged vertically with a shared *x*-axis.

```js
Plot.plot({
  height: 600,
  y: {
    axis: null
  },
  fy: {
    axis: "right",
    label: null
  },
  facet: {
    data: bls,
    y: "industry",
    marginRight: 140
  },
  marks: [
    Plot.areaY(bls, {x: "date", y: "unemployed", fillOpacity: 0.2}),
    Plot.lineY(bls, {x: "date", y: "unemployed", strokeWidth: 1})
  ]
})
```

Above, smaller industries such as agriculture and mining & extraction are dwarfed by larger industries such as wholesale & retail trade. To emphasize each industry’s trend, instead of comparing absolute numbers across industries, we can normalize unemployment relative to the median for each industry. Now the job loss in mining & extraction is more readily apparent.

```js
Plot.plot({
  height: 600,
  y: {
    axis: null
  },
  fy: {
    axis: "right",
    label: null
  },
  facet: {
    data: bls,
    y: "industry",
    marginRight: 140
  },
  marks: [
    Plot.areaY(bls, Plot.normalizeY({basis: "median", x: "date", y: "unemployed", fillOpacity: 0.2})),
    Plot.lineY(bls, Plot.normalizeY({basis: "median", x: "date", y: "unemployed", strokeWidth: 1}))
  ]
})
```
