<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import volcano from "../data/volcano.ts";

const ca55 = shallowRef([]);
const vapor = shallowRef([]);
const grid = {"width": 10, "height": 10, "values": d3.cross(d3.range(10), d3.range(10), (x, y) => x * y)};

onMounted(() => {
  d3.csv("../data/ca55-south.csv", d3.autoType).then((data) => (ca55.value = data));
  d3.text("../data/MYDAL2_M_SKY_WV_2022-11-01_rgb_360x180.csv").then((text) => (vapor.value = d3.csvParseRows(text).flat().map((x) => (x === "99999.0" ? NaN : +x))));
});

function mandelbrot(x, y) {
  for (let n = 0, zr = 0, zi = 0; n < 80; ++n) {
    [zr, zi] = [zr * zr - zi * zi + x, 2 * zr * zi + y];
    if (zr * zr + zi * zi > 4) return n;
  }
}

</script>

# Contour mark

:::tip
To produce a heatmap instead of contours, see the [raster mark](./raster.md). For contours of estimated point density, see the [density mark](./density.md).
:::

The **contour mark** draws [isolines](https://en.wikipedia.org/wiki/Contour_line) to delineate regions above and below a particular continuous value. These contours are computed by applying the [marching squares algorithm](https://en.wikipedia.org/wiki/Marching_squares) to a discrete grid. Like the [raster mark](./raster.md), the grid can be constructed either by [interpolating spatial samples](../features/spatial-interpolators.md) (arbitrary points in **x** and **y**) or by sampling a continuous function *f*(*x*,*y*) along the grid.

For example, the contours below show the topography of the [Maungawhau volcano](https://en.wikipedia.org/wiki/Maungawhau), produced from a {{volcano.width}}×{{volcano.height}} grid of elevation samples.

:::plot defer https://observablehq.com/@observablehq/plot-stroked-contours
```js
Plot.contour(volcano.values, {width: volcano.width, height: volcano.height}).plot()
```
:::

Whereas the **value** option produces isolines suitable for stroking, the **fill** option produces filled contours. Setting the **fill** to [identity](../features/transforms.md#identity) will apply a color encoding to the contour values, allowing the contour values to be read via a *color* legend.

:::plot defer https://observablehq.com/@observablehq/plot-filled-contours
```js
Plot.plot({
  color: {
    legend: true,
    label: "Elevation (m)"
  },
  marks: [
    Plot.contour(volcano.values, {
      width: volcano.width,
      height: volcano.height,
      fill: Plot.identity,
      stroke: "black"
    })
  ]
})
```
:::

:::info
Contours are drawn in ascending value order, with the highest value on top; hence, filled contour polygons overlap! If you are interested in isobands, please upvote [#1420](https://github.com/observablehq/plot/issues/1420).
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

:::plot https://observablehq.com/@observablehq/plot-small-grid-contours
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

Also notice that the grid points are offset by 0.5: they represent the *middle* of each pixel rather than the corner. Below, the contour mark is laid under the text mark to show filled contours.

:::plot defer https://observablehq.com/@observablehq/plot-small-grid-contours
```js
Plot.plot({
  marks: [
    Plot.contour(grid.values, {
      width: grid.width,
      height: grid.height,
      fill: Plot.identity,
      interval: 5
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

Similar to the [bin transform](../transforms/bin.md), contour levels can be specified either with the **interval** option (above, a contour at each multiple of 5) or with the **thresholds** option (either a count of thresholds or an explicit array of values).

While the contour mark provides convenient shorthand for strictly gridded data, as above, it *also* works with samples in arbitrary positions and arbitrary order. For example, in 1955 the [Great Britain aeromagnetic survey](https://www.bgs.ac.uk/datasets/gb-aeromagnetic-survey/) measured the Earth’s magnetic field by plane. Each sample recorded the longitude and latitude alongside the strength of the [IGRF](https://www.ncei.noaa.gov/products/international-geomagnetic-reference-field) in [nanoteslas](https://en.wikipedia.org/wiki/Tesla_(unit)).

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

:::plot defer https://observablehq.com/@observablehq/plot-igrf90-dots
```js
Plot.dot(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90"}).plot({color: {type: "diverging"}})
```
:::

Pass the same arguments to the contour mark for continuous contours.

:::plot defer https://observablehq.com/@observablehq/plot-igrf90-contours
```js
Plot.contour(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90"}).plot({color: {type: "diverging"}})
```
:::

As with the raster mark, the **blur** option applies a Gaussian blur to the underlying raster grid, resulting in smoother contours.

:::plot defer https://observablehq.com/@observablehq/plot-blurred-contours
```js
Plot.contour(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90", blur: 4}).plot({color: {type: "diverging"}})
```
:::

:::tip
The contour mark also supports the **interpolate** option for control over [spatial interpolation](../features/spatial-interpolators.md).
:::

The contour mark supports Plot’s [projection system](../features/projections.md). The chart below shows global atmospheric water vapor measurements from [NASA Earth Observations](https://neo.gsfc.nasa.gov/view.php?datasetId=MYDAL2_M_SKY_WV).

:::plot defer https://observablehq.com/@observablehq/plot-contours-projection
```js
Plot.plot({
  projection: "equal-earth",
  color: {
    scheme: "BuPu",
    domain: [0, 6],
    legend: true,
    label: "Water vapor (cm)"
  },
  marks: [
    Plot.contour(vapor, {
      fill: Plot.identity,
      width: 360,
      height: 180,
      x1: -180,
      y1: 90,
      x2: 180,
      y2: -90,
      blur: 1,
      stroke: "black",
      strokeWidth: 0.5,
      clip: "sphere"
    }),
    Plot.sphere({stroke: "black"})
  ]
})
```
:::

As an alternative to interpolating discrete samples, you can supply values as a continuous function *f*(*x*,*y*); the contour mark will invoke this function for the midpoint of each pixel in the raster grid, similar to a WebGL fragment shader. For example, below we visualize the trigonometric function sin(*x*) cos(*y*), producing a checkerboard-like pattern.

:::plot defer https://observablehq.com/@observablehq/plot-function-contour-2
```js
Plot.plot({
  aspectRatio: 1,
  x: {tickSpacing: 80, label: "x →"},
  y: {tickSpacing: 80, label: "↑ y"},
  color: {type: "diverging", legend: true, label: "sin(x) cos(y)"},
  marks: [
    Plot.contour({
      fill: (x, y) => Math.sin(x) * Math.cos(y),
      x1: 0,
      y1: 0,
      x2: 6 * Math.PI,
      y2: 4 * Math.PI
    })
  ]
})
```
:::

:::tip
When faceting, the sample function *f*(*x*,*y*) is passed a third argument of the facet values {*fx*, *fy*}.
:::

## Contour options

If *data* is provided, it represents discrete samples in abstract coordinates **x** and **y**; the **value** channel specifies further abstract quantitative values (_e.g._, height in a topographic map) to be [spatially interpolated](../features/spatial-interpolators.md) to produce the underlying raster grid.

```js
Plot.contour(volcano.values, {width: volcano.width, height: volcano.height, value: Plot.identity})
```

The **value** channel may alternatively be specified as a continuous function *f*(*x*,*y*) to be evaluated at each pixel centroid of the raster grid (without interpolation).

```js
Plot.contour({x1: 0, y1: 0, x2: 4, y2: 4, value: (x, y) => Math.sin(x) * Math.cos(y)})
```

The resolution of the raster grid may be specified with the following options:

* **width** - the number of pixels on each horizontal line
* **height** - the number of lines; a positive integer

Alternatively, the raster dimensions may be imputed from the extent of *x* and *y* and a pixel size:

* **x1** - the starting horizontal position; bound to the *x* scale
* **x2** - the ending horizontal position; bound to the *x* scale
* **y1** - the starting vertical position; bound to the *y* scale
* **y2** - the ending vertical position; bound to the *y* scale
* **pixelSize** - the screen size of a raster pixel; defaults to 1

If **width** is specified, **x1** defaults to 0 and **x2** defaults to **width**; likewise, if **height** is specified, **y1** defaults to 0 and **y2** defaults to **height**. Otherwise, if **data** is specified, **x1**, **y1**, **x2**, and **y2** respectively default to the frame’s left, top, right, and bottom coordinates. Lastly, if **data** is not specified (as when **value** is a function of *x* and *y*), you must specify all of **x1**, **x2**, **y1**, and **y2** to define the raster domain (see below).

The contour mark shares many options with the [raster mark](./raster.md). The **interpolate** option is ignored when the **value** channel is a continuous function of *x* and *y*, and otherwise defaults to *nearest*. For smoother contours, the **blur** option (default 0) specifies a non-negative pixel radius for smoothing prior to applying marching squares. The **smooth** option (default true) specifies whether to apply linear interpolation after marching squares when computing contour polygons. The **thresholds** and **interval** options specify the contour thresholds; see the [bin transform](../transforms/bin.md) for details.

With the exception of the **x**, **y**, **x1**, **y1**, **x2**, **y2**, and **value** channels, the contour mark’s channels are not evaluated on the initial *data* but rather on the contour multipolygons generated in the initializer. For example, to generate filled contours where the color corresponds to the contour threshold value:

```js
Plot.contour(volcano.values, {width: volcano.width, height: volcano.height, value: Plot.identity, fill: "value"})
```

As shorthand, a single channel may be specified, in which case it is promoted to the *value* channel.

```js
Plot.contour(volcano.values, {width: volcano.width, height: volcano.height, fill: Plot.identity})
```

## contour(*data*, *options*)

```js
Plot.contour(volcano.values, {width: volcano.width, height: volcano.height, fill: Plot.identity})
```

Returns a new contour mark with the given (optional) *data* and *options*.
