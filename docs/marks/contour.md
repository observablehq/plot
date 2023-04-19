# Contour mark

:::tip
To produce a heatmap instead of contours, see the [raster mark](./raster.md).
:::

The **contour** mark generates smooth contours from spatial samples. It is closely related to the [raster mark](./raster.md), employing the same spatial interpolation techniques to transform samples {*x*, *y*, *value*} into a raster grid; but instead of returning that grid as an image, it then derives contour polygons via [marching squares](https://github.com/d3/d3-contour). These polygons are drawn as SVG paths, and can receive fill and stroke properties as well as any other common options such as opacity, title, _etc._

_Note: this notebook only presents the specificities of the contour mark; please see the [raster mark](./raster.md) for details on options that are shared between the two marks._

## Gridded data

Contours can be derived for data that is already organized on a grid. For example, this [classic](https://observablehq.com/@d3/volcano-contours) digital elevation model of the [Maungawhau](https://en.wikipedia.org/wiki/Maungawhau) volcano is presented without longitude or latitude coordinates, but as a rectangular grid:

```js
Plot.contour(volcano.values, {width: volcano.width, height: volcano.height}).plot()
```

By default, each contour is rendered with a stroke of _currentColor_ and a stroke width of 1px. For filled contours instead, use the fill channel. And reverse the *y*-axis to place the first value in the top-left.

```js
Plot.contour(volcano.values, {
  width: volcano.width,
  height: volcano.height,
  fill: Plot.identity,
  stroke: "currentColor",
  thresholds: 20
}).plot({
  y: { reverse: true }
})
```

Similar to the [bin transform](../transforms/bin.md), the levels for which contours are computed can be specified either with the **interval** option (_e.g._, interval: 10 on the volcano elevation data means one contour every 10 meters); or with the **thresholds** option, which, if specified as a number, indicates an approximate number of contours. (See the [API documentation](https://github.com/observablehq/plot/blob/main/README.md#bin) for more details.)

## Sampled data

When the data is not on a grid, or when that grid is not rectangular (for example through the use of a [projection](../features/projections.md)), a spatial interpolation strategy can be specified; it defaults to _nearest_. The cell below reads the water vapor data for November 2022, downloaded from [NASA’s Earth Observations website](https://neo.gsfc.nasa.gov/view.php?datasetId=MYDAL2_M_SKY_WV) as a CSV grid with a coarse resolution of 360&times;180 values. The values are in centimeters.

```js
vapor = (await FileAttachment("MYDAL2_M_SKY_WV_2022-11-01_rgb_360x180.csv").csv({array: true}))
  .flat().map((x) => (x === "99999.0" ? NaN : +x))
```

```js
Plot.plot({
  width: 960,
  projection: "equal-earth",
  color: { scheme: "blues", legend: true, ticks: 6, nice: true, label: "Water vapor (cm)" },
  marks: [
    Plot.contour(vapor, {
      fill: Plot.identity,
      width: 360,
      height: 180,
      x1: -180,
      y1: 90,
      x2: 180,
      y2: -90,
      interval: 0.25,
      blur: 0.5,
      interpolate: "barycentric",
      stroke: "currentColor",
      strokeWidth: 0.5,
      clip: "sphere"
    }),
    Plot.sphere()
  ]
})
```

## Function sampling

Like the raster mark, the contour mark can sample values with a function of _x_ and _y_.

```js
Plot.plot({
  aspectRatio: 1,
  color: { type: "diverging", legend: true, label: "sin(x) cos(y)" },
  marks: [
    Plot.contour({
      fill: (x, y) => Math.sin(x) * Math.cos(y),
      x1: 0,
      y1: 0,
      x2: 4 * Math.PI,
      y2: 4 * Math.PI
    })
  ]
})
```

If the chart uses facets, the facet values are passed as the third argument of the function. Note that the levels are shared between the facets, ensuring consistency.

```js
{
  const lin = (x) => x / (4 * Math.PI);
  const { sin, cos } = Math;
  return Plot.plot({
    aspectRatio: 1,
    color: { type: "diverging" },
    fx: { tickFormat: (f) => f.name },
    fy: { tickFormat: (f) => f.name, reverse: true },
    marks: [
      Plot.contour({
        fill: (x, y, { fx, fy }) => fx(x) * fy(y),
        fx: [sin, sin, lin, lin],
        fy: [cos, lin, lin, cos],
        x1: 0,
        y1: 0,
        x2: 4 * Math.PI,
        y2: 4 * Math.PI,
        interval: 0.2
      }),
      Plot.frame()
    ]
  });
}
```

## Contour options

Renders contour polygons from spatial samples. If data is provided, it represents discrete samples in abstract coordinates *x* and *y*; the *value* channel specifies further abstract values (_e.g._, height in a topographic map) to be [spatially interpolated](#spatial-interpolation) to produce a [raster grid](#raster) of quantitative values, and lastly contours via marching squares.

```js
Plot.contour(volcano.values, {width: volcano.width, height: volcano.height, value: Plot.identity})
```

The *value* channel may alternatively be specified as a continuous function *f*(*x*, *y*) to be evaluated at each pixel centroid of the raster grid (without interpolation).

```js
Plot.contour({x1: 0, y1: 0, x2: 4, y2: 4, value: (x, y) => Math.sin(x) * Math.cos(y)})
```

The contour mark shares many options with the [raster](#raster) mark, including the **interpolate** option to specify the [spatial interpolation method](#spatial-interpolation). The interpolation method is ignored when the *value* channel is a function of *x* and *y*, and otherwise defaults to *nearest*. For smoother contours, the **blur** option (default 0) specifies a non-negative pixel radius for smoothing prior to applying marching squares. The **smooth** option (default true) specifies whether to apply linear interpolation after marching squares when computing contour polygons. The **thresholds** and **interval** options specify the contour thresholds; see the [bin transform](#bin) for details.

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

With the exception of the *x*, *y*, *x1*, *y1*, *x2*, *y2*, and *value* channels, the contour mark’s channels are not evaluated on the initial *data* but rather on the contour multipolygons generated in the initializer. For example, to generate filled contours where the color corresponds to the contour threshold value:

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
