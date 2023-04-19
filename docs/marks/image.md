<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import penguins from "../data/penguins.ts";

const presidents = shallowRef([]);

onMounted(() => {
  d3.csv("../data/us-president-favorability.csv", d3.autoType).then((data) => (presidents.value = data));
});

</script>

# Image mark

The **image mark** draws images centered at the given position in **x** and **y**. It is often used to construct scatterplots in place of a [dot mark](./dot.md). For example, the chart below, based on one by [Robert Lesser](https://observablehq.com/@rlesser/when-presidents-fade-away), shows the favorability of U.S. presidents over time alongside their portraits.

:::plot defer
```js
Plot.plot({
  inset: 20,
  x: {label: "First inauguration date →"},
  y: {grid: true, label: "↑ Net favorability (%)", tickFormat: "+f"},
  marks: [
    Plot.ruleY([0]),
    Plot.image(presidents, {
      x: "First Inauguration Date",
      y: (d) => d["Very Favorable %"] + d["Somewhat Favorable %"] - d["Very Unfavorable %"] - d["Somewhat Unfavorable %"],
      src: "Portrait URL",
      width: 40,
      title: "Name"
    })
  ]
})
```
:::

Images are drawn in input order by default. This dataset is ordered chronologically, and hence above the more recent presidents are drawn on top. You can change the order with the [sort transform](../transforms/sort.md).

With the **r** option, images will be clipped to circles of the given radius. Use the [**preserveAspectRatio** option](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio) to control which part of the image appears within the circle; below, we favor the top part of the image to show the presidential head.

:::plot defer
```js
Plot.plot({
  x: {inset: 20, label: "First inauguration date →"},
  y: {insetTop: 4, grid: true, label: "↑ Any opinion (%)", tickFormat: "+f"},
  marks: [
    Plot.ruleY([0]),
    Plot.image(presidents, {
      x: "First Inauguration Date",
      y: (d) => d["Very Favorable %"] + d["Somewhat Favorable %"] + d["Very Unfavorable %"] + d["Somewhat Unfavorable %"],
      src: "Portrait URL",
      r: 20,
      preserveAspectRatio: "xMidYMin slice",
      title: "Name"
    })
  ]
})
```
:::

:::tip
You can also use the **r** channel as a size encoding, and the **rotate** channel, as with dots.
:::

The **r** option works well with the [dodge transform](../transforms/dodge.md) for an image beeswarm plot. This chart isn’t particularly interesting because new presidents are inaugurated at a fairly consistent rate, but at least it avoids overlapping portraits.

:::plot defer
```js
Plot.plot({
  inset: 20,
  height: 280,
  marks: [
    Plot.image(
      presidents,
      Plot.dodgeY({
        x: "First Inauguration Date",
        r: 20, // clip to a circle
        preserveAspectRatio: "xMidYMin slice", // try not to clip heads
        src: "Portrait URL",
        title: "Name"
      })
    )
  ]
})
```
:::

The default size of an image is only 16×16 pixels. This may be acceptable if the image is a small glyph, such as a categorical symbol in a scatterplot. But often you will want to set **width**, **height**, or **r** to increase the image size.

:::plot defer
```js
Plot.plot({
  aspectRatio: 1,
  grid: true,
  x: {label: "Favorable opinion (%) →"},
  y: {label: "↑ Unfavorable opinion (%)"},
  marks: [
    Plot.ruleY([0]),
    Plot.ruleX([0]),
    Plot.image(presidents, {
      x: (d) => d["Very Favorable %"] + d["Somewhat Favorable %"],
      y: (d) => d["Very Unfavorable %"] + d["Somewhat Unfavorable %"],
      src: "Portrait URL",
      title: "Name"
    })
  ]
})
```
:::

If—*for reasons*—you want to style the plot with a background image, you can do that using the top-level **style** option rather than an image mark. Below, the penguins dataset is visualized atop of a picture of NOAA’s [South Pole Atmospheric Research Observatory](https://unsplash.com/photos/GnP7PjxGeHs). (These penguins were observed in Antarctica, though on the [peninsula](https://en.wikipedia.org/wiki/Antarctic_Peninsula) rather than near the pole.)

:::plot defer
```js
Plot.plot({
  margin: 30,
  inset: 10,
  grid: true,
  style: {
    padding: 10,
    color: "black",
    background: `url(https://images.unsplash.com/photo-1561990170-6d82faed96e7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&dl=noaa-GnP7PjxGeHs-unsplash.jpg&w=1376)`,
    backgroundSize: "cover"
  },
  marks: [
    Plot.frame(),
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "white", stroke: "black"})
  ]
})
```
:::

## Image options

The required **src** option specifies the URL (or relative path) of each image. If **src** is specified as a string that starts with a dot, slash, or URL protocol (*e.g.*, “https:”) it is assumed to be a constant; otherwise it is interpreted as a channel.

In addition to the [standard mark options](../features/marks.md#mark-options), the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale
* **y** - the vertical position; bound to the *y* scale
* **width** - the image width (in pixels)
* **height** - the image height (in pixels)
* **r** - the image radius; bound to the *r* scale

If either of the **x** or **y** channels are not specified, the corresponding position is controlled by the **frameAnchor** option.

The **width** and **height** options default to 16 pixels (unless **r** is specified) and can be specified as either a channel or constant. When the width or height is specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel. Images with a nonpositive width or height are not drawn. If a **width** is specified but not a **height**, or *vice versa*, the one defaults to the other. Images do not support either a fill or a stroke.

The **r** option, if not null (the default), enables circular clipping; it may be specified as a constant in pixels or a channel. Use the **preserveAspectRatio** option to control which part of the image is clipped. Also defaults the **width** and **height** to twice the effective radius.

The following image-specific constant options are also supported:

* **frameAnchor** - how to position the image within the frame; defaults to *middle*
* **preserveAspectRatio** - the [aspect ratio](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio); defaults to *xMidYMid meet*
* **crossOrigin** - the [cross-origin](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/crossorigin) behavior
* **imageRendering** - the [image-rendering attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/image-rendering); defaults to *auto* (bilinear)

To crop the image instead of scaling it to fit, set **preserveAspectRatio** to *xMidYMid slice*. The **imageRendering** option may be set to *pixelated* to disable bilinear interpolation on enlarged images; however, note that this is not supported in WebKit.

Images are drawn in input order, with the last data drawn on top. If sorting is needed, say to mitigate overplotting, consider a [sort transform](../transforms/sort.md).

## image(*data*, *options*)

```js
Plot.image(presidents, {x: "inauguration", y: "favorability", src: "portrait"})
```

Returns a new image with the given *data* and *options*. If neither the **x** nor **y** nor **frameAnchor** options are specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].
