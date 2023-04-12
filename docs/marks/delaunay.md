# Delaunay mark

The Delaunay marks compute the [Delaunay triangulation](https://en.wikipedia.org/wiki/Delaunay_triangulation), [Voronoi tessellation](https://en.wikipedia.org/wiki/Voronoi_diagram) (the dual of the Delaunay), and the [convex hull](https://en.wikipedia.org/wiki/Convex_hull) of a given set of two-dimensional points.

Given a set of points in **x** and **y**, the Voronoi diagram computes the region closest to each point, known as the point’s _Voronoi cell_ (or _Thiessen polygon_). The cell can be empty if another point shares the exact same coordinates. Together, the cells cover the entire plot. Voronoi diagrams can group related points with color, or for interaction, give a larger target for a **title** tooltip with details about the closest penguin to the pointer.

```js
Plot.plot({
  marks: [
    Plot.voronoi(penguins, {
      x: "culmen_depth_mm",
      y: "culmen_length_mm",
      fill: "species",
      title: "species",
      fillOpacity: 0.2,
      stroke: "white"
    }),
    Plot.dot(penguins, {
      x: "culmen_depth_mm",
      y: "culmen_length_mm",
      fill: "species",
      pointerEvents: "none"
    })
  ]
})
```

Each Voronoi cell is associated with a particular data point, and channels such as **stroke**, **fill**, **fillOpacity**, **strokeOpacity**, **href**, _etc._, work as they do on other marks, such as [dots](./dot.md).

The Voronoi diagram is clipped to the frame. To show the local density of a scatterplot, one can draw the whole boundary at once with the Plot.voronoiMesh mark. Given a constant **stroke**, the mesh mark will only draw the boundaries of the Voronoi cells once, whereas the default voronoi mark will draw shared boundaries twice. The mesh defaults to a **strokeWidth** of 1 and a **strokeOpacity** of 0.2.

```js
Plot.plot({
  marks: [
    Plot.voronoiMesh(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm"}),
    Plot.dot(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", fill: "species"})
  ]
})
```

The boundary between two neighboring Voronoi cells is a line segment defined by equal distance from their two respective points. The construction of the Voronoi diagram involves the computation of the Delaunay graph, which defines these neighbors. Use the Plot.delaunayMesh mark to draw the graph. As the following drawing illustrates, the Delaunay graph is computed separately for each color (specifying **z**, **stroke**, or **fill** creates independent series).

```js
Plot.plot({
  marks: [
    Plot.delaunayMesh(penguins, {
      x: "culmen_depth_mm",
      y: "culmen_length_mm",
      z: "species",
      stroke: "species"
    }),
    Plot.dot(penguins, {
      x: "culmen_depth_mm",
      y: "culmen_length_mm",
      fill: "species"
    })
  ]
})
```

Another derivative of the Delaunay graph is the convex hull of a set of points: the polygon with the minimum perimeter that contains all the points. The Plot.hull mark will draw this hull, again using **z**, **stroke**, or **fill** to specify each series.

```js
Plot.plot({
  marks: [
    Plot.hull(penguins, {
      x: "culmen_depth_mm",
      y: "culmen_length_mm",
      fill: "species",
      fillOpacity: 0.2
    }),
    Plot.dot(penguins, {
      x: "culmen_depth_mm",
      y: "culmen_length_mm",
      stroke: "species"
    })
  ]
})
```

In all cases, specifying an explicit **z** computes the mark with independent series. This is not recommended in the case of the voronoi and voronoiMesh marks (as it will result in an unreadable chart due to overlapping Voronoi diagrams), but it can be useful to color the links of the Delaunay graph based on some property, such as the body mass of penguins below. (Note however that the color is driven only by one arbitrary extremity of each edge; this might change in the future.)

```js
Plot.plot({
  color: {
    legend: true
  },
  marks: [
    Plot.delaunayLink(penguins, {
      x: "culmen_depth_mm",
      y: "culmen_length_mm",
      stroke: "body_mass_g",
      strokeWidth: 1.5
    })
  ]
})
```

These marks all work with one-dimensional charts:

```js
Plot.plot({
  marks: [
    Plot.voronoi(penguins, {
      x: "body_mass_g",
      fill: "species"
    }),
    Plot.voronoiMesh(penguins, {
      x: "body_mass_g",
      stroke: "white",
      strokeOpacity: 1
    })
  ]
})
```

## Delaunay options

Plot provides a handful of marks for Delaunay and Voronoi diagrams (using [d3-delaunay](https://github.com/d3/d3-delaunay) and [Delaunator](https://github.com/mapbox/delaunator)). These marks require the **x** and **y** channels to be specified.

## delaunayLink(*data*, *options*)

Draws links for each edge of the Delaunay triangulation of the points given by the **x** and **y** channels. Supports the same options as the [link mark](#link), except that **x1**, **y1**, **x2**, and **y2** are derived automatically from **x** and **y**. When an aesthetic channel is specified (such as **stroke** or **strokeWidth**), the link inherits the corresponding channel value from one of its two endpoints arbitrarily.

If a **z** channel is specified, the input points are grouped by *z*, and separate Delaunay triangulations are constructed for each group.

## delaunayMesh(*data*, *options*)

Draws a mesh of the Delaunay triangulation of the points given by the **x** and **y** channels. The **stroke** option defaults to _currentColor_, and the **strokeOpacity** defaults to 0.2. The **fill** option is not supported. When an aesthetic channel is specified (such as **stroke** or **strokeWidth**), the mesh inherits the corresponding channel value from one of its constituent points arbitrarily.

If a **z** channel is specified, the input points are grouped by *z*, and separate Delaunay triangulations are constructed for each group.

## hull(*data*, *options*)

Draws a convex hull around the points given by the **x** and **y** channels. The **stroke** option defaults to _currentColor_ and the **fill** option defaults to _none_. When an aesthetic channel is specified (such as **stroke** or **strokeWidth**), the hull inherits the corresponding channel value from one of its constituent points arbitrarily.

If a **z** channel is specified, the input points are grouped by *z*, and separate convex hulls are constructed for each group. If the **z** channel is not specified, it defaults to either the **fill** channel, if any, or the **stroke** channel, if any.

## voronoi(*data*, *options*)

Draws polygons for each cell of the Voronoi tesselation of the points given by the **x** and **y** channels.

If a **z** channel is specified, the input points are grouped by *z*, and separate Voronoi tesselations are constructed for each group.

## voronoiMesh(*data*, *options*)

Draws a mesh for the cell boundaries of the Voronoi tesselation of the points given by the **x** and **y** channels. The **stroke** option defaults to _currentColor_, and the **strokeOpacity** defaults to 0.2. The **fill** option is not supported. When an aesthetic channel is specified (such as **stroke** or **strokeWidth**), the mesh inherits the corresponding channel value from one of its constituent points arbitrarily.

If a **z** channel is specified, the input points are grouped by *z*, and separate Voronoi tesselations are constructed for each group.
