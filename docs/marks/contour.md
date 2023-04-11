# Contour mark

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

When the data is not on a grid, or when that grid is not rectangular (for example through the use of a [projection](../maps.md)), a spatial interpolation strategy can be specified; it defaults to _nearest_. The cell below reads the water vapor data for November 2022, downloaded from [NASA’s Earth Observations website](https://neo.gsfc.nasa.gov/view.php?datasetId=MYDAL2_M_SKY_WV) as a CSV grid with a coarse resolution of 360&times;180 values. The values are in centimeters.

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
