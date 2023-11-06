<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {computed, shallowRef, onMounted} from "vue";

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

# Difference mark <VersionBadge pr="1896" />

The **difference mark** puts a metric in context by comparing it to something. Like the [area mark](./area.md), the region between two lines is filled; unlike the area mark, alternating color shows when the metric is above or below the comparison value.

In the simplest case, the difference mark compares a metric to a constant. For example, the plot below shows the [global surface temperature anomaly](https://data.giss.nasa.gov/gistemp/) from 1880–2016; 0° represents the 1951–1980 average; above-average temperatures are in <span style="border-bottom: solid var(--vp-c-red) 3px;">red</span>, while below-average temperatures are in <span style="border-bottom: solid var(--vp-c-blue) 3px;">blue</span>. (It’s getting hotter.)

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

A 24-month [moving average](../transforms/window.md) improves readability by smoothing out the noise.

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

More powerfully, the difference mark compares two metrics. For example, the plot below shows the number of travelers per day through TSA checkpoints in 2020 compared to 2019. (This in effect compares a metric against itself, but as the data represents each year as a separate column, we can think of it as two separate metrics.) In the first two months of 2020, there were on average <span style="border-bottom: solid #01ab63 3px;">more travelers</span> per day than 2019; yet when COVID-19 hit, there were many <span style="border-bottom: solid #4269d0 3px;">fewer travelers</span> per day, dropping almost to zero.

:::plot
```js
Plot.plot({
  x: {tickFormat: "%b"},
  y: {grid: true, label: "Travelers"},
  marks: [
    Plot.axisY({label: "Travelers per day (thousands, 2020 vs. 2019)", tickFormat: (d) => d / 1000}),
    Plot.ruleY([0]),
    Plot.differenceY(tsa, {x: "Date", y1: "2019", y2: "2020", tip: {format: {x: "%B %-d"}}})
  ]
})
```
:::

If the data is “tall” rather than “wide” — that is, if the two metrics we wish to compare are represented by separate *rows* rather than separate *columns* — we can use the [group transform](../transforms/group.md) with the [find reducer](../transforms/group.md#find): group the rows by **x** (date), then find the desired **y1** and **y2** for each group. The plot below shows daily minimum temperature for San Francisco compared to San Jose. Notice how the insulating fog keeps San Francisco <span style="border-bottom: solid #01ab63 3px;">warmer</span> in winter and <span style="border-bottom: solid #4269d0 3px;">cooler</span> in summer, reducing seasonal variation.

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

The difference mark can also be used to compare a metric to itself using the [shift transform](../transforms/shift.md). The chart below shows year-over-year growth in the price of Apple stock.

:::plot
```js
Plot.differenceY(aapl, Plot.shiftX("+1 year", {x: "Date", y: "Close"})).plot({y: {grid: true}})
```
:::

For most of the covered time period, you would have <span style="border-bottom: solid #01ab63 3px;">made a profit</span> by holding Apple stock for a year; however, if you bought in 2015 and sold in 2016, you would likely have <span style="border-bottom: solid #4269d0 3px;">lost money</span>.

## Difference options

The following channels are required:

* **x2** - the horizontal position of the metric; bound to the *x* scale
* **y2** - the vertical position of the metric; bound to the *y* scale

In addition to the [standard mark options](../features/marks.md#mark-options), the following optional channels are supported:

* **x1** - the horizontal position of the comparison; bound to the *x* scale
* **y1** - the vertical position of the comparison; bound to the *y* scale

If **x1** is not specified, it defaults to **x2**. If **y1** is not specified, it defaults to **y2** — TODO that’s not right, because **y1** defaults to zero for differenceY. These defaults facilitate sharing *x* or *y* coordinates between the metric and its comparison.

TODO

* **fill**
* **positiveFill**
* **negativeFill**
* **fillOpacity**
* **positiveFillOpacity**
* **negativeFillOpacity**
* **stroke**
* **strokeOpacity**

TODO

* **z**
* **clip**

## differenceY(*data*, *options*) {#differenceY}

```js
Plot.differenceY(gistemp, {x: "Date", y: "Anomaly"})
```

TODO
