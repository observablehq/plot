<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref} from "vue";
import aapl from "../data/aapl.ts";

const n = ref(20);
const k = ref(2);

</script>

# Bollinger mark

The **bollinger mark** is a [composite mark](../features/marks.md#marks) consisting of a [line](./line.md) representing a moving average, and an [area](./area.md) representing volatility as a band; the band thickness is proportional to the deviation of nearby values. The bollinger mark is often used to analyze the price of financial instruments such as stocks.

For example, the chart below shows the price of Apple stock from 2013–2018, with window size *n* of {{n}} days and radius *k* of {{k}} standard deviations.

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
    Plot.lineY(aapl, Plot.mapY(Plot.bollinger(20, -2), {x: "Date", y: "Close", stroke: "red"})),
    Plot.lineY(aapl, Plot.mapY(Plot.bollinger(20, 2), {x: "Date", y: "Close", stroke: "green"})),
    Plot.lineY(aapl, Plot.mapY(Plot.bollinger(20, 0), {x: "Date", y: "Close"}))
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

In addition to the standard mark options which are passed through to the underlying area and line, the bollinger mark supports the following options:

* **n** - the window size (corresponding to the window transform’s **k** option), an integer
* **k** - the band radius, a number representing a multiple of standard deviations
* **color** - the fill color of the area, and the stroke color of the line; defaults to *currentColor*
* **opacity** - the fill opacity of the area; defaults to 0.2
* **fill** - the fill color of the area; defaults to **color**
* **fillOpacity** - the fill opacity of the area; defaults to **paocity**
* **stroke** - the stroke color of the line; defaults to **color**
* **strokeOpacity** - the stroke opacity of the line; defaults to 1
* **strokeWidth** - the stroke width of the line in pixels; defaults to 1.5

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

TODO Describe the **interval** option inherited from line/area.

## bollinger(*n*, *k*) {#bollinger}

```js
Plot.lineY(data, Plot.map({y: Plot.bollinger(20, 0)}, {x: "Date", y: "Close"}))
```

Returns a bollinger map method for use with the [map transform](../transforms/map.md).
