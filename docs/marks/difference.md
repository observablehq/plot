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

# Difference mark <VersionBadge version="0.6.12" pr="1896" />

The **difference mark** puts a metric in context by comparing it. Like the [area mark](./area.md), the region between two lines is filled; unlike the area mark, alternating color shows when the metric is above or below the comparison value.

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

More powerfully, the difference mark compares two metrics. For example, the plot below shows the number of travelers per day through TSA checkpoints in 2020 compared to 2019. (This in effect compares a metric against itself, but as the data represents each year as a separate column, it is equivalent to two metrics.) In the first two months of 2020, there were on average <span style="border-bottom: solid #01ab63 3px;">more travelers</span> per day than 2019; yet when COVID-19 hit, there were many <span style="border-bottom: solid #4269d0 3px;">fewer travelers</span> per day, dropping almost to zero.

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

If **x1** is not specified, it defaults to **x2**. If **y1** is not specified, it defaults to 0 if **x1** and **x2** are equal, and to **y2** otherwise. These defaults facilitate sharing *x* or *y* coordinates between the metric and its comparison.

The standard **fill** option is ignored; instead, there are separate channels based on the sign of the difference:

* **positiveFill** - the color for when the metric is greater, defaults to <span style="border-bottom:solid #01ab63 3px;">green</span>
* **negativeFill** - the color for when the comparison is greater, defaults to <span style="border-bottom:solid #4269d0 3px;">blue</span>
* **fillOpacity** - the areas’ opacity, defaults to 1
* **positiveFillOpacity** - the positive area’s opacity, defaults to *opacity*
* **negativeFillOpacity** - the negative area’s opacity, defaults to *opacity*
* **stroke** - the metric line’s stroke color, defaults to currentColor
* **strokeOpacity** - the metric line’s opacity, defaults to 1

These options are passed to the underlying area and line marks; in particular, when they are defined as a channel, the underlying marks are broken into contiguous overlapping segments when the values change. When any of these channels are used, setting an explicit **z** channel (possibly to null) is strongly recommended.

## differenceY(*data*, *options*) {#differenceY}

```js
Plot.differenceY(gistemp, {x: "Date", y: "Anomaly"})
```

Returns a new difference with the given *data* and *options*. The mark is a composite of a positive area, negative area, and line. The positive area extends from the bottom of the frame to the line, and is clipped by the area extending from the comparison to the top of the frame. The negative area conversely extends from the top of the frame to the line, and is clipped by the area extending from the comparison to the bottom of the frame.
