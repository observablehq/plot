<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import walmarts from "./data/walmarts.ts";
import {counties, nation, statemesh, states} from "./data/us-counties-10m.ts";
import elections from "./data/us-presidential-election-2020.ts";

const lookup = d3.index(counties.features, (d) => d.id);

</script>

# Mapping with Plot

To make a map, follow the order of things described by the painter Wassily Kandinsky in _Point and Line to Plane_ ([1926](https://www.wassilykandinsky.net/book-117.php)): lay out your planes (areas, filled polygons), draw lines above them (contours, arrows), then finally put dots on top. (You can add labels, too.)

Plot’s **projection** option is going to be your paint tool. Where classic charts are concerned, the **x** and **y** axes are independent, and generally represent different dimensions of the data, with different types of scales. Once a projection is set in Plot, though, it takes over the x and y dimensions, which now _jointly_ represent a location on a surface (flat, or spherical). For any location on that surface, the projection function will indicate the corresponding position on the map.

In practice, the ⟨_x_, _y_⟩ pair denotes the horizontal and vertical coordinates of a point, for planar geometries; and for spherical geometries, it corresponds to the _longitude_ and _latitude_, in degrees. The projection you select will determine where and how geometries in that space will be drawn on the screen.

## Geometries

The [**geo**](./marks/geo.md) mark draws geographic features, such as polygons and lines, connecting points through the shortest path (which, on the sphere, is not a straight line, but a geodesic or “great circle” line). We use this mark to show the outline of the contiguous United States—the canvas on which we’ll make maps in this notebook.

:::plot defer
```js
Plot.plot({
  projection: "albers",
  marks: [Plot.geo(nation), Plot.geo(statemesh, { strokeOpacity: 0.2 })]
})
```
:::

## Everything is spatial

As they flow through the same projection, all the point-based marks work in unison. Whether you are using the **geo** mark, the **dot**, **text**, and **image** marks, a given location will be represented in the same position. The **line** mark will work too, connecting dots in a straight (or curved) line. Even complex marks such as **density**, **hexbin**, **voronoi**… operate on the projected coordinates. Marks such as **arrow**, **link** or **rect**, that work with pairs of coordinates x1, x2, y1, and y2, are also supported.

_Note:_ Marks that expect _x_ or _y_ to be ordinal scales, such as bars, cells, or ticks, cannot be used in conjunction with projections.

## Dots (& symbols)

To plot locations as dots on a map, use [the dot mark](./marks/dot.md), passing longitudes as the **x** channel and latitudes as the **y** channel. All the options of dot can be used, like for example the **stroke** color for each dot, or the **symbol** channel. The map below represents the opening year of every Walmart store in the contiguous United States.

:::plot defer
```js
Plot.plot({
  width: 960,
  height: 600,
  projection: "albers",
  color: {
//    legend: true,
    label: "Opening year"
  },
  marks: [
    Plot.geo(nation),
    Plot.geo(statemesh, {strokeOpacity: 0.2}),
    Plot.dot(walmarts, {x: "longitude", y: "latitude", stroke: "date", symbol: "square"})
  ]
})
```
:::

:::warning
TODO legend: true crashes with `TypeError: canvas.getContext is not a function`
:::

## Facets

In conjunction with facets, the dot mark tells the same story as a comic strip (“small multiples”), where each facet plots the new stores opened in every decade:

:::plot defer
```js
Plot.plot({
  width: 960,
  height: 150,
  marginLeft: 0,
  marginRight: 0,
  projection: "albers",
  fx: { tickFormat: (d) => `${d}’s`, padding: 0 },
  facet: { data: walmarts, x: (d) => Math.floor(d.date.getUTCFullYear() / 10) * 10 },
  marks: [
    Plot.geo(statemesh, { clip: "frame", strokeOpacity: 0.1 }),
    Plot.dot(walmarts, { x: "longitude", y: "latitude", r: 1, fill: "currentColor" }),
    Plot.geo(nation, { clip: "frame" })
  ]
})
```
:::

## Voronoi

The
[Plot.voronoi and Plot.delaunay marks](https://observablehq.com/@observablehq/plot-voronoi)
happily consume the projected coordinates (in screen/pixel space). For example,
this voronoiMesh mark draws the catchment area of each store:

:::plot defer
```js
Plot.plot({
  width: 960,
  height: 600,
  projection: "albers",
  marks: [
    Plot.geo(nation),
    Plot.dot(walmarts, {x: "longitude", y: "latitude", fill: "currentColor", r: 1}),
    Plot.voronoiMesh(walmarts, {x: "longitude", y: "latitude"})
  ]
})
```
:::

_A note for purists (including us)._ Distances between projected points are
not—and cannot be—exactly proportional to the corresponding distances on the
sphere. This creates a discrepancy between the planar Voronoi diagram and its
spherical counterpart. For more accuracy, you may want to try
[d3-geo-voronoi](https://github.com/Fil/d3-geo-voronoi)—and let Plot.geo draw
its outputs (see [Planar vs. Spherical Voronoi](https://observablehq.com/@observablehq/planar-vs-spherical-voronoi) for details).


### Hexbin

Hexagonal bins, based on the projected coordinates. See
[Plot.hexbin](https://observablehq.com/@observablehq/plot-hexbin) for details. Hexbins have a great visual appeal, but be aware that the underlying statistics are usually to be taken with a grain of salt. At any scale, geographic binning suffers from the
[MAUP](https://en.wikipedia.org/wiki/Modifiable_areal_unit_problem). On a small scale map, this is compounded by the Earth’s curvature, which makes it impossible to create an accurate and regular grid. At any rate, prefer an equal-area projection to makes the different regions of the map comparable.

:::plot defer
```js
Plot.plot({
  width: 975,
  projection: "albers",
  r: {
    range: [0, 20]
  },
  color: {
    // legend: true,
    label: "First year opened",
    scheme: "spectral"
  },
  marks: [
    Plot.geo(statemesh, { strokeOpacity: 0.25 }),
    Plot.geo(nation),
    Plot.dot(
      walmarts,
      Plot.hexbin(
        { r: "count", fill: "min" },
        { x: "longitude", y: "latitude", fill: "date" }
      )
    )
  ]
})
```
:::

:::warning
TODO legend: true
:::

### Density

Plot.density… just works. See
[Plot.density](https://observablehq.com/@observablehq/plot-density) for details. On a small-scale map showing the whole globe, you might have to clip the results. And, because the density is computed on the projected coordinates, it is recommended to use an equal-area projection to limit distortion.

:::plot defer
```js
Plot.plot({
  width: 960,
  height: 600,
  projection: "albers",
  color: {
    scheme: "blues"
  },
  marks: [
    void Plot.density(walmarts, {
      x: "longitude",
      y: "latitude",
      bandwidth: 12,
      fill: "density"
    }),
    Plot.dot(walmarts, {
      x: "longitude",
      y: "latitude",
      r: 1,
      fill: "currentColor"
    }),
    Plot.geo(statemesh, { strokeOpacity: 0.3 }),
    Plot.geo(nation)
  ]
})
```
:::

:::warning
TODO fix density mark, crashes with `TypeError: Cannot set property parentNode of #<Node> which has`.
:::

## Text

Use the **text** mark to draw labels. The _stroke_ option helps to detach the text from the background noise, and the _textAnchor_ and _dx_, _dy_ options to adjust their placement. Here, we use the [centroid](https://observablehq.com/@observablehq/plot-centroid) transform to position the text labels in the middle of each feature.

:::plot defer
```js
Plot.plot({
  projection: "albers",
  marks: [
    Plot.geo(statemesh, { clip: "frame", strokeOpacity: 0.1 }),
    Plot.geo(nation, { clip: "frame" }),
    Plot.text(
      states.features,
      Plot.centroid({
        text: (d) => d.properties.name,
        textAnchor: "middle",
        stroke: "white",
        fill: "black"
      })
    )
  ]
})
```
:::

## Vectors

Did we mention [vectors](https://observablehq.com/@observablehq/plot-vector)? The map below shows the margin by which the winner of the US presidential election of 2020 won the vote in each county. The arrow’s length encodes the difference in votes, and the orientation and color show who won (<svg width=12 height=12 viewBox="-11 -11 12 12" style="display: inline-block"><path d="M0,0l-10,-6m1,3.28l-1,-3.28l3.28,-1" stroke="blue"></path></svg> for the Democratic candidate, and <svg width=12 height=12 viewBox="0 -11 12 12" style="display: inline-block"><path d="M0,0l10,-6m-1,3.28l1,-3.28l-3.28,-1" stroke="red"></path></svg> for the Republican candidate).

:::plot defer
```js
Plot.plot({
  projection: "albers-usa",
  width: 975,
  marks: [
    Plot.geo(statemesh, { strokeWidth: 0.75 }),
    Plot.geo(nation),
    Plot.vector(
      elections,
      Plot.centroid({
        filter: (d) => d.votes > 0,
        anchor: "start",
        geometry: (d) => lookup.get(d.fips),
        sort: (d) => Math.abs(+d.results_trumpd - +d.results_bidenj),
        stroke: (d) => +d.results_trumpd > +d.results_bidenj ? "red" : "blue",
        length: (d) => Math.sqrt(Math.abs(+d.margin2020 * +d.votes)),
        rotate: (d) => (+d.results_bidenj < +d.results_trumpd ? 60 : -60)
      })
    )
  ]
})
```
:::

:::warning
TODO fix vector mark which doesn't render.
:::

## More marks: image, rect, link, arrow, line

Projections can work with any mark that consumes continuous *x* and *y* channels—as well as marks that use *x1* and *y1*, *x2* and *y2*. Use the [image](./marks/image.md) mark to center an image at the given location. The [arrow](./marks/arrow.md) and [link](./marks/link.md) marks connect two points, and can be used in thematic mapping to express, say, trade flows between countries. The [rect](./marks/rect.md) mark creates a rectangle from two opposite corners, and can be used to draw a selection (brush), an inset, a bounding-box…


---

### Appendix

To learn more about this topic, see our hands-on tutorials: [Build your first map with Observable Plot](https://observablehq.com/@observablehq/build-your-first-map-with-observable-plot), and [Build your first choropleth map with Observable Plot](https://observablehq.com/@observablehq/build-your-first-choropleth-map-with-observable-plot).

The datasets used on this page respectively contain the locations and opening dates of all the Walmart stores in the contiguous US; and the winner and margin in each county in the U.S. presidential election of 2020. We load and process a TopoJSON file describing the counties and states.
