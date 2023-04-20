# Map transform

The **map transform** groups data into series and then transforms each series’ values, say to normalize them relative to some basis or to apply a moving average.

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

The [window](./window.md) and [normalize](./normalize.md) transforms are variants of the map transform.

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
