<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {computed, ref, shallowRef, onMounted} from "vue";

const shift = ref(365);
const aapl = shallowRef([]);
const gistemp = shallowRef([]);
const tsa = shallowRef([{Date: new Date("2020-01-01")}]);
const temperature = shallowRef([{date: new Date("2020-01-01")}]);

onMounted(() => {
  d3.csv("../data/aapl.csv", d3.autoType).then((data) => (aapl.value = data));
  d3.csv("../data/gistemp.csv", d3.autoType).then((data) => (gistemp.value = data));
  d3.csv("../data/tsa.csv",d3.autoType).then((data) => (tsa.value = data));
  d3.csv("../data/sf-sj-temperatures.csv", d3.autoType).then((data) => (temperature.value = data.filter((d) => d.date.getUTCFullYear() === 2020)));
});

</script>

# Difference mark

The **difference mark** compares a metric. Like the [area mark](./area.md), the region between two lines is filled; unlike the area mark, alternating color shows when the primary metric is above or below the secondary metric.

In the simplest case, the difference mark compares a metric to a constant, often zero. For example, the plot below shows the [global surface temperature anomaly](https://data.giss.nasa.gov/gistemp/) from 1880–2016; 0° represents the 1951–1980 average; above-average temperatures are in <span style="border-bottom: solid var(--vp-c-red) 3px;">red</span>, while below-average temperatures are in <span style="border-bottom: solid var(--vp-c-blue) 3px;">blue</span>. (It’s getting hotter.)

:::plot
```js
Plot.differenceY(gistemp, {
  x: "Date",
  y: "Anomaly",
  positiveFill: "red",
  negativeFill: "blue",
  tip: true
}).plot({y: {grid: true}})
```
:::

Applying a 24-month [moving average](../transforms/window.md) improves readability by smoothing the noise.

:::plot
```js
Plot.differenceY(
  gistemp,
  Plot.windowY(12 * 2, {
    x: "Date",
    y: "Anomaly",
    positiveFill: "red",
    negativeFill: "blue",
    tip: true
  })
).plot({y: {grid: true}})
```
:::

More powerfully, the difference mark compares two metrics.

Comparing metrics is most convenient when the data has a column for each. For example, the plot below shows the number of daily travelers through TSA checkpoints in 2020 compared to 2019. In the first two months of 2020, there were on average <span style="border-bottom: solid #01ab63 3px;">more travelers</span> per day than 2019; yet when COVID-19 hit, there were many <span style="border-bottom: solid #4269d0 3px;">fewer travelers</span> per day, dropping almost to zero.

:::plot
```js
Plot.plot({
  x: {tickFormat: "%b"},
  y: {grid: true, label: "Travelers"},
  marks: [
    Plot.axisY({label: "Daily travelers (thousands, 2020 vs. 2019)", tickFormat: (d) => d / 1000}),
    Plot.ruleY([0]),
    Plot.differenceY(tsa, {x: "Date", y1: "2019", y2: "2020", tip: {format: {x: "%B %-d"}}})
  ]
})
```
:::

If the data is “tall” rather than “wide” — TK explain what this means — you can use the [group transform](../transforms/group.md) with the [find reducer](../transforms/group.md#find): group the rows by date, and then for the two output columns **y1** and **y2**, find the desired corresponding row. The plot below shows daily minimum temperature for San Francisco compared to San Jose. The insulating effect of the fog keeps San Francisco warmer in winter and cooler in summer, reducing seasonal variation.

:::plot
```js
Plot.plot({
  x: {tickFormat: "%b"},
  y: {grid: true},
  marks: [
    Plot.ruleY([32]),
    Plot.differenceY(
      temperature,
      Plot.windowY(
        14,
        Plot.groupX(
          {
            y1: Plot.find((d) => d.station === "SJ"),
            y2: Plot.find((d) => d.station === "SF")
          },
          {
            x: "date",
            y: "tmin",
            tip: true
          }
        )
      )
    )
  ]
})
```
:::

The difference mark can also be used to compare a metric *to itself* using the [shift transform](../transforms/shift.md). This is especially useful for time series that exhibit [periodicity](https://en.wikipedia.org/wiki/Seasonality) — which is most of them, and certainly ones that involve human behavior. In this way a difference mark can show week-over-week or year-over-year growth.

<p>
  <label class="label-input" style="display: flex;">
    <span style="display: inline-block; width: 7em;">Shift:</span>
    <input type="range" v-model.number="shift" min="0" max="1000" step="1">
    <span style="font-variant-numeric: tabular-nums;">{{shift}}</span>
  </label>
</p>

:::plot
```js
Plot.differenceY(aapl, Plot.shiftX(`${shift} days`, {x: "Date", y: "Close"})).plot({y: {grid: true}})
```
:::

TK Something about if you sold Apple stock after holding it for a year, you’d tend to do pretty well. But if you hold it for less time, you see more blue. And even if you held it for a year, you could have still lost money if you sold in most of 2016. Even the unluckiest person would have made money if they held Apple stock for 780+ days (in 2015–2018).

## Difference options

TK

## differenceY(*data*, *options*) {#differenceY}

```js
Plot.differenceY(gistemp, {x: "Date", y: "Anomaly"})
```

TK
