<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref, shallowRef, onMounted} from "vue";
import sftemp from "../data/sf-temperatures.ts";

const k = ref(7);
const loss = ref(0.01);
const anchor = ref("end");
const strict = ref(true);
const reduce = ref("mean");
const bls = shallowRef([]);

onMounted(() => {
  d3.csv("../data/bls-metro-unemployment.csv", d3.autoType).then((data) => (bls.value = data));
});

</script>

# Window transform

The **window transform** is a specialized [map transform](./map.md) that computes a moving window and then derives summary statistics from the current window, say to compute rolling averages, rolling minimums, or rolling maximums.

For example, the band chart below shows the daily high and low temperature in San Francisco. The <span style="border-bottom: solid 2px var(--vp-c-red)">red</span> line represents the {{k}}-day average high, and the <span style="border-bottom: solid 2px var(--vp-c-blue)">blue</span> line the {{k}}-day average low.

<p>
  <label class="label-input">
    <span>Window size (k):</span>
    <input type="range" v-model.number="k" min="1" max="100" step="1" />
    <span style="font-variant-numeric: tabular-nums;">{{k.toLocaleString("en-US")}}</span>
  </label>
</p>

:::plot
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Temperature (°F)"
  },
  marks: [
    Plot.areaY(sftemp, {x: "date", y1: "low", y2: "high", fillOpacity: 0.3}),
    Plot.lineY(sftemp, Plot.windowY(k, {x: "date", y: "low", stroke: "blue"})),
    Plot.lineY(sftemp, Plot.windowY(k, {x: "date", y: "high", stroke: "red"}))
  ]
})
```
:::

The **k** option specifies the window size: the number of consecutive elements in the rolling window. A larger window for the rolling mean above produces a smoother curve.

The **anchor** specifies how to align the rolling window with the data. If *middle* (the default), the window is centered around the current data point; for time-series data, this means the window will incorporate values from the future as well as the past. Setting **anchor** to *end* will compute a trailing moving average.

<p>
  <span class="label-input">
    Anchor:
    <label style="margin-left: 0.5em;">
      <input type="radio" name="anchor" value="start" v-model="anchor" /> start
    </label>
    <label style="margin-left: 0.5em;">
      <input type="radio" name="anchor" value="middle" v-model="anchor" /> middle
    </label>
    <label style="margin-left: 0.5em;">
      <input type="radio" name="anchor" value="end" v-model="anchor" /> end
    </label>
  </span>
</p>

:::plot
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Temperature (°F)"
  },
  marks: [
    Plot.lineY(sftemp, {x: "date", y: "high", strokeOpacity: 0.3}),
    Plot.lineY(sftemp, Plot.windowY({k: 28, anchor}, {x: "date", y: "high"}))
  ]
})
```
:::

The window transform uses input order, not natural order by value, to determine the meaning of *start* and *end*. When the data is in reverse chronological order, the meaning of *start* and *end* is effectively reversed because the first data point is the most recent. Use a [sort transform](./sort.md) to change the order as needed.

If **strict** is false (the default), the window size is effectively reduced at the start or end of each series or both, depending on the **anchor**. Values computed with a truncated window may be noisy; if you would prefer to not show this data instead, set the **strict** option to true.

<p>
  <label class="label-input">
    Strict:
    <input type="checkbox" v-model="strict" />
  </label>
</p>

:::plot
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Temperature (°F)"
  },
  marks: [
    Plot.lineY(sftemp, {x: "date", y: "low", strokeOpacity: 0.3}),
    Plot.lineY(sftemp, Plot.windowY({k: 28, anchor: "end", strict}, {x: "date", y: "low"}))
  ]
})
```
:::

The **strict** option can also have a dramatic effect if some data is missing: when strict, the reducer will be skipped if any of the values in the current window are null, undefined, or NaN.

The **reduce** option specifies how to compute the output value for the current window. It defaults to *mean* for a rolling average. Below, the rolling <span style="border-bottom: solid 2px var(--vp-c-blue)">minimum</span>, <span style="border-bottom: solid 2px var(--vp-c-red)">maximum</span>, and <span style="border-bottom: solid 2px;">median</span> are shown. The window transform supports most of the same reducers as [bin](./bin.md) and [group](./group.md), and you can implement a custom reducer as a function if needed.

:::plot
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Temperature (°F)"
  },
  marks: [
    Plot.lineY(sftemp, {x: "date", y: "low", strokeOpacity: 0.3}),
    Plot.lineY(sftemp, Plot.windowY({k: 28, reduce: "min"}, {x: "date", y: "low", stroke: "blue"})),
    Plot.lineY(sftemp, Plot.windowY({k: 28, reduce: "max"}, {x: "date", y: "low", stroke: "red"})),
    Plot.lineY(sftemp, Plot.windowY({k: 28, reduce: "median"}, {x: "date", y: "low"}))
  ]
})
```
:::

While the windowY transform derives **y** (and **y1** and **y2**), and the windowX transform likewise derives **x**, **x1**, and **x2**, you can use the [map transform](./map.md) directly for other channels. For example, the chart below uses a variable **stroke** to encode slope: the monthly change in unemployment rate for each metropolitan division. The slope is computed with a window of size 2 and the *difference* reducer.

:::plot defer
```js
Plot.plot({
  y: {grid: true},
  color: {scheme: "BuYlRd", domain: [-0.5, 0.5]},
  marks: [
    Plot.ruleY([0]),
    Plot.lineY(
      bls,
      Plot.map(
        {stroke: Plot.window({k: 2, reduce: "difference"})},
        {x: "date", y: "unemployment", z: "division", stroke: "unemployment"}
      )
    ),
  ]
})
```
:::

As shown above, the window transform also understands the **z** channel: each metropolitan division is treated as a separate series.

## Window options

The window transform supports the following options:

* **k** - the window size (the number of elements in the window)
* **anchor** - how to align the window: *start*, *middle* (default), or *end*
* **reduce** - the window reducer; defaults to *mean*
* **strict** - if true, output undefined if any window value is undefined; defaults to false

If the **strict** option is false (the default), the window will be automatically truncated as needed, and undefined input values are ignored. For example, if **k** is 24 and **anchor** is *middle*, then the initial 11 values have effective window sizes of 13, 14, 15, … 23, and likewise the last 12 values have effective window sizes of 23, 22, 21, … 12. Values computed with a truncated window may be noisy; if you would prefer to not show this data, set the **strict** option to true.

If the **strict** option is true, the output start values or end values or both (depending on the **anchor**) of each series may be undefined since there are not enough elements to create a window of size **k**; output values may also be undefined if some of the input values in the corresponding window are undefined.

The following named reducers are supported:

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

A reducer may also be specified as a function to be passed an array of **k** values.

## window(*k*)

```js
Plot.map({y: Plot.window(24)}, {x: "Date", y: "Close", stroke: "Symbol"})
```

Returns a window map method for the given window size *k*, suitable for use with Plot.map. For additional options to the window transform, replace the number *k* with an object with properties *k*, *anchor*, *reduce*, or *strict*.

## windowX(*k*, *options*)

```js
Plot.windowX(24, {y: "Date", x: "Anomaly"})
```

Like [Plot.mapX](#plotmapxmap-options), but applies the window map method with the given window size *k*. For additional options to the window transform, replace the number *k* with an object with properties *k*, *anchor*, or *reduce*.

## windowY(*k*, *options*)

```js
Plot.windowY(24, {x: "Date", y: "Anomaly"})
```

Like [Plot.mapY](#plotmapymap-options), but applies the window map method with the given window size *k*. For additional options to the window transform, replace the number *k* with an object with properties *k*, *anchor*, or *reduce*.
