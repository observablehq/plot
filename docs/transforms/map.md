<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref} from "vue";
import aapl from "../data/aapl.ts";

const n = ref(20);
const k = ref(2);

</script>

# Map transform

The **map transform** groups data into series and then transforms each series’ values, say to normalize them relative to some basis or to apply a moving average. For example, below the map transform computes a cumulative sum (*cumsum*) of a series of random numbers sampled from a normal distribution — in other words, a random walk.

:::plot https://observablehq.com/@observablehq/plot-random-walk-cumsum-map
```js
Plot.plot({
  marks: [
    Plot.ruleY([0]),
    Plot.lineY({length: 600}, Plot.mapY("cumsum", {y: d3.randomNormal()}))
  ]
})
```
:::

As another example, we can map the daily trading volume of Apple stock to a [*p*-quantile](https://en.wikipedia.org/wiki/Quantile) in [0, 1] using the *quantile* map method, where 0 represents the minimum daily trade volume and 1 represents the maximum, and then apply a 30-day rolling mean with the [window transform](./window.md) to smooth out the noise.

:::plot https://observablehq.com/@observablehq/plot-quantile-map-transform
```js
Plot.plot({
  marks: [
    Plot.ruleY([0, 1]),
    Plot.lineY(aapl, Plot.mapY("quantile", {x: "Date", y: "Volume", strokeOpacity: 0.2})),
    Plot.lineY(aapl, Plot.windowY(30, Plot.mapY("quantile", {x: "Date", y: "Volume"})))
  ]
})
```
:::

The [mapY transform](#mapY) above is shorthand for applying the given map method to all *y* channels. There’s also a less-common [mapX transform](#mapX) for *x* channels.

The more explicit [map](#map) transform lets you specify which channels to map, and what map method to use for each channel. Like the [group](./group.md) and [bin](./bin.md) transforms, it takes two arguments: an *outputs* object that describes the output channels to compute, and an *options* object that describes the input channels and additional options. So this:

```js
Plot.mapY("cumsum", {y: d3.randomNormal()})
```

Is shorthand for this:

```js
Plot.map({y: "cumsum"}, {y: d3.randomNormal()})
```

As a more practical example, we can use the map transform to construct [Bollinger bands](../marks/bollinger.md), showing both the price and volatility of Apple stock.

<p>
  <label class="label-input">
    <span>Window size (n):</span>
    <input type="range" v-model.number="n" min="1" max="100" step="1" />
    <span style="font-variant-numeric: tabular-nums;">{{n.toLocaleString("en-US")}}</span>
  </label>
  <label class="label-input">
    <span>Radius (k):</span>
    <input type="range" v-model.number="k" min="0" max="10" step="0.1" />
    <span style="font-variant-numeric: tabular-nums;">{{k.toLocaleString("en-US")}}</span>
  </label>
</p>

:::plot defer https://observablehq.com/@observablehq/plot-bollinger-band
```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.areaY(aapl, Plot.map({y1: Plot.bollinger({n, k: -k}), y2: Plot.bollinger({n, k})}, {x: "Date", y: "Close", fillOpacity: 0.2})),
    Plot.lineY(aapl, Plot.map({y: Plot.bollinger({n})}, {x: "Date", y: "Close", stroke: "blue"})),
    Plot.lineY(aapl, {x: "Date", y: "Close", strokeWidth: 1})
  ]
})
```
:::

The [bollinger map method](../marks/bollinger.md#bollinger) is implemented atop the [window map method](./window.md#window), computing the mean of values within the rolling window, and then offsetting the mean by a multiple of the rolling deviation.

The map transform is akin to running [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) on the input channel’s values with the given map method. However, the map transform is series-aware: the data are first grouped into series using the **z**, **fill**, or **stroke** channel in the same fashion as the [area](../marks/area.md) and [line](../marks/line.md) marks so that series are processed independently.

## Map options

The following map methods are supported:

* *cumsum* - a cumulative sum
* *rank* - the rank of each value in the sorted array
* *quantile* - the rank, normalized between 0 and 1
* a function to be passed an array of values, returning new values
* a function to be passed an index and array of channel values, returning new values
* an object that implements the *mapIndex* method

If a function is used, it must return an array of the same length as the given input. If a *mapIndex* method is used, it is repeatedly passed the index for each series (an array of integers), the corresponding input channel’s array of values, and the output channel’s array of values; it must populate the slots specified by the index in the output array.

## map(*outputs*, *options*) {#map}

```js
Plot.map({y: "cumsum"}, {y: d3.randomNormal()})
```

Groups on the first channel of **z**, **fill**, or **stroke**, if any, and then for each channel declared in the specified *outputs* object, applies the corresponding map method. Each channel in *outputs* must have a corresponding input channel in *options*.

## mapX(*map*, *options*) {#mapX}

```js
Plot.mapX("cumsum", {x: d3.randomNormal()})
```

Equivalent to Plot.map({x: *map*, x1: *map*, x2: *map*}, *options*), but ignores any of **x**, **x1**, and **x2** not present in *options*. In addition, if none of **x**, **x1**, or **x2** are specified, then **x** defaults to [identity](../features/transforms.md#identity).

## mapY(*map*, *options*) {#mapY}

```js
Plot.mapY("cumsum", {y: d3.randomNormal()})
```

Equivalent to Plot.map({y: *map*, y1: *map*, y2: *map*}, *options*), but ignores any of **y**, **y1**, and **y2** not present in *options*. In addition, if none of **y**, **y1**, or **y2** are specified, then **y** defaults to [identity](../features/transforms.md#identity).
