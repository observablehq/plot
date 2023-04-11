# Delaunay

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

Each Voronoi cell is associated with a particular data point, and channels such as **stroke**, **fill**, **fillOpacity**, **strokeOpacity**, **href**, _etc._, work as they do on other marks, such as [dots](/@observablehq/plot-dot).

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
