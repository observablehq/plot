<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref, shallowRef, onMounted} from "vue";
import penguins from "../data/penguins.ts";

const framed = ref(true);

const faithful = shallowRef([]);

onMounted(() => {
  d3.tsv("../data/faithful.tsv", d3.autoType).then((data) => (faithful.value = data));
});

</script>

# Frame mark

The **frame mark** draws a rectangle around the plot area.

:::plot
```js
Plot.frame().plot({x: {domain: [0, 1], grid: true}})
```
:::

Frames are most commonly used in conjunction with facets to provide better separation (Gestalt grouping) of faceted marks. Without a frame, it can be hard to tell where one facet ends and the next begins.

<p>
  <label class="label-input">
    Show frame:
    <input type="checkbox" v-model="framed">
  </label>
</p>

:::plot
```js
Plot.plot({
  grid: true,
  inset: 10,
  marks: [
    framed ? Plot.frame() : null,
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "#eee"}),
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species"})
  ]
})
```
:::

Unlike most marks, a frame never takes *data*; the first argument to [frame](#frame-options-1) is the *options* object. (For data-driven rectangles, see the [rect mark](./rect.md).)

:::plot
```js
Plot.frame({stroke: "red"}).plot({x: {domain: [0, 1], grid: true}})
```
:::

While options are often specified in literal values, such as <span style="border-bottom: solid 2px var(--vp-c-red);">*red*</span> above, the standard [mark channels](../features/marks.md#mark-options) such as **fill** and **stroke** can also be specified as abstract values. For example, in the density heatmap below comparing the delay between eruptions of the Old Faithful geyser (*waiting*) in *x*→ and the duration of the eruption (*eruptions*) in *y*↑, both in minutes, we fill the frame with <span :style="{borderBottom: `solid 2px ${d3.interpolateTurbo(0)}`}">black</span> representing zero density.

:::plot defer
```js
Plot.plot({
  inset: 30,
  marks: [
    Plot.frame({fill: 0}),
    Plot.density(faithful, {x: "waiting", y: "eruptions", fill: "density"})
  ]
})
```
:::

:::tip
This is equivalent to a [rect](./rect.md): `Plot.rect({length: 1}, {fill: 0})`.
:::

You can also place a frame on a specific facet using the **fx** or **fy** option. Below, a frame emphasizes the *Gentoo* facet, say to draw attention to how much bigger they are. 🐧

:::plot
```js
Plot.plot({
  marginLeft: 80,
  inset: 10,
  marks: [
    Plot.frame({fy: "Gentoo"}),
    Plot.dot(penguins, {x: "body_mass_g", fy: "species"})
  ]
})
```
:::

:::tip
Or: `Plot.rect({length: 1}, {fy: ["Gentoo"], stroke: "currentColor"})`.
:::

The **anchor** option, if specified to a value of *left*, *right*, *top* or *bottom*, draws only that side of the frame. In that case, the **fill** and **rx**, **ry** options are ignored.

:::plot
```js
Plot.plot({
  x: {
    domain: [0, 1],
    grid: true
  },
  marks: [
    Plot.frame({stroke: "red", anchor: "bottom"})
  ]
})
```
:::

## Frame options

The frame mark supports the [standard mark options](../features/marks.md#mark-options), and the **rx** and **ry** options to set the [*x* radius](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx) and [*y* radius](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/ry) for rounded corners. It does not accept any data. The default **stroke** is *currentColor*, and the default **fill** is *none*.

If the **anchor** option is specified as one of *left*, *right*, *top*, or *bottom*, that side is rendered as a single line (and the **fill**, **fillOpacity**, **rx**, and **ry** options are ignored).

## frame(*options*)

```js
Plot.frame({stroke: "red"})
```

Returns a new frame mark with the specified *options*.
