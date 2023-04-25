<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref} from "vue";
import aapl from "../data/aapl.ts";

const N = ref(20);
const K = ref(2);

function bollingerBandY(N, K, options) {
  return Plot.map({y1: bollinger(N, -K), y2: bollinger(N, K)}, options);
}

function bollinger(N, K) {
  return Plot.window({k: N, reduce: (Y) => d3.mean(Y) + K * d3.deviation(Y), strict: true, anchor: "end"});
}

</script>

# Map transform

The **map transform** groups data into series and then transforms each series’ values, say to normalize them relative to some basis or to apply a moving average. For example, below the map transform computes a cumulative sum (*cumsum*) of a series of random numbers sampled from a normal distribution—in other words, a random walk.

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

The [mapY transform](#map-ymap-options) above is shorthand for applying the given map method to all *y* channels. There’s also a less-common [mapX transform](#mapx-map-options) for *x* channels.

The more explicit [map](#map-outputs-options) transform lets you specify which channels to map, and what map method to use for each channel. Like the [group](./group.md) and [bin](./bin.md) transforms, it takes two arguments: an *outputs* object that describes the output channels to compute, and an *options* object that describes the input channels and additional options. So this:

```js
Plot.mapY("cumsum", {y: d3.randomNormal()})
```

Is shorthand for this:

```js
Plot.map({y: "cumsum"}, {y: d3.randomNormal()})
```

As a more practical example, we can use the map transform to construct [Bollinger bands](https://en.wikipedia.org/wiki/Bollinger_Bands), showing both the price and volatility of Apple stock.

<p>
  <label class="label-input">
    <span>Periods (N):</span>
    <input type="range" v-model.number="N" min="2" max="100" step="1">
    <span style="font-variant-numeric: tabular-nums;">{{N.toLocaleString("en-US")}}</span>
  </label>
  <label class="label-input">
    <span>Deviations (K):</span>
    <input type="range" v-model.number="K" min="0" max="10" step="0.1">
    <span style="font-variant-numeric: tabular-nums;">{{K.toLocaleString("en-US", {minimumFractionDigits: 1})}}</span>
  </label>
</p>

:::plot defer https://observablehq.com/@observablehq/plot-bollinger-band
```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.areaY(aapl, Plot.map({y1: bollinger(N, -K), y2: bollinger(N, K)}, {x: "Date", y: "Close", fillOpacity: 0.2})),
    Plot.lineY(aapl, Plot.map({y: bollinger(N, 0)}, {x: "Date", y: "Close", stroke: "blue"})),
    Plot.lineY(aapl, {x: "Date", y: "Close", strokeWidth: 1})
  ]
})
```
:::

```js
function bollinger(N, K) {
  return Plot.window({
    k: N,
    reduce: (V) => d3.mean(V) + K * d3.deviation(V),
    strict: true,
    anchor: "end"
  });
}
```

The `bollinger` map method above is implemented atop the [window transform](./window.md), computing the mean of values within the rolling window, and then offsetting the mean by a multiple of the rolling deviation.

The map transform is akin to running [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) on the input channel’s values with the given map method. However, the map transform is series-aware: the data are first grouped into series using the **z**, **fill**, or **stroke** channel in the same fashion as the [area](../marks/area.md) and [line](../marks/line.md) marks so that series are processed independently.

## Map options

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

Groups on the first channel of **z**, **fill**, or **stroke**, if any, and then for each channel declared in the specified *outputs* object, applies the corresponding map method. Each channel in *outputs* must have a corresponding input channel in *options*.

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
