# Centroid transform

Plot offers two helpers that derive centroids from GeoJSON geometries: the [centroid](https://github.com/observablehq/plot/blob/main/README.md#plotcentroidoptions) initializer, and the [geoCentroid](https://github.com/observablehq/plot/blob/main/README.md#plotgeocentroidoptions) transform.

Both can be used to position a symbol or a text label on a given geometry. While Plot.centroid computes the centroid of a geometry _after_ projection, Plot.geoCentroid computes it _before_ projection, then projects the resulting coordinates. This difference has a few implications.

Let’s begin with [**centroid**](https://github.com/observablehq/plot/blob/main/README.md#plotcentroidoptions). It is an [initializer](https://github.com/observablehq/plot/blob/main/README.md#initializers), and as such operates _after_ the geometries have been projected to screen coordinates. The resulting **x** and **y** channels reference the pixel coordinates of the planar centroid of the _projected_ shapes. No assumption is made about the geometries: they can be in any coordinate system, and the returned value is in the frame—as long as the projected geometry returns at least one visible point.

<!-- counties = FileAttachment("countyShapes.json").json() -->

```js
Plot.dot(counties.features, Plot.centroid()).plot({projection: "albers-usa"})
```

The centroid and geoCentroid transforms can be used by any mark that consumes the x and y channels, not only dots! For instance, to create labels for the counties whose names start with V—this is more interesting than it seems—, we use the [text](../marks/text.md) mark:

```js
Plot.plot({
  projection: "albers-usa",
  style: "overflow: visible",
  marks: [
    Plot.geo(counties, { strokeOpacity: 0.125, strokeWidth: 0.5 }),
    Plot.dot(
      counties.features,
      Plot.centroid({
        fill: "currentColor",
        stroke: "white",
        filter: (d) => d.properties.name.match(/^V/)
      })
    ),
    Plot.text(
      counties.features,
      Plot.centroid({
        text: (d) => d.properties.name,
        fill: "currentColor",
        stroke: "white",
        textAnchor: "start",
        dx: 4,
        filter: (d) => d.properties.name.match(/^V/)
      })
    )
  ]
})
```

Or, with the [voronoiMesh](../marks/delaunay.md) mark:

```js
Plot.voronoiMesh(counties.features, Plot.centroid()).plot({projection: "albers"})
```

---

The **[geoCentroid](https://github.com/observablehq/plot/blob/main/README.md#plotgeocentroidoptions)** transform is more specialized, as the **x** and **y** channels it derives represent the longitudes and latitudes of the centroids of the given GeoJSON geometries, before projection. It expects the geometries to be specified in _spherical_ coordinates. It is more correct, in a geospatial sense—for example, the spherical centroid always represents the center of mass of the original shape, and it will be rotated exactly in line with the projection’s rotate argument. However, this also means that it might land outside the frame if only a part of the land mass is visible, and might be clipped by the projection.

In practice, the difference is generally imperceptible. The map below shows how they are aligned (with the Albers-USA projection) for all the US counties… _but_ for the Aleutians West (dashed circle at the bottom-left). That county’s western-most islands happen to be clipped out by the projection; the geoCentroid (in pink) takes into account the hidden part, while the centroid (blue) focuses on the visible part.

```js
Plot.plot({
  marginLeft: 30,
  marginBottom: 30,
  projection: "albers-usa",
  inset: 3,
  marks: [
    Plot.frame(),
    Plot.dot(["O"], {
      frameAnchor: "bottom-left",
      strokeWidth: 1.2,
      fill: "white",
      fillOpacity: 0.9,
      stroke:"currentColor",
      strokeDasharray: 4,
      r: 38,
      dx: 12,
      dy: -20
    }),
    Plot.dot(counties.features, Plot.geoCentroid({ fill: "pink", r: 3.5 })),
    Plot.dot(
      counties.features,
      Plot.centroid({ stroke: "steelblue", title: (d) => d.properties.name })
    ),
    Plot.geo(
      counties.features.filter((d) => d.properties.name === "Aleutians West"),
      { dy: 3 } // cheat a bit to make the problem more visible
    )
  ]
})
```

The geoCentroid transform is slightly faster than the centroid initializer—which might be useful if you have tens of thousands of features and want to show their density on a [hexbin map](https://observablehq.com/@observablehq/plot-mapping):

```js
Plot.dot(counties.features, Plot.hexbin({r:"count"}, Plot.geoCentroid())).plot({projection: "albers"})
```
