# Observable Plot - Changelog

Year: **Current (2025)** · [2024](./CHANGELOG-2024.md) · [2023](./CHANGELOG-2023.md) · [2022](./CHANGELOG-2022.md) · [2021](./CHANGELOG-2021.md)

## 0.6.17

[Released TDB, 2025.](https://github.com/observablehq/plot/releases/tag/v0.6.17)

The **clip** option now supports GeoJSON 🌎 in addition to the usual *frame* and *sphere* options. This allows to limit the visual scope of marks that otherwise interpolate across the whole frame. For instance, we can clip this voronoi mesh of all world airports to the land feature:

[<img src="./img/airports-clip-land.png" width="708" alt="a map of world airports with a voronoi mesh clipped to land">](XXXXX)

```js
Plot.plot({
  projection: { type: "orthographic", rotate: [110, -50] },
  marks: [
    Plot.dot(airports, { x: "longitude", y: "latitude", fill: "red", r: 1 }),
    Plot.voronoiMesh(airports, { x: "longitude", y: "latitude", clip: land }),
    Plot.sphere(),
    Plot.geo(land)
  ]
})
```

The clipping GeoJSON is rendered as a SVG [`clipPath`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath), with the same path that would be produced by the [geo](https://observablehq.com/plot/marks/geo) mark — respecting the plot’s top-level **projection** option, if any. For performance, the `clipPath` is shared across marks clipped with the same object.

For example, this combination of a [raster]() mark and a [contour]() mark shows atmospheric water vapor measurements from [NASA Earth Observations](https://neo.gsfc.nasa.gov/view.php?datasetId=MYDAL2_M_SKY_WV), across the US.

[<img src="./img/vapor-clip-us.png" width="708" alt="a map of water vapor measurements">](XXXXX)

The code for this map is too long to reproduce here (click on the image above for the complete code); the crucial part is the `clip: nation` option, that allows to censor the (absurd) values that would otherwise be interpolated between Alaska, Southern California and Hawai’i.

```js
Plot.raster(vapor, {
  fill: Plot.identity,
  width: 360,
  height: 180,
  x1: -180,
  y1: 90,
  x2: 180,
  y2: -90,
  interpolate: "barycentric",
  blur: 10,
  clip: nation
}).plot()
```

This option is not restricted to geographic shapes. For example, to show the value of [Math.atan2](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2) over the unit circle:

[<img src="./img/unit-circle-atan2.png" width="332" alt="the value of Math.atan2 on the unit circle">](XXXXX)

```js
Plot.raster({
  x1: -1,
  x2: 1,
  y1: -1,
  y2: 1,
  fill: (x, y) => Math.atan2(y, x),
  clip: {
    type: "Polygon",
    coordinates: [
      d3.range(0, 2 * Math.PI, 0.1).map((angle) => d3.pointRadial(angle, 1))
    ]
  }
}).plot({ width: 300, aspectRatio: 1 })
```

Waffle mark improvements.

---

For earlier changes, continue to the [2024 CHANGELOG](./CHANGELOG-2024.md).
