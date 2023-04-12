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

## Map options

Groups data into series and then applies a mapping function to each series’ values, say to normalize them relative to some basis or to apply a moving average.

The map transform derives new output channels from corresponding input channels. The output channels have strictly the same length as the input channels; the map transform does not affect the mark’s data or index. The map transform is akin to running [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) on the input channel’s values with the given function. However, the map transform is series-aware: the data are first grouped into series using the *z*, *fill*, or *stroke* channel in the same fashion as the [area](#area) and [line](#line) marks so that series are processed independently.

Like the [group](#group) and [bin](#bin) transforms, the [Plot.map](#plotmapoutputs-options) transform takes two arguments: an *outputs* object that describes the output channels to compute, and an *options* object that describes the input channels and any additional options. The other map transforms, such as [Plot.normalizeX](#plotnormalizexbasis-options) and [Plot.windowX](#plotwindowxk-options), call Plot.map internally.

The following map methods are supported:

* *cumsum* - a cumulative sum
* *rank* - the rank of each value in the sorted array
* *quantile* - the rank, normalized between 0 and 1
* a function to be passed an array of values, returning new values
* an object that implements the *mapIndex* method

If a function is used, it must return an array of the same length as the given input. If a *mapIndex* method is used, it is repeatedly passed the index for each series (an array of integers), the corresponding input channel’s array of values, and the output channel’s array of values; it must populate the slots specified by the index in the output array.

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

The Plot.windowX and Plot.windowY transforms compute a moving window around each data point and then derive a summary statistic from values in the current window, say to compute rolling averages, rolling minimums, or rolling maximums. These transforms also take additional options:

* **k** - the window size (the number of elements in the window)
* **anchor** - how to align the window: *start*, *middle*, or *end*
* **reduce** - the aggregation method (window reducer)
* **strict** - if true, output undefined if any window value is undefined; defaults to false

If the **strict** option is true, the output start values or end values or both (depending on the **anchor**) of each series may be undefined since there are not enough elements to create a window of size **k**; output values may also be undefined if some of the input values in the corresponding window are undefined. If the **strict** option is false (the default), the window will be automatically truncated as needed, and undefined input values are ignored. For example, if **k** is 24 and **anchor** is *middle*, then the initial 11 values have effective window sizes of 13, 14, 15, … 23, and likewise the last 12 values have effective window sizes of 23, 22, 21, … 12. Values computed with a truncated window may be noisy; if you would prefer to not show this data, set the **strict** option to true.

The following window reducers are supported:

* *min* - the minimum
* *max* - the maximum
* *mean* - the mean (average)
* *median* - the median
* *mode* - the mode (most common occurrence)
* *pXX* - the percentile value, where XX is a number in [00,99]
* *sum* - the sum of values
* *deviation* - the standard deviation
* *variance* - the variance per [Welford’s algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
* *difference* - the difference between the last and first window value
* *ratio* - the ratio of the last and first window value
* *first* - the first value
* *last* - the last value
* a function to be passed an array of *k* values

By default, **anchor** is *middle* and **reduce** is *mean*.

## map(*outputs*, *options*)

```js
Plot.map({y: "cumsum"}, {y: d3.randomNormal()})
```

Groups on the first channel of *z*, *fill*, or *stroke*, if any, and then for each channel declared in the specified *outputs* object, applies the corresponding map method. Each channel in *outputs* must have a corresponding input channel in *options*.

## mapX(*map*, *options*)

```js
Plot.mapX("cumsum", {x: d3.randomNormal()})
```

Equivalent to Plot.map({x: *map*, x1: *map*, x2: *map*}, *options*), but ignores any of **x**, **x1**, and **x2** not present in *options*.

## mapY(*map*, *options*)

```js
Plot.mapY("cumsum", {y: d3.randomNormal()})
```

Equivalent to Plot.map({y: *map*, y1: *map*, y2: *map*}, *options*), but ignores any of **y**, **y1**, and **y2** not present in *options*.

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
