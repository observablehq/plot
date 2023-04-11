# Map transform

The map transform groups data into series and then transforms each series’ values, say to normalize them relative to some basis or to apply a moving average.

Like the [group](./group.md) and [bin](./bin.md) transforms, the Plot.map transform takes two arguments: an *outputs* object that describes the output channels to compute, and an *options* object that describes the input channels and any additional options. For example, the *cumsum* map method computes the cumulative sum.

```js
values = Array.from({length: 500}, d3.randomNormal())
```

```js
Plot.lineY(values, Plot.map({y: "cumsum"}, {y: values})).plot({height: 200})
```

The Plot.mapX and Plot.mapY transforms are shorthand for applying a given map method to all *x* or *y* channels.

```js
Plot.lineY(values, Plot.mapY("cumsum", {y: values})).plot({height: 200})
```

The window and normalize transforms are variants of the map transform.

The Plot.windowX and Plot.windowY transforms compute a moving window around each data point and then derive a summary statistic from values in the current window, say to compute rolling averages, rolling minimums, or rolling maximums.

```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Daily temperature range (°F)"
  },
  marks: [
    Plot.areaY(temp, {x: "date", y1: "low", y2: "high", curve: "step", fill: "#ccc"}),
    Plot.line(temp, Plot.windowY({x: "date", y: "low", k: 7, curve: "step", stroke: "blue"})),
    Plot.line(temp, Plot.windowY({x: "date", y: "high", k: 7, curve: "step", stroke: "red"}))
  ]
})
```

The Plot.normalizeX and Plot.normalizeY transforms normalize series values relative to some basis, say to convert absolute values into relative values. For example, here is a line chart showing the return of several stocks.

```js
Plot.plot({
  marginRight: 40,
  y: {
    type: "log",
    grid: true,
    label: "↑ Change in price (%)",
    tickFormat: (f => x => f((x - 1) * 100))(d3.format("+d"))
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

As another example, the normalize transform can be used to compute proportional demographics from absolute populations.

```js
{
  const xy = Plot.normalizeX({basis: "sum", z: "state", x: "population", y: "state"});
  return Plot.plot({
    height: 660,
    grid: true,
    x: {
      axis: "top",
      label: "Percent (%) →",
      transform: d => d * 100
    },
    y: {
      domain: d3.groupSort(stateage, g => -g.find(d => d.age === "≥80").population / d3.sum(g, d => d.population), d => d.state),
      axis: null
    },
    color: {
      scheme: "spectral",
      domain: stateage.ages
    },
    marks: [
      Plot.ruleX([0]),
      Plot.ruleY(stateage, Plot.groupY({x1: "min", x2: "max"}, xy)),
      Plot.dot(stateage, {...xy, fill: "age"}),
      Plot.text(stateage, Plot.selectMinX({...xy, textAnchor: "end", dx: -6, text: "state"}))
    ]
  });
}
```
