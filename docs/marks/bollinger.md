<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref} from "vue";
import aapl from "../data/aapl.ts";

const n = ref(20);
const k = ref(2);

</script>

# Bollinger mark <VersionBadge version="0.6.10" pr="1772" />

The **bollinger mark** is a [composite mark](../features/marks.md#marks) consisting of a [line](./line.md) representing a moving average and an [area](./area.md) representing volatility as a band; the band thickness is proportional to the deviation of nearby values. The bollinger mark is often used to analyze the price of financial instruments such as stocks.

For example, the chart below shows the price of Apple stock from 2013 to 2018, with a window size *n* of {{n}} days and radius *k* of {{k}} standard deviations.

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

:::plot hidden
```js
Plot.bollingerY(aapl, {x: "Date", y: "Close", n, k}).plot()
```
:::

```js-vue
Plot.bollingerY(aapl, {x: "Date", y: "Close", n: {{n}}, k: {{k}}}).plot()
```

For more control, you can also use the [bollinger map method](#bollinger) directly with the [map transform](../transforms/map.md).

:::plot
```js
Plot.plot({
  marks: [
    Plot.lineY(aapl, Plot.mapY(Plot.bollinger({n: 20, k: -2}), {x: "Date", y: "Close", stroke: "red"})),
    Plot.lineY(aapl, Plot.mapY(Plot.bollinger({n: 20, k: 2}), {x: "Date", y: "Close", stroke: "green"})),
    Plot.lineY(aapl, {x: "Date", y: "Close"})
  ]
})
```
:::

Below a candlestick chart is constructed from two [rule marks](./rule.md), with a bollinger mark underneath to emphasize the days when the stock was more volatile.

:::plot
```js
Plot.plot({
  x: {domain: [new Date("2014-01-01"), new Date("2014-06-01")]},
  y: {domain: [68, 92], grid: true},
  color: {domain: [-1, 0, 1], range: ["red", "black", "green"]},
  marks: [
    Plot.bollingerY(aapl, {x: "Date", y: "Close", stroke: "none", clip: true}),
    Plot.ruleX(aapl, {x: "Date", y1: "Low", y2: "High", strokeWidth: 1, clip: true}),
    Plot.ruleX(aapl, {x: "Date", y1: "Open", y2: "Close", strokeWidth: 3, stroke: (d) => Math.sign(d.Close - d.Open), clip: true})
  ]
})
```
:::

The bollinger mark has two constructors: the common [bollingerY](#bollingerY) for when time goes right→ (or ←left); and the rare [bollingerX](#bollingerX) for when time goes up↑ (or down↓).

:::plot
```js
Plot.bollingerX(aapl, {y: "Date", x: "Close"}).plot()
```
:::

As [shorthand](../features/shorthand.md), you can pass an array of numbers as data. Below, the *x* axis represents the zero-based index into the data (*i.e.*, trading days since May 13, 2013).

:::plot
```js
Plot.bollingerY(aapl.map((d) => d.Close)).plot()
```
:::

## Bollinger options

The bollinger mark is a [composite mark](../features/marks.md#marks) consisting of two marks:

* an [area](../marks/area.md) representing volatility as a band, and
* a [line](../marks/line.md) representing a moving average

The bollinger mark supports the following special options:

* **n** - the window size (the window transform’s **k** option), an integer; defaults to 20
* **k** - the band radius, a number representing a multiple of standard deviations; defaults to 2
* **color** - the fill color of the area, and the stroke color of the line; defaults to *currentColor*
* **opacity** - the fill opacity of the area; defaults to 0.2
* **fill** - the fill color of the area; defaults to **color**
* **fillOpacity** - the fill opacity of the area; defaults to **opacity**
* **stroke** - the stroke color of the line; defaults to **color**
* **strokeOpacity** - the stroke opacity of the line; defaults to 1
* **strokeWidth** - the stroke width of the line in pixels; defaults to 1.5

Any additional options are passed through to the underlying [line mark](./line.md), [area mark](./area.md), and [window transform](../transforms/window.md). Unlike the window transform, the **strict** option defaults to true, and the **anchor** option defaults to *end* (which assumes that the data is in chronological order).

## bollingerX(*data*, *options*) {#bollingerX}

```js
Plot.bollingerX(aapl, {y: "Date", x: "Close"})
```

Returns a bollinger mark for when time goes up↑ (or down↓). If the **x** option is not specified, it defaults to the identity function, as when *data* is an array of numbers [*x₀*, *x₁*, *x₂*, …]. If the **y** option is not specified, it defaults to [0, 1, 2, …].

## bollingerY(*data*, *options*) {#bollingerY}

```js
Plot.bollingerY(aapl, {x: "Date", y: "Close"})
```

Returns a bollinger mark for when time goes right→ (or ←left). If the **y** option is not specified, it defaults to the identity function, as when *data* is an array of numbers [*y₀*, *y₁*, *y₂*, …]. If the **x** option is not specified, it defaults to [0, 1, 2, …].

## bollinger(*options*) {#bollinger}

```js
Plot.lineY(data, Plot.map({y: Plot.bollinger({n: 20})}, {x: "Date", y: "Close"}))
```

Returns a bollinger map method for use with the [map transform](../transforms/map.md). The **k** option here defaults to zero instead of two.
