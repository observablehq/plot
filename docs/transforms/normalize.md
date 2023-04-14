# Normalize transform

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

## Normalize options

The Plot.normalizeX and Plot.normalizeY transforms normalize series values relative to the given basis. For example, if the series values are [*y₀*, *y₁*, *y₂*, …] and the *first* basis is used, the mapped series values would be [*y₀* / *y₀*, *y₁* / *y₀*, *y₂* / *y₀*, …] as in an index chart. The **basis** option specifies how to normalize the series values. The following basis methods are supported:

* *first* - the first value, as in an index chart; the default
* *last* - the last value
* *min* - the minimum value
* *max* - the maximum value
* *mean* - the mean value (average)
* *median* - the median value
* *pXX* - the percentile value, where XX is a number in [00,99]
* *sum* - the sum of values
* *extent* - the minimum is mapped to zero, and the maximum to one
* *deviation* - each value is transformed by subtracting the mean and then dividing by the standard deviation
* a function to be passed an array of values, returning the desired basis

## normalize(*basis*)

```js
Plot.map({y: Plot.normalize("first")}, {x: "Date", y: "Close", stroke: "Symbol"})
```

Returns a normalize map method for the given *basis*, suitable for use with Plot.map.

## normalizeX(*basis*, *options*)

```js
Plot.normalizeX("first", {y: "Date", x: "Close", stroke: "Symbol"})
```

Like [Plot.mapX](#plotmapxmap-options), but applies the normalize map method with the given *basis*.

## normalizeY(*basis*, *options*)

```js
Plot.normalizeY("first", {x: "Date", y: "Close", stroke: "Symbol"})
```

Like [Plot.mapY](#plotmapymap-options), but applies the normalize map method with the given *basis*.
