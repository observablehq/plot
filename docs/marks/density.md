<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref} from "vue";
import diamonds from "../data/diamonds.ts";
import faithful from "../data/faithful.ts";
import penguins from "../data/penguins.ts";

const skew = ref(0);

</script>

# Density mark

The Density mark shows the estimated density of two-dimensional point clouds. Contours guide the eye towards the local peaks of concentration of the data, much like a topographic map does with elevation. This is especially useful given overplotting in dense datasets.

:::plot
```js
Plot.plot({
  inset: 20,
  marks: [
    Plot.density(faithful, {x: "waiting", y: "eruptions", stroke: "steelblue", strokeWidth: 0.25}),
    Plot.density(faithful, {x: "waiting", y: "eruptions", stroke: "steelblue", thresholds: 4}),
    Plot.dot(faithful, {x: "waiting", y: "eruptions", fill: "currentColor", r: 1.5})
  ]
})
```
:::

The **bandwidth** option specifies the radius of the [Gaussian kernel](https://en.wikipedia.org/wiki/Gaussian_function) describing the influence of each point as a function of distance; this kernel is summed over a discrete grid covering the plot, and then contours (*isolines*) are derived for values between 0 (exclusive) and the maximum density (exclusive) using the [marching squares algorithm](https://en.wikipedia.org/wiki/Marching_squares). (Internally, the bandwidth is rounded based on the precision of the underlying discrete grid.)

<!-- ```js
viewof bandwidth = Inputs.range([0, 40], {label: "Bandwidth", value: 20, step: 0.2})
``` -->

<!-- ```js
Plot.plot({
  inset: 20,
  marks: [
    Plot.density(faithful, {x: "waiting", y: "eruptions", bandwidth: undefined}), // TODO
    Plot.dot(faithful, {x: "waiting", y: "eruptions"})
  ]
})
``` -->

The **thresholds** option specifies the number of contour lines (minus one) to be computed. For example, with 4 thresholds and a maximum density of 10, contour lines would be drawn for the values 2.5, 5, and 7.5. The default number of thresholds is 20. (You can also pass the thresholds as an explicit array of values.)

<!-- ```js
viewof thresholds = Inputs.range([1, 40], {label: "Thresholds", value: 20, step: 1})
``` -->

<!-- ```js
Plot.plot({
  inset: 20,
  marks: [
    Plot.density(faithful, {x: "waiting", y: "eruptions", thresholds}),
    Plot.dot(faithful, {x: "waiting", y: "eruptions"})
  ]
})
``` -->

The density mark also works with one-dimensional values:

:::plot
```js
Plot.plot({
  height: 100,
  inset: 20,
  marks: [
    Plot.density(faithful, {x: "waiting", stroke: "steelblue", strokeWidth: 0.25, bandwidth: 10}),
    Plot.density(faithful, {x: "waiting", stroke: "steelblue", thresholds: 4, bandwidth: 10}),
    Plot.dot(faithful, {x: "waiting", fill: "currentColor", r: 1.5})
  ]
})
```
:::

By using the _density_ keyword as a **fill** or **stroke** color, you can draw regions with a sequential color encoding.

:::plot defer
```js
Plot.plot({
  height: 500,
  grid: true,
  x: {type: "log"},
  y: {type: "log"},
  marks: [
    Plot.density(diamonds, {x: "carat", y: "price", stroke: "density"})
  ]
})
```
:::

To make the contours comparable when used across facets or with different series (specified by **z**, **stroke**, or **fill**), the number of thresholds is computed on the series that reaches the highest density. For instance, the chart below shows the highest concentration of penguins, arranged by flipper length and culmen length, in the Biscoe island facet. The contours in the other facets will thus respect the values determined by the Biscoe facet, resulting in comparable density levels.

<!-- ```js
Plot.plot({
  axis: null,
  marks: [
    Plot.dot(penguins, {x: "flipper_length_mm", y: "culmen_length_mm"}),
    Plot.density(penguins, {x: "flipper_length_mm", y: "culmen_length_mm"})
  ]
})
``` -->

:::plot
```js
Plot.plot({
  width: 928,
  height: 360,
  color: {
    scheme: "ylgnbu",
    label: "Density"
  },
  facet: {
    data: penguins,
    x: "island"
  },
  marks: [
    Plot.density(penguins, {x: "flipper_length_mm", y: "culmen_length_mm", fill: "density", clip: true}),
    Plot.frame()
  ]
})
```
:::

Similarly, when arranged by series (here, specified with *stroke*), the series with the highest local maximum will drive the thresholds which will then be used across all the series.

:::plot
```js
Plot.plot({
  width: 360,
  height: 360,
  inset: 20,
  color: {
    legend: true
  },
  marks: [
    Plot.density(penguins, {
      x: "flipper_length_mm",
      y: "culmen_length_mm",
      stroke: "species",
      fill: "species",
      title: "species",
      fillOpacity: 0.1,
      thresholds: 15,
      mixBlendMode: "multiply", // TODO
      clip: true
    }),
    Plot.frame()
  ]
})
```
:::

With the default settings, the density is the local average number of dots on an area of ${tex`100\text{px}^2`}—a square of 10px by 10px. This can be multiplied by the dots’ weights.

The **weight** is the importance of each data point, and defaults to 1 (counting dots). Otherwise, the weight is usually specified as a channel, used to signify that some points have proportionally more influence than others.

<!-- viewof skew = Inputs.range([-1, 1], {step: 0.01, label: "Skew (-M/+F)"}) -->

<p>
  <label style="font-size: smaller; color: var(--vp-c-text-2); display: flex;">
    Skew:
    <input type="range" style="all: revert; margin: 0 0.5em;" v-model.number="skew" min="-1" max="1" step="0.01">
    {{skew.toFixed(2)}}
  </label>
</p>

:::plot
```js
Plot.plot({
  width: 360,
  height: 360,
  nice: true,
  color: {legend: true},
  marks: [
    Plot.density(penguins.filter(d => d.sex), {
      weight: d => d.sex === "MALE" ? 1 - skew : 1 + skew,
      x: "flipper_length_mm",
      y: "culmen_length_mm",
      strokeOpacity: 0.5,
      clip: true
    }),
    Plot.dot(penguins.filter(d => d.sex), {
      x: "flipper_length_mm",
      y: "culmen_length_mm",
      stroke: "sex",
      strokeOpacity: d => d.sex === "MALE" ? 1 - skew : 1 + skew
    }),
    Plot.frame()
  ]
})
```
:::

A common use case (or “trick”, if you will) is to specify a negative weight for points that
the density contours should avoid—allowing to to draw regions of influence that
do not overlap.

:::plot
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

TK Draws contours representing the density of point clouds, implementing [two-dimensional kernel density estimation](https://en.wikipedia.org/wiki/Multivariate_kernel_density_estimation). Each contour represents the area where the estimated point density is greater than or equal to a given density value.

## density(*data*, *options*)

Draws contours representing the estimated density of the two-dimensional points given by the **x** and **y** channels, and possibly weighted by the **weight** channel. If either of the **x** or **y** channels are not specified, the corresponding position is controlled by the **frameAnchor** option.

The **thresholds** option, which defaults to 20, specifies one more than the number of contours that will be computed at uniformly-spaced intervals between 0 (exclusive) and the maximum density (exclusive). The **thresholds** option may also be specified as an array or iterable of explicit density values. The **bandwidth** option, which defaults to 20, specifies the standard deviation of the Gaussian kernel used for estimation in pixels.

If a **z**, **stroke** or **fill** channel is specified, the input points are grouped by series, and separate sets of contours are generated for each series. If the **stroke** or **fill** is specified as *density*, a color channel is constructed with values representing the density threshold value of each contour.
