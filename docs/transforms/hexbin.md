<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {computed, ref, watchEffect, shallowRef, onMounted} from "vue";
import {useDark} from "../components/useDark.js";
import cars from "../data/cars.ts";

const binWidth = ref(20);
const dark = useDark();
const olympians = shallowRef([{weight: 31, height: 1.21, sex: "female"}, {weight: 170, height: 2.21, sex: "male"}]);

onMounted(() => {
  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
});

</script>

# Hexbin transform

The **hexbin transform** groups two-dimensional quantitative or temporal data—continuous measurements such as heights, weights, or temperatures—into discrete hexagonal bins. You can then compute summary statistics for each bin, such as a count, sum, or proportion. The hexbin transform is most often used to make heatmaps with the [dot mark](../marks/dot.md).

For example, the heatmap below shows the weights and heights of Olympic athletes. The color of each hexagon represents the number (*count*) of athletes with similar weight and height.

:::plot defer
```js-vue
Plot
  .dot(olympians, Plot.hexbin({fill: "count"}, {x: "weight", y: "height"}))
  .plot({color: {scheme: "{{dark ? "turbo" : "YlGnBu"}}"}})
```
:::

Whereas the [bin transform](./bin.md) produces rectangular bins and operates on abstract data, the hexbin transform produces hexagonal bins and operates in “screen space” (_i.e._, pixel coordinates) after the *x* and *y* scales have been applied to the data. And whereas the bin transform produces **x1**, **y1**, **x2**, **y2** representing rectangular extents, the hexbin transform produces **x** and **y** representing hexagon centers.

To produce an areal encoding as in a bubble map, output **r**. In this case, the default range of the *r* scale is set such that the hexagons do not overlap. The **binWidth** option, which defaults to 20, specifies the distance between centers of neighboring hexagons in pixels.

<p>
  <label class="label-input">
    Bin width:
    <input type="range" v-model.number="binWidth" min="0" max="40" step="0.1">
    <span style="font-variant-numeric: tabular-nums;">{{binWidth.toLocaleString("en-US", {minimumFractionDigits: 1})}}</span>
  </label>
</p>

:::plot defer
```js
Plot
  .dot(olympians, Plot.hexbin({r: "count"}, {x: "weight", y: "height", binWidth}))
  .plot()
```
:::

If desired, you can output both **fill** and **r** for a redundant encoding.

:::plot defer
```js-vue
Plot
  .dot(olympians, Plot.hexbin({fill: "count", r: "count"}, {x: "weight", y: "height", stroke: "currentColor"}))
  .plot({color: {scheme: "{{dark ? "turbo" : "YlGnBu"}}"}})
```
:::

:::tip
Setting a **stroke** ensures that the smallest hexagons are visible.
:::

Alternatively, the **fill** and **r** channels can encode independent (or “bivariate”) dimensions of data. Below, the **r** channel uses *count* as before, while the **fill** channel uses *mode* to show the most frequent sex of athletes in each hexagon. The larger athletes are more likely to be <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[1]}`}">male</span>, while the smaller athletes are more likely to be <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[0]}`}">female</span>.

:::plot defer
```js
Plot
  .dot(olympians, Plot.hexbin({fill: "mode", r: "count"}, {x: "weight", y: "height", fill: "sex"}))
  .plot()
```
:::

Using **z**, the hexbin transform will partition hexagons by ordinal value. If **z** is not specified, it defaults to **fill** (if there is no **fill** output channel) or **stroke** (if there is no **stroke** output channel). Setting **z** to *sex* in the chart above, and switching to **stroke** instead of **fill**, produces separate overlapping hexagons for each sex.

:::plot defer
```js
Plot
  .dot(olympians, Plot.hexbin({stroke: "mode", r: "count"}, {x: "weight", y: "height", z: "sex", stroke: "sex"}))
  .plot()
```
:::

The hexbin transform can be paired with any mark that supports **x** and **y** channels (which is almost all of them). The [text mark](../marks/text.md) is useful for labelling. By setting the **text** output channel, you can derive the text from the binned contents.

:::plot defer
```js
Plot
  .text(olympians, Plot.hexbin({text: "count"}, {x: "weight", y: "height"}))
  .plot()
```
:::

The [hexgrid mark](../marks/hexgrid.md) draws the base hexagonal grid as a mesh. This is useful for showing the empty hexagons, since the hexbin transform does not output empty bins (and unlike the bin transform, the hexbin transform does not currently support the **filter** option).

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.hexgrid(),
    Plot.dot(olympians, Plot.hexbin({r: "count"}, {x: "weight", y: "height", fill: "currentColor"}))
  ]
})
```
:::

The hexbin transform defaults the **symbol** option to *hexagon*, but you can override it. The [circle constructor](../marks/dot.md#circle-data-options) changes it to *circle*.

:::plot defer
```js
Plot.circle(olympians, Plot.hexbin({r: "count"}, {x: "weight", y: "height"})).plot()
```
:::

Hexbins work best when there is an interesting density of dots in the center of the chart, but sometimes hexagons “escape” the edge of the frame and cover the axes. To prevent this, you can use the **inset** [scale option](../features/scales.md) to reserve space on the edges of the frame.


:::plot defer
```js-vue
Plot
  .dot(olympians, Plot.hexbin({fill: "count"}, {x: "weight", y: "height"}))
  .plot({inset: 10, color: {scheme: "{{dark ? "turbo" : "YlGnBu"}}"}})
```
:::

:::tip
You can also set the dot’s **clip** option to true to prevent the hexagons from escaping.
:::

Alternatively, use the [axis mark](../marks/axis.md) to draw axes on top of the hexagons.

:::plot defer
```js-vue
Plot.plot({
  color: {scheme: "{{dark ? "turbo" : "YlGnBu"}}"},
  marks: [
    Plot.dot(olympians, Plot.hexbin({fill: "count"}, {x: "weight", y: "height"})),
    Plot.axisX(),
    Plot.axisY()
  ]
})
```
:::

## Hexbin options

The *options* must specify the **x** and **y** channels. The **binWidth** option (default 20) defines the distance between centers of neighboring hexagons in pixels. If any of **z**, **fill**, or **stroke** is a channel, the first of these channels will be used to subdivide bins.

The *outputs* options are similar to the [bin transform](./bin.md); each output channel receives as input, for each hexagon, the subset of the data which has been matched to its center. The outputs object specifies the aggregation method for each output channel.

The following aggregation methods are supported:

* *first* - the first value, in input order
* *last* - the last value, in input order
* *count* - the number of elements (frequency)
* *distinct* - the number of distinct values
* *sum* - the sum of values
* *proportion* - the sum proportional to the overall total (weighted frequency)
* *proportion-facet* - the sum proportional to the facet total
* *min* - the minimum value
* *min-index* - the zero-based index of the minimum value
* *max* - the maximum value
* *max-index* - the zero-based index of the maximum value
* *mean* - the mean value (average)
* *median* - the median value
* *deviation* - the [standard deviation](https://github.com/d3/d3-array/blob/master/README.md#deviation)
* *variance* - the variance per [Welford’s algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
* *mode* - the value with the most occurrences
* *identity* - the array of values
* a function to be passed the array of values for each bin and the extent of the bin
* an object with a *reduceIndex* method

## hexbin(*outputs*, *options*)

```js
Plot.dot(olympians, Plot.hexbin({fill: "count"}, {x: "weight", y: "height"}))
```

Bins (hexagonally) on **x** and **y**. Also groups on the first channel of **z**, **fill**, or **stroke**, if any.
