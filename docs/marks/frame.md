<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref} from "vue";
import penguins from "../data/penguins.ts";

const framed = ref(true);

</script>

# Frame mark

A frame draws a box around the plot area.

:::plot
```js
Plot.frame().plot({x: {domain: [0, 1], grid: true}})
```
:::

Frames are most commonly used in conjunction with facets to provide better separation (Gestalt grouping) of faceted marks. Without a frame, it can be hard to tell where one facet ends and the next begins.

<p>
  <label style="font-size: smaller; color: var(--vp-c-text-2); display: flex; align-items: center;">
    Show frame:
    <input style="margin: 0 0.5em !important; all: revert;" type="checkbox" v-model="framed">
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

Unlike other marks, a frame never takes data; the first argument to [frame](#frame-options-1) is the *options* object. (For a similar data-driven mark, see [Plot.rect](./rect.md).)

:::plot
```js
Plot.frame({stroke: "red"}).plot({x: {domain: [0, 1], grid: true}})
```
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

Draws a simple frame around the entire plot (or facet).

The frame mark supports the [standard mark options](#marks), and the **rx** and **ry** options to set the [*x* radius](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx) and [*y* radius](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/ry) for rounded corners. It does not accept any data or support channels. The default **stroke** is currentColor, and the default **fill** is none.

If the **anchor** option is specified as one of *left*, *right*, *top*, or *bottom*, that side is rendered as a single line (and the **fill**, **fillOpacity**, **rx**, and **ry** options are ignored).

## frame(*options*)

```js
Plot.frame({stroke: "red"})
```

Returns a new frame with the specified *options*.
