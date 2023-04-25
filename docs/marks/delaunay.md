<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, ref, shallowRef, onMounted} from "vue";
import penguins from "../data/penguins.ts";

const walmarts = shallowRef([]);
const us = shallowRef(null);
const nation = computed(() => us.value ? topojson.feature(us.value, us.value.objects.nation) : {type: null});

onMounted(() => {
  d3.tsv("../data/walmarts.tsv", d3.autoType).then((data) => (walmarts.value = data));
  d3.json("../data/us-counties-10m.json").then((data) => (us.value = data));
});

</script>

# Delaunay marks

Given set of points in **x** and **y**, the **Delaunay marks** compute the [Delaunay triangulation](https://en.wikipedia.org/wiki/Delaunay_triangulation), its dual the [Voronoi tessellation](https://en.wikipedia.org/wiki/Voronoi_diagram), and the [convex hull](https://en.wikipedia.org/wiki/Convex_hull).

The [voronoi mark](#voronoi-data-options) computes the region closest to each point (its *Voronoi cell*). The cell can be empty if another point shares the exact same coordinates. Together, the cells cover the entire plot. Voronoi diagrams can group related points with color, for example.

:::plot https://observablehq.com/@observablehq/plot-voronoi-scatterplot
```js
Plot.plot({
  color: {legend: true},
  marks: [
    Plot.voronoi(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", fill: "species", fillOpacity: 0.2, stroke: "var(--vp-c-bg)"}),
    Plot.frame(),
    Plot.dot(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", fill: "species"})
  ]
})
```
:::

Each cell is associated with a particular data point, and channels such as **stroke**, **fill**, **fillOpacity**, **strokeOpacity**, **href**, _etc._, work as they do on other marks, such as [dots](./dot.md).

To show the local density of a scatterplot, one can draw the whole boundary at once with [voronoiMesh](#voronoimesh-data-options). Whereas the [voronoi mark](#voronoi-data-options) will draw shared cell boundaries twice, the mesh will draw them only once.

:::plot https://observablehq.com/@observablehq/plot-voronoi-mesh
```js
Plot.plot({
  marks: [
    Plot.voronoiMesh(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm"}),
    Plot.dot(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", fill: "species"})
  ]
})
```
:::

The boundary between two neighboring Voronoi cells is a line segment defined by equal distance from their two respective points. The construction of the Voronoi diagram involves the computation of the Delaunay graph, which defines these neighbors. Use [delaunayMesh](#delaunaymesh-data-options) to draw the graph.

:::plot https://observablehq.com/@observablehq/plot-delaunay-mesh
```js
Plot.plot({
  marks: [
    Plot.delaunayMesh(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", z: "species", stroke: "species", strokeOpacity: 0.5}),
    Plot.dot(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", fill: "species"})
  ]
})
```
:::

As shown above, the Delaunay graph is computed separately for each color; specifying **z**, **stroke**, or **fill** creates independent series.

Another derivative of the Delaunay graph is the convex hull of a set of points: the polygon with the minimum perimeter that contains all the points. The [hull mark](#hull-data-options) will draw this hull.

:::plot defer https://observablehq.com/@observablehq/plot-convex-hull
```js
Plot.plot({
  marks: [
    Plot.hull(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", fill: "species", fillOpacity: 0.2}),
    Plot.dot(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", stroke: "species"})
  ]
})
```
:::

Using independent series is not recommended in the case of the voronoi and voronoiMesh marks as it will result in an unreadable chart due to overlapping Voronoi diagrams, but it can be useful to color the links of the Delaunay graph based on some property of data, such as the body mass of penguins below.

:::plot defer https://observablehq.com/@observablehq/plot-delaunay-links
```js
Plot.plot({
  color: {legend: true},
  marks: [
    Plot.delaunayLink(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", stroke: "body_mass_g", strokeWidth: 1.5})
  ]
})
```
:::

:::warning CAUTION
The link color is driven by one arbitrary extremity of each edge; this might change in the future.
:::

The Delaunay marks can be one-dimensional, too.

:::plot defer https://observablehq.com/@observablehq/plot-one-dimensional-voronoi
```js
Plot.plot({
  marks: [
    Plot.voronoi(penguins, {x: "body_mass_g", fill: "species"}),
    Plot.voronoiMesh(penguins, {x: "body_mass_g", stroke: "white", strokeOpacity: 1})
  ]
})
```
:::

The [Delaunay marks](../marks/delaunay.md) also work with Plot’s [projection system](../features/projections.md), as in this Voronoi diagram showing the distribution of Walmart stores in the contiguous United States.

:::plot defer
```js
Plot.plot({
  projection: "albers",
  marks: [
    Plot.geo(nation),
    Plot.dot(walmarts, {x: "longitude", y: "latitude", fill: "currentColor", r: 1}),
    Plot.voronoiMesh(walmarts, {x: "longitude", y: "latitude"})
  ]
})
```
:::

:::warning CAUTION
Distances between projected points are not exactly proportional to the corresponding distances on the sphere. This [creates a discrepancy](https://observablehq.com/@observablehq/planar-vs-spherical-voronoi) between the planar Voronoi diagram and its spherical counterpart. For greater accuracy, use [d3-geo-voronoi](https://github.com/Fil/d3-geo-voronoi) with the [geo mark](../marks/geo.md).
:::


## delaunayLink(*data*, *options*)

```js
Plot.delaunayLink(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm"})
```

Draws links for each edge of the Delaunay triangulation of the points given by the **x** and **y** channels. Supports the same options as the [link mark](./link.md), except that **x1**, **y1**, **x2**, and **y2** are derived automatically from **x** and **y**. When an aesthetic channel is specified (such as **stroke** or **strokeWidth**), the link inherits the corresponding channel value from one of its two endpoints arbitrarily.

If a **z** channel is specified, the input points are grouped by *z*, and separate Delaunay triangulations are constructed for each group.

## delaunayMesh(*data*, *options*)

```js
Plot.delaunayMesh(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm"})
```

Draws a mesh of the Delaunay triangulation of the points given by the **x** and **y** channels. The **stroke** option defaults to _currentColor_, and the **strokeOpacity** defaults to 0.2. The **fill** option is not supported. When an aesthetic channel is specified (such as **stroke** or **strokeWidth**), the mesh inherits the corresponding channel value from one of its constituent points arbitrarily.

If a **z** channel is specified, the input points are grouped by *z*, and separate Delaunay triangulations are constructed for each group.

## hull(*data*, *options*)

```js
Plot.hull(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm"})
```

Draws a convex hull around the points given by the **x** and **y** channels. The **stroke** option defaults to _currentColor_ and the **fill** option defaults to _none_. When an aesthetic channel is specified (such as **stroke** or **strokeWidth**), the hull inherits the corresponding channel value from one of its constituent points arbitrarily.

If a **z** channel is specified, the input points are grouped by *z*, and separate convex hulls are constructed for each group. If the **z** channel is not specified, it defaults to either the **fill** channel, if any, or the **stroke** channel, if any.

## voronoi(*data*, *options*)

```js
Plot.voronoi(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm"})
```

Draws polygons for each cell of the Voronoi tessellation of the points given by the **x** and **y** channels.

If a **z** channel is specified, the input points are grouped by *z*, and separate Voronoi tessellations are constructed for each group.

## voronoiMesh(*data*, *options*)

```js
Plot.voronoiMesh(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm"})
```

Draws a mesh for the cell boundaries of the Voronoi tessellation of the points given by the **x** and **y** channels. The **stroke** option defaults to _currentColor_, and the **strokeOpacity** defaults to 0.2. The **fill** option is not supported. When an aesthetic channel is specified (such as **stroke** or **strokeWidth**), the mesh inherits the corresponding channel value from one of its constituent points arbitrarily.

If a **z** channel is specified, the input points are grouped by *z*, and separate Voronoi tessellations are constructed for each group.
