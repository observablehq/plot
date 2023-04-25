<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, ref, shallowRef, onMounted} from "vue";
import {useDark} from "../components/useDark.js";
import faithful from "../data/faithful.ts";
import penguins from "../data/penguins.ts";

const walmarts = shallowRef([]);
const us = shallowRef(null);
const nation = computed(() => us.value ? topojson.feature(us.value, us.value.objects.nation) : {type: null});
const statemesh = computed(() => us.value ? topojson.mesh(us.value, us.value.objects.states, (a, b) => a !== b) : {type: null});
const dark = useDark();
const skew = ref(0);
const bandwidth = ref(20);
const thresholds = ref(20);
const diamonds = shallowRef([]);

onMounted(() => {
  d3.csv("../data/diamonds.csv", d3.autoType).then((data) => (diamonds.value = data));
  d3.tsv("../data/walmarts.tsv", d3.autoType).then((data) => (walmarts.value = data));
  d3.json("../data/us-counties-10m.json").then((data) => (us.value = data));
});

</script>

# Density mark

:::tip
For contours of spatially-distributed quantitative values, see the [contour mark](./contour.md).
:::

The **density mark** shows the [estimated density](https://en.wikipedia.org/wiki/Multivariate_kernel_density_estimation) of two-dimensional point clouds. Contours guide the eye towards the local peaks of concentration of the data, much like a topographic map does with elevation. This is especially useful given overplotting in dense datasets.

:::plot https://observablehq.com/@observablehq/plot-point-cloud-density
```js
Plot.plot({
  inset: 10,
  marks: [
    Plot.density(faithful, {x: "waiting", y: "eruptions", stroke: "steelblue", strokeWidth: 0.25}),
    Plot.density(faithful, {x: "waiting", y: "eruptions", stroke: "steelblue", thresholds: 4}),
    Plot.dot(faithful, {x: "waiting", y: "eruptions", fill: "currentColor", r: 1.5})
  ]
})
```
:::

The **bandwidth** option specifies the radius of the [Gaussian kernel](https://en.wikipedia.org/wiki/Gaussian_function) describing the influence of each point as a function of distance; this kernel is summed over a discrete grid covering the plot, and then contours (*isolines*) are derived for values between 0 (exclusive) and the maximum density (exclusive) using the [marching squares algorithm](https://en.wikipedia.org/wiki/Marching_squares).

<p>
  <label class="label-input">
    Bandwidth:
    <input type="range" v-model.number="bandwidth" min="0" max="40" step="0.2">
    <span style="font-variant-numeric: tabular-nums;">{{bandwidth.toLocaleString("en-US", {minimumFractionDigits: 1})}}</span>
  </label>
</p>

:::plot defer https://observablehq.com/@observablehq/plot-density-options
```js
Plot.plot({
  inset: 20,
  marks: [
    Plot.density(faithful, {x: "waiting", y: "eruptions", bandwidth}),
    Plot.dot(faithful, {x: "waiting", y: "eruptions"})
  ]
})
```
:::

The **thresholds** option specifies the number of contour lines (minus one) to be computed, or an explicit array of threshold values. For example, with 4 thresholds and a maximum density of 10, contour lines would be drawn for the values 2.5, 5, and 7.5. The default number of thresholds is 20.

<p>
  <label class="label-input">
    Thresholds:
    <input type="range" v-model.number="thresholds" min="1" max="40" step="1">
    <span style="font-variant-numeric: tabular-nums;">{{thresholds}}</span>
  </label>
</p>

:::plot defer https://observablehq.com/@observablehq/plot-density-options
```js
Plot.plot({
  inset: 20,
  marks: [
    Plot.density(faithful, {x: "waiting", y: "eruptions", thresholds}),
    Plot.dot(faithful, {x: "waiting", y: "eruptions"})
  ]
})
```
:::

The density mark also works with one-dimensional values:

:::plot defer https://observablehq.com/@observablehq/plot-one-dimensional-density
```js
Plot.plot({
  height: 100,
  inset: 10,
  marks: [
    Plot.density(faithful, {x: "waiting", stroke: "steelblue", strokeWidth: 0.25, bandwidth: 10}),
    Plot.density(faithful, {x: "waiting", stroke: "steelblue", thresholds: 4, bandwidth: 10}),
    Plot.dot(faithful, {x: "waiting", fill: "currentColor", r: 1.5})
  ]
})
```
:::

The density mark supports Plot’s [projection system](../features/projections.md), as in this heatmap showing the density of Walmart stores across the contiguous United States (which is a decent proxy for population density).

:::plot defer https://observablehq.com/@observablehq/plot-walmart-density
```js-vue
Plot.plot({
  projection: "albers",
  color: {scheme: "{{dark ? "turbo" : "YlGnBu"}}"},
  style: "overflow: visible;",
  marks: [
    Plot.density(walmarts, {x: "longitude", y: "latitude", bandwidth: 10, fill: "density"}),
    Plot.geo(statemesh, {strokeOpacity: 0.3}),
    Plot.geo(nation),
    Plot.dot(walmarts, {x: "longitude", y: "latitude", r: 1, fill: "currentColor"})
  ]
})
```
:::

:::tip
Use an equal-area projection with the density mark.
:::

By using the _density_ keyword as a **fill** or **stroke** color, you can draw regions with a sequential color encoding.

:::plot defer https://observablehq.com/@observablehq/plot-density-stroke
```js
Plot.plot({
  inset: 10,
  grid: true,
  x: {type: "log"},
  y: {type: "log"},
  marks: [
    Plot.density(diamonds, {x: "carat", y: "price", stroke: "density"})
  ]
})
```
:::

To facilitate comparison across facets (**fx** or **fy**) and series (**z**, **stroke**, or **fill**), the thresholds are determined by the series with the highest density. For instance, the chart below shows the highest concentration of penguins, arranged by flipper length and culmen length, on Biscoe island; the contours in the other facets use the same thresholds.

<!-- ```js
Plot.plot({
  axis: null,
  marks: [
    Plot.dot(penguins, {x: "flipper_length_mm", y: "culmen_length_mm"}),
    Plot.density(penguins, {x: "flipper_length_mm", y: "culmen_length_mm"})
  ]
})
``` -->

:::plot defer https://observablehq.com/@observablehq/plot-density-faceted
```js
Plot.plot({
  marks: [
    Plot.density(penguins, {fx: "island", x: "flipper_length_mm", y: "culmen_length_mm", stroke: "density", clip: true}),
    Plot.frame()
  ]
})
```
:::

<!-- With the default settings, the density is the local average number of dots on an area of ${tex`100\text{px}^2`}—a square of 10px by 10px. This can be multiplied by the dots’ weights. -->

The **weight** channel specifies the contribution of each data point to the estimated density; it defaults to 1, weighing each point equally. This can be used to give some points more influence than others. Try adjusting the skew slider below to transition between female- and male-weighted density.

<p>
  <label class="label-input">
    Skew (-F/+M):
    <input type="range" v-model.number="skew" min="-1" max="1" step="0.01">
    <span style="font-variant-numeric: tabular-nums;">{{skew.toLocaleString("en-US", {minimumFractionDigits: 2, signDisplay: "always"})}}</span>
  </label>
</p>

:::plot defer https://observablehq.com/@observablehq/plot-density-weighted
```js
Plot.plot({
  inset: 10,
  color: {legend: true},
  marks: [
    Plot.density(penguins.filter((d) => d.sex), {
      weight: (d) => d.sex === "FEMALE" ? 1 - skew : 1 + skew,
      x: "flipper_length_mm",
      y: "culmen_length_mm",
      strokeOpacity: 0.5,
      clip: true
    }),
    Plot.dot(penguins.filter((d) => d.sex), {
      x: "flipper_length_mm",
      y: "culmen_length_mm",
      stroke: "sex",
      strokeOpacity: (d) => d.sex === "FEMALE" ? 1 - skew : 1 + skew
    }),
    Plot.frame()
  ]
})
```
:::

You can specify a negative weight for points that the density contours should avoid, resulting in regions of influence that do not overlap.

:::plot defer https://observablehq.com/@observablehq/plot-non-overlapping-density-regions
```js
Plot.plot({
  inset: 10,
  color: {legend: true},
  marks: [
    d3.groups(penguins, (d) => d.species).map(([s]) =>
      Plot.density(penguins, {
        x: "flipper_length_mm",
        y: "culmen_length_mm",
        weight: (d) => d.species === s ? 1 : -1,
        fill: () => s,
        fillOpacity: 0.2,
        thresholds: [0.05]
      })
    ),
    Plot.dot(penguins, {
      x: "flipper_length_mm",
      y: "culmen_length_mm",
      stroke: "species"
    }),
    Plot.frame()
  ]
})
```
:::

## Density options

In addition to the [standard mark options](../features/marks.md#mark-options), the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale
* **y** - the vertical position; bound to the *y* scale
* **weight** - the contribution to the estimated density

If either of the **x** or **y** channels are not specified, the corresponding position is controlled by the **frameAnchor** option.

The **thresholds** option, which defaults to 20, specifies one more than the number of contours that will be computed at uniformly-spaced intervals between 0 (exclusive) and the maximum density (exclusive). The **thresholds** option may also be specified as an array or iterable of explicit density values. The **bandwidth** option, which defaults to 20, specifies the standard deviation of the Gaussian kernel used for estimation in pixels.

If a **z**, **stroke** or **fill** channel is specified, the input points are grouped by series, and separate sets of contours are generated for each series. If the **stroke** or **fill** is specified as *density*, a color channel is constructed with values representing the density threshold value of each contour.

## density(*data*, *options*)

```js
Plot.density(faithful, {x: "waiting", y: "eruptions"})
```

Returns a new density mark for the given *data* and *options*.
