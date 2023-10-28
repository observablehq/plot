<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref, shallowRef, onMounted} from "vue";

const shift = ref(0);
const aapl = shallowRef([]);
const goog = shallowRef([]);

onMounted(() => {
  d3.csv("../data/aapl.csv", d3.autoType).then((data) => (aapl.value = data));
  d3.csv("../data/goog.csv", d3.autoType).then((data) => (goog.value = data));
});

const offset = (date) => d3.utcDay.offset(date, shift.value);

</script>

# Difference mark

The **difference mark** compares a primary metric to a secondary metric.

:::plot
```js
Plot.plot({
  y: {grid: true},
  marks: [
    Plot.ruleY([1]),
    Plot.differenceY(aapl, Plot.normalizeY({
      x: "Date",
      y1: "Close",
      y2: Plot.valueof(goog, "Close"),
      tip: true
    }))
  ]
})
```
:::

:::plot
```js
Plot.plot({
  y: {grid: true},
  marks: [
    Plot.differenceY(aapl, {
      x1: "Date",
      x2: (d) => d3.utcYear.offset(d.Date),
      y: "Close",
      tip: true
    })
  ]
})
```
:::

<p>
  <label class="label-input" style="display: flex;">
    <span style="display: inline-block; width: 7em;">Shift:</span>
    <input type="range" v-model.number="shift" min="0" max="1000" step="1">
    <span style="font-variant-numeric: tabular-nums;">{{shift}}</span>
  </label>
</p>

:::plot
```js
Plot.plot({
  x: {label: "Date"},
  y: {grid: true},
  marks: [
    Plot.differenceY(aapl, {
      x1: (d, i, data) => d.Date < offset(data[0].Date) ? null : d.Date,
      x2: (d, i, data) => data.at(-1).Date < offset(d.Date) ? null : offset(d.Date),
      y: "Close"
    })
  ]
})
```
:::

:::plot
```js
Plot.plot({
  x: {label: "Date"},
  y: {grid: true},
  marks: [
    Plot.differenceY(aapl, {
      x: (d, i) => i < shift ? null : d.Date,
      y1: "Close",
      y2: (d, i) => aapl[i - shift]?.Close,
      tip: true
    })
  ]
})
```
:::

## Difference options

TK

## differenceY(*data*, *options*) {#differenceY}

```js
Plot.differenceY(gistemp, {x: "Date", y: "Anomaly"})
```

TK
