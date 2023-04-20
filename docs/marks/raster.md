<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import penguins from "../data/penguins.ts";
import volcano from "../data/volcano.ts";

const ca55 = shallowRef([]);
const grid = {"width": 10, "height": 10, "values": d3.cross(d3.range(10), d3.range(10), (x, y) => x * y)};

onMounted(() => {
  d3.csv("../data/ca55-south.csv", d3.autoType).then((data) => (ca55.value = data));
});

function mandelbrot(x, y) {
  for (let n = 0, zr = 0, zi = 0; n < 80; ++n) {
    [zr, zi] = [zr * zr - zi * zi + x, 2 * zr * zi + y];
    if (zr * zr + zi * zi > 4) return n;
  }
}

</script>

# Raster mark

:::tip
To produce contours instead of a heatmap, see the [contour mark](./contour.md).
:::

The **raster mark** renders a [raster image](https://en.wikipedia.org/wiki/Raster_graphics)—that is, an image formed by discrete pixels in a grid, not a vector graphic like other marks. And whereas the [image mark](./image.md) shows an *existing* image, the raster mark *creates* one from abstract data, either by [interpolating spatial samples](../features/spatial-interpolators.md) (arbitrary points in **x** and **y**) or by sampling a continuous function *f*(*x*,*y*) along the grid.

For example, the heatmap below shows the topography of the [Maungawhau volcano](https://en.wikipedia.org/wiki/Maungawhau), produced from a {{volcano.width}}×{{volcano.height}} grid of elevation samples.

:::plot defer
```js
Plot.plot({
  color: {label: "Elevation (m)", legend: true},
  marks: [
    Plot.raster(volcano.values, {width: volcano.width, height: volcano.height})
  ]
})
```
:::

The grid (`volcano.values` above) is a list of numbers `[103, 104, 104, …]`. The first number `103` is the elevation of the bottom-left corner. This grid is in [row-major order](https://en.wikipedia.org/wiki/Row-_and_column-major_order), meaning that the elevations of the first row are followed by the second row, then the third, and so on. Here’s a smaller grid to demonstrate the concept.

```js
grid = ({
  "width": 10,
  "height": 10,
  "values": [
     0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
     0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
     0,  2,  4,  6,  8, 10, 12, 14, 16, 18,
     0,  3,  6,  9, 12, 15, 18, 21, 24, 27,
     0,  4,  8, 12, 16, 20, 24, 28, 32, 36,
     0,  5, 10, 15, 20, 25, 30, 35, 40, 45,
     0,  6, 12, 18, 24, 30, 36, 42, 48, 54,
     0,  7, 14, 21, 28, 35, 42, 49, 56, 63,
     0,  8, 16, 24, 32, 40, 48, 56, 64, 72,
     0,  9, 18, 27, 36, 45, 54, 63, 72, 81
  ]
})
```

We can visualize this small grid directly with a [text mark](./text.md) using the same color encoding. Notice that the image below is flipped vertically relative to the data: the first row of the data is the *bottom* of the image because below *y* points up↑.

:::plot
```js
Plot.plot({
  grid: true,
  x: {domain: [0, grid.width], label: "column →"},
  y: {domain: [0, grid.height], label: "↑ row"},
  marks: [
    Plot.text(grid.values, {
      text: Plot.identity,
      fill: Plot.identity,
      x: (d, i) => i % grid.width + 0.5,
      y: (d, i) => Math.floor(i / grid.width) + 0.5
    })
  ]
})
```
:::

Also notice that the grid points are offset by 0.5: they represent the *middle* of each pixel rather than the corner. Below, the raster mark is laid under the text mark to show the raster image.

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.raster(grid.values, {
      width: grid.width,
      height: grid.height,
      imageRendering: "pixelated" // to better show the grid
    }),
    Plot.text(grid.values, {
      text: Plot.identity,
      fill: "white",
      x: (d, i) => i % grid.width + 0.5,
      y: (d, i) => Math.floor(i / grid.width) + 0.5
    })
  ]
})
```
:::

:::warning CAUTION
Safari does not currently support the **imageRendering** option.
:::

While the raster mark provides convenient shorthand for strictly gridded data, as above, it *also* works with samples in arbitrary positions and arbitrary order. For example, in 1955 the [Great Britain aeromagnetic survey](https://www.bgs.ac.uk/datasets/gb-aeromagnetic-survey/) measured the Earth’s magnetic field by plane. Each sample recorded the longitude and latitude alongside the strength of the [IGRF](https://www.ncei.noaa.gov/products/international-geomagnetic-reference-field) in [nanoteslas](https://en.wikipedia.org/wiki/Tesla_(unit)).

```
LONGITUDE,LATITUDE,MAG_IGRF90
-2.36216,51.70945,7
-2.36195,51.71727,6
-2.36089,51.72404,9
-2.35893,51.73758,12
-2.35715,51.7532,18
-2.35737,51.76636,24
```

Using a [dot mark](./dot.md), we can make a quick scatterplot to see the irregular grid. We’ll use a *diverging* color scale to distinguish positive and negative values.

:::plot defer
```js
Plot.dot(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90"}).plot({color: {type: "diverging"}})
```
:::

And using a [line mark](./line.md), we can connect the line segments to reveal the flight paths.

:::plot defer
```js
Plot.line(ca55, {x: "LONGITUDE", y: "LATITUDE", stroke: "MAG_IGRF90", z: "LINE_NUMB-SEG"}).plot({color: {type: "diverging"}})
```
:::

The image above starts to be readable, but it would be frustrating to not do more with this data given all the effort that went into collecting it! Fortunately the raster mark’s **interpolate** option can quickly produce a continuous image.

The *nearest* interpolator assigns the value of each pixel in the grid using the nearest sample in the data. In effect, this produces a Voronoi diagram.

:::plot defer
```js
Plot.raster(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90", interpolate: "nearest"}).plot({color: {type: "diverging"}})
```
:::

:::tip
You can also make this Voronoi diagram with the [voronoi mark](./delaunay.md).
:::

If the observed phenomenon is continuous, we can use the _barycentric_ interpolator. This constructs a Delaunay triangulation of the samples, and then paints each triangle by interpolating the values of the triangle’s vertices in [barycentric coordinates](https://en.wikipedia.org/wiki/Barycentric_coordinate_system). (Points outside the convex hull are extrapolated.)

:::plot defer
```js
Plot.raster(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90", interpolate: "barycentric"}).plot({color: {type: "diverging"}})
```
:::

Finally, the _random-walk_ interpolator assigns the value at each grid location simply by taking a random walk that stops after reaching a minimum distance from any sample! The interpolator uses the [walk on spheres](https://observablehq.com/@fil/walk-on-spheres) algorithm, limited to 2 consecutive jumps.

:::plot defer
```js
Plot.raster(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90", interpolate: "random-walk"}).plot({color: {type: "diverging"}})
```
:::

With the _random-walk_ method, the image is grainy, reflecting the uncertainty of the random walk. Use the **blur** option to make it smoother.

:::plot defer
```js
Plot.raster(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90", interpolate: "random-walk", blur: 5}).plot({color: {type: "diverging"}})
```
:::

:::tip
If none of the built-in [spatial interpolators](../features/spatial-interpolators.md) suffice, you can write your own as a custom function!
:::

The raster mark can interpolate categorical values, too! Below, this creates an interesting “map” of penguin species in the space of culmen length _vs._ depth.

:::plot defer
```js
Plot.plot({
  color: {legend: true},
  marks: [
    Plot.raster(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species", interpolate: "random-walk"}),
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```
:::

As an alternative to interpolating discrete samples, you can supply values as a continuous function *f*(*x*,*y*); the raster mark will invoke this function for the midpoint of each pixel in the raster grid, similar to a WebGL fragment shader. For example, below we visualize the [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set) by counting the number of iterations needed until the point “escapes”.

:::plot defer
```js
Plot.raster({fill: mandelbrot, x1: -2, x2: 1, y1: -1.164, y2: 1.164}).plot({aspectRatio: 1})
```
:::

```js
function mandelbrot(x, y) {
  for (let n = 0, zr = 0, zi = 0; n < 80; ++n) {
    [zr, zi] = [zr * zr - zi * zi + x, 2 * zr * zi + y];
    if (zr * zr + zi * zi > 4) return n;
  }
}
```

Or to visualize the arctangent function:

:::plot defer
```js
Plot.raster({x1: -1, x2: 1, y1: -1, y2: 1, fill: (x, y) => Math.atan2(y, x)}).plot()
```
:::

:::tip
When faceting, the sample function *f*(*x*,*y*) is passed a third argument of the facet values {*fx*, *fy*}.
:::

## Raster options

If *data* is provided, it represents discrete samples in abstract coordinates **x** and **y**; the **fill** and **fillOpacity** channels specify further abstract values (_e.g._, height in a topographic map) to be [spatially interpolated](../features/spatial-interpolators.md) to produce an image.

```js
Plot.raster(volcano.values, {width: volcano.width, height: volcano.height})
```

The **fill** and **fillOpacity** channels may alternatively be specified as continuous functions *f*(*x*,*y*) to be evaluated at each pixel centroid of the raster grid (without interpolation).

```js
Plot.raster({x1: -1, x2: 1, y1: -1, y2: 1, fill: (x, y) => Math.atan2(y, x)})
```

The resolution of the rectangular raster image may be specified with the following options:

* **width** - the number of pixels on each horizontal line
* **height** - the number of lines; a positive integer

The raster dimensions may also be imputed from the extent of *x* and *y* and a pixel size:

* **x1** - the starting horizontal position; bound to the *x* scale
* **x2** - the ending horizontal position; bound to the *x* scale
* **y1** - the starting vertical position; bound to the *y* scale
* **y2** - the ending vertical position; bound to the *y* scale
* **pixelSize** - the screen size of a raster pixel; defaults to 1

If **width** is specified, **x1** defaults to 0 and **x2** defaults to **width**; likewise, if **height** is specified, **y1** defaults to 0 and **y2** defaults to **height**. Otherwise, if **data** is specified, **x1**, **y1**, **x2**, and **y2** respectively default to the frame’s left, top, right, and bottom coordinates. Lastly, if **data** is not specified (as when **fill** or **fillOpacity** is a function of *x* and *y*), you must specify all of **x1**, **x2**, **y1**, and **y2** to define the raster domain (see below). The **pixelSize** may be set to the inverse of the devicePixelRatio for a sharper image.

The following raster-specific constant options are supported:

* **interpolate** - the [spatial interpolation method](../features/spatial-interpolators.md)
* **imageRendering** - the [image-rendering attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/image-rendering); defaults to *auto* (bilinear)
* **blur** - a non-negative pixel radius for smoothing; defaults to 0

The **imageRendering** option may be set to *pixelated* for a sharper image. The **interpolate** option is ignored when **fill** or **fillOpacity** is a function of *x* and *y*.

## raster(*data*, *options*)

```js
Plot.raster(volcano.values, {width: volcano.width, height: volcano.height})
```

Returns a new raster mark with the given (optional) *data* and *options*.
