# Observable Plot - Changelog [2022]

Year: [Current (2024)](./CHANGELOG.md) · [2023](./CHANGELOG-2023.md) · **2022** · [2021](./CHANGELOG-2021.md)

## 0.6.1

[Released December 12, 2022.](https://github.com/observablehq/plot/releases/tag/v0.6.1)

The new [geo mark](https://observablehq.com/plot/marks/geo) renders GeoJSON geometries such as polygons, lines, and points. Together with Plot’s new [projection system](https://observablehq.com/plot/features/projections), Plot can now produce [thematic maps](https://observablehq.com/@observablehq/plot-mapping). For example, the choropleth map below shows unemployment rates by U.S. county.

[<img src="./img/choropleth.png" width="640" alt="A choropleth of unemployment rate by U.S. county">](https://observablehq.com/plot/marks/geo)

```js
Plot.geo(counties, {fill: (d) => d.properties.unemployment}).plot({
  projection: "albers-usa",
  color: {
    type: "quantile",
    n: 8,
    scheme: "blues",
    label: "Unemployment (%)",
    legend: true
  }
})
```

The new top-level [**projection** option](https://observablehq.com/plot/features/projections) controls how geometric coordinates are transformed to the screen and supports a variety of common geographic projections, including the composite U.S. Albers projection shown above, the Equal Earth projection, the Mercator projection, the orthographic and stereographic projections, several conic and azimuthal projections, among others. Projections can be fit to geometry using the projection.**domain** option, and rotated to an arbitrary aspect using the projection.**rotate** option.

[<img src="./img/orthographic.png" width="640" alt="A world map using the orthographic projection, centered somewhere around San Antonio, Texas">](https://observablehq.com/plot/features/projections)

```js
Plot.plot({
  height: 640,
  inset: 1,
  projection: {type: "orthographic", rotate: [100, -30]},
  marks: [
    Plot.graticule(),
    Plot.geo(land, {fill: "currentColor"}),
    Plot.sphere()
  ]
})
```

The new graticule convenience mark renders meridians and parallels (lines of constant longitude and latitude), while the sphere convenience mark draws the outline of the sphere.

Plot’s projection system works automatically with most of Plot’s mark types, including dots, vectors, lines, and rects. For geographic projections, *x* represents longitude and *y* represents latitude. For example, the map below uses vectors to show county-level vote margins in the 2020 U.S. presidential election: a margin for Biden is shown as a blue left-pointing arrow, while a margin for Trump is shown as a red right-pointing arrow; the length of the arrow is proportional to the margin.

[<img src="./img/vector-map.png" width="640" alt="An arrow map showing the county-level vote margins in the 2020 U.S. presidential election; a margin for Biden is shown as a blue left-pointing arrow, and a margin for Trump is shown as a red right-pointing arrow">](https://observablehq.com/@observablehq/plot-mapping)

```js
Plot.plot({
  width: 975,
  projection: "albers-usa",
  marks: [
    Plot.geo(statemesh, {strokeOpacity: 0.25}),
    Plot.geo(nation),
    Plot.vector(elections, {
      filter: (d) => d.votes > 0,
      anchor: "start",
      x: (d) => centroids.get(d.fips)?.[0],
      y: (d) => centroids.get(d.fips)?.[1],
      sort: (d) => Math.abs(d.results_trumpd - d.results_bidenj),
      stroke: (d) => (d.results_trumpd > d.results_bidenj ? "red" : "blue"),
      length: (d) => Math.sqrt(Math.abs(d.margin2020 * d.votes)),
      rotate: (d) => (d.results_bidenj < d.results_trumpd ? 60 : -60)
    })
  ]
})
```

For the [line mark](https://observablehq.com/plot/marks/line), the specified projection doesn’t simply project control points; the projection has full control over how geometry is transformed from its native coordinate system (often spherical) to the screen. This allows line geometry to be represented as [geodesics](https://en.wikipedia.org/wiki/Geodesic), which are sampled and clipped during projection. For example, the map below shows the route of Charles Darwin’s voyage on the HMS *Beagle*; note that the line is cut when it crosses the antimeridian in the Pacific ocean. (Also note the use of the *stroke* channel to vary color.)

[<img src="./img/beagle.png" width="640" alt="A map of the route of the HMS Beagle, 1831–1836; color indicates direction, with the ship initially departing London and heading southwest before circumnavigating the globe">](https://observablehq.com/plot/marks/geo)

```js
Plot.plot({
  projection: "equal-earth",
  marks: [
    Plot.geo(land, {fill: "currentColor"}),
    Plot.graticule(),
    Plot.line(beagle, {stroke: (d, i) => i, z: null, strokeWidth: 2}),
    Plot.sphere()
  ]
})
```

Plot’s new geo mark and projection system work with Plot’s other core features, including scales, legends, faceting, and transforms. For example, here is a faceted dot map showing openings of Walmart stores over five decades.

[<img src="./img/faceted-map.png" width="930" alt="A dot map of Walmart store openings faceted by decade">](https://observablehq.com/@observablehq/plot-mapping)

```js
Plot.plot({
  width: 975,
  projection: "albers",
  fx: {tickFormat: (d) => `${d}’s`},
  facet: {data: walmarts, x: (d) => Math.floor(d.date.getUTCFullYear() / 10) * 10},
  marks: [
    Plot.geo(statemesh, {strokeOpacity: 0.1}),
    Plot.dot(walmarts, {x: "longitude", y: "latitude", r: 1, fill: "currentColor"}),
    Plot.geo(nation)
  ]
})
```

As another example using the same dataset, the map below uses the hexbin transform to aggregate Walmart store opening into local hexagons.

[<img src="./img/hexbin-map.png" width="640" alt="A bivariate hexbin map of Walmart store openings; within each hexagonal area, size indicates the number of Walmart store openings, and color indicates the year of the first opening">](https://observablehq.com/@observablehq/plot-mapping)

```js
Plot.plot({
  projection: "albers",
  color: {
    legend: true,
    label: "First year opened",
    scheme: "spectral"
  },
  marks: [
    Plot.geo(statemesh, {strokeOpacity: 0.25}),
    Plot.geo(nation),
    Plot.dot(walmarts, Plot.hexbin({r: "count", fill: "min"}, {x: "longitude", y: "latitude", fill: "date"}))
  ]
})
```

In addition to the included basic projections, Plot’s projection system can be extended using any projection implementation compatible with D3’s [projection stream interface](https://d3js.org/d3-geo/stream). This includes all the projections provided by the [d3-geo-projection](https://github.com/d3/d3-geo-projection) and [d3-geo-polygon](https://github.com/d3/d3-geo-polygon) libraries! For example, here is a world map using Goode’s interrupted homolosine projection.

[<img src="./img/goode.png" width="640" alt="A world map using Goode’s interrupted homolosine projection">](https://observablehq.com/@observablehq/plot-extended-projections)

```js
Plot.plot({
  width: 975,
  height: 424,
  inset: 1,
  projection: {
    type: d3.geoInterruptedHomolosine,
    domain: {type: "Sphere"}
  },
  marks: [
    Plot.geo(land, {clip: "sphere", fill: "currentColor"}),
    Plot.graticule({clip: "sphere"}),
    Plot.sphere()
  ]
})
```

Plot now supports [mark-level faceting](https://observablehq.com/plot/features/facets#mark-facet-options) via the new *mark*.**fx** and *mark*.**fy** options. Mark-level faceting makes it easier to control which marks are faceted (versus repeated across facets), especially when combining multiple datasets or specifying faceted annotations.

[<img src="./img/anscombe.png" width="640" alt="A faceted scatterplot of Anscombe’s quartet">](https://observablehq.com/plot/features/facets)

```js
Plot.plot({
  grid: true,
  height: 180,
  marks: [Plot.frame(), Plot.dot(anscombe, {x: "x", y: "y", fx: "series"})]
})
```

When mark-level faceting is used, the mark will be faceted if either the *mark*.**fx** or *mark*.**fy** channel option (or both) is specified. As before, you can set the *mark*.**facet** option to null or false option will disable faceting, or to *exclude* to draw the subset of the mark’s data not in the current facet.

In addition to the above new features, this release also includes a variety of bug fixes. The *fx* and *fy* scales now support the *scale*.**transform** and *scale*.**percent** options. The *quantize* scale now respects the *scale*.**unknown** option. Initializers (including dodge and hexbin) no longer unintentionally drop the *mark*.**sort** option when being used to sort a scale’s domain. The error message when an invalid color scheme is specified has been improved. Plot no longer warns about empty strings appearing to be numbers. The *mean* and *median* reducers now return dates if the data is temporal. The default **height** now adjusts automatically to preserve the inner size of the plot when margins are specified. Fix the position of the frame anchor when either the *x* or *y* scale is ordinal (band or point). Dots with a negative constant radius *r* are no longer rendered rather than generating invalid SVG.

## 0.6.0

[Released September 7, 2022.](https://github.com/observablehq/plot/releases/tag/v0.6.0)

[<img src="./img/window-strict.png" width="640" alt="A smoothed line chart of Apple’s stock price">](https://observablehq.com/plot/transforms/window)

```js
Plot.plot({
  marks: [
    Plot.lineY(aapl, {x: "Date", y: "Close", stroke: "#ccc", strokeWidth: 1}),
    Plot.lineY(aapl, Plot.windowY({k: 20, strict: false}, {x: "Date", y: "Close", stroke: "red"})),
    Plot.lineY(aapl, Plot.windowY({k: 20, strict: true}, {x: "Date", y: "Close"}))
  ]
})
```

[breaking] [Plot.window](https://observablehq.com/plot/transforms/window#window), [Plot.windowX](https://observablehq.com/plot/transforms/window#windowX) and [Plot.windowY](https://observablehq.com/plot/transforms/window#windowY) now return an aggregate value even when the window contains undefined values, for example at the beginning or end of a series. Set the new **strict** option to true to instead return undefined if the window contains any undefined values.

Parts of the README have been incorporated throughout the codebase as JSDoc comments. This allows IDEs to display the documentation as tooltips.

## 0.5.2

[Released July 4, 2022.](https://github.com/observablehq/plot/releases/tag/v0.5.2)

Swatches legends are now rendered in SVG, supporting patterns and gradients. Swatches legends now require an *ordinal*, *categorical*, or *threshold* color scale and will throw an error if you attempt to use them with an unsupported color scale type (such as a *linear* or *diverging* scale).

The new top-level **document** option specifies the [document](https://developer.mozilla.org/en-US/docs/Web/API/Document) used to create plot elements. It defaults to window.document, but can be changed to another document, say when using a virtual DOM library for server-side rendering in Node.

Plot now uses D3 7.6.1, using [d3.blur2](https://observablehq.com/@d3/d3-blur) for a faster blur operator supporting fractional bandwidths when computing density contours. Plot now uses a duck test to detect marks (rather than strict instanceof), allowing marks from different versions of Plot to be combined into a single plot. Plot is now partially written in TypeScript. In the future, Plot will be written entirely in TypeScript and will export TypeScript type definition files to assist Plot development.

## 0.5.1

[Released June 27, 2022.](https://github.com/observablehq/plot/releases/tag/v0.5.1)

The new [density mark](https://observablehq.com/plot/marks/density) creates contours representing the [estimated density](https://en.wikipedia.org/wiki/Multivariate_kernel_density_estimation) of two-dimensional point clouds. The **bandwidth** and number of **thresholds** are configurable.

[<img src="./img/density-contours.png" width="640" alt="A scatterplot showing the relationship between the idle duration and eruption duration for Old Faithful">](https://observablehq.com/plot/marks/density)

```js
Plot.plot({
  inset: 20,
  marks: [
    Plot.density(faithful, {x: "waiting", y: "eruptions", stroke: "steelblue", strokeWidth: 0.25}),
    Plot.density(faithful, {x: "waiting", y: "eruptions", stroke: "steelblue", thresholds: 4}),
    Plot.dot(faithful, {x: "waiting", y: "eruptions", fill: "currentColor", r: 1.5})
  ]
})
```

By default, as shown above, the density is represented by contour lines. By setting the **fill** option to *density*, you can draw filled regions with a sequential color encoding instead.

[<img src="./img/density-fill.png" width="640" alt="A contour plot showing the relationship between diamond price and weight">](https://observablehq.com/plot/marks/density)

```js
Plot.density(diamonds, {x: "carat", y: "price", fill: "density"}).plot({
  height: 500,
  grid: true,
  x: {type: "log"},
  y: {type: "log"},
  color: {scheme: "ylgnbu"}
})
```

The new [linear regression marks](https://observablehq.com/plot/marks/linear-regression) produce [linear regressions](https://en.wikipedia.org/wiki/Linear_regression) with [confidence interval](https://en.wikipedia.org/wiki/Confidence_interval) bands, representing the estimated relation of a dependent variable (typically *y*) on an independent variable (typically *x*).

[<img src="./img/linear-regression.png" width="640" alt="a scatterplot of penguin culmens, showing the length and depth of several species, with linear regression models by species and for the whole population, illustrating Simpson’s paradox">](https://observablehq.com/plot/marks/linear-regression)

```js
Plot.plot({
  grid: true,
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species"}),
    Plot.linearRegressionY(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "species"}),
    Plot.linearRegressionY(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```

The new [Delaunay and Voronoi marks](https://observablehq.com/plot/marks/delaunay) produce Delaunay triangulations and Voronoi tesselations: [Plot.delaunayLink](https://observablehq.com/plot/marks/delaunay#delaunayLink) draws links for each edge of the Delaunay triangulation of the given points, [Plot.delaunayMesh](https://observablehq.com/plot/marks/delaunay#delaunayMesh) draws a mesh of the Delaunay triangulation  of the given points, [Plot.hull](https://observablehq.com/plot/marks/delaunay#hull) draws a convex hull around the given points, [Plot.voronoi](https://observablehq.com/plot/marks/delaunay#voronoi) draws polygons for each cell of the Voronoi tesselation of the given points, and [Plot.voronoiMesh](https://observablehq.com/plot/marks/delaunay#voronoiMesh) draws a mesh for the cell boundaries of the Voronoi tesselation of the given points.

[<img src="./img/voronoi.png" width="640" alt="a Voronoi diagram of penguin culmens, showing the length and depth of several species">](https://observablehq.com/plot/marks/delaunay)

```js
Plot.plot({
  marks: [
    Plot.voronoi(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", fill: "species", fillOpacity: 0.2, stroke: "white"}),
    Plot.dot(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm", fill: "species"})
  ]
})
```

For data at regular intervals, such as integer values or daily samples, the new [*scale*.**interval** option](https://observablehq.com/plot/features/scales#interval) can be used to enforce uniformity. The specified *interval*—such as d3.utcMonth—sets the default *scale*.transform to the given interval’s *interval*.floor function. In addition, for ordinal scales the default *scale*.**domain** is an array of uniformly-spaced values spanning the extent of the values associated with the scale.

All marks now support the **pointerEvents** option to set the [pointer-events attribute](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events). The frame decoration mark now supports the **rx** and **ry** options. The cell mark now respects the **dx** and **dy** options.

Fix a bug where arrow heads would not render correctly when the **strokeWidth** was exactly one. Fix the *scale*.**zero** option when the domain is negative. Fix the **clip** mark option when *x* or *y* is a *band* scale. Fix the fill color of text marks using the **href** option. Fix a crash in the bar and tick mark when the associated band scale is not present, as when these marks are used (erroneously) with the dodge transform. Use *element*.appendChild instead of *element*.append for the benefit of DOM implementations that do not support the full DOM standard.

Improve the error message when the **facet** option is used without **data**. Throw an error if initializers attempt to create position scales. Throw an error if an implicit ordinal position domain has more than 10,000 values.

[breaking] Plot now requires [D3 ^7.5.0](https://github.com/d3/d3/releases/tag/v7.5.0).

## 0.5.0

[Released June 7, 2022.](https://github.com/observablehq/plot/releases/tag/v0.5.0)

Plot now supports [mark initializers](https://observablehq.com/plot/features/transforms#custom-initializers) via the **initializer** option. Initializers can transform data, channels, and indexes. Unlike [data transforms](https://observablehq.com/plot/features/transforms) which operate in abstract data space, initializers can operate in screen space such as pixel coordinates and colors. For example, initializers can modify a marks’ positions to avoid occlusion. The new hexbin and dodge transforms are implemented as mark initializers.

The new [hexbin transform](https://observablehq.com/plot/transforms/hexbin) functions similarly to the bin transform, except it aggregates both *x* and *y* into hexagonal bins before reducing. The size of the hexagons can be specified with the **binWidth** option, which controls the width of the (pointy-topped) hexagons.

[<img src="./img/hexbin.png" width="640" alt="a chart showing the inverse relationship of fuel economy to engine displacement, and the positive correlation of engine displacement and weight; hexagonal bins of varying size represent the number of cars at each location, while color encodes the mean weight of nearby cars">](https://observablehq.com/plot/transforms/hexbin)

```js
Plot.plot({
  color: {
    legend: true
  },
  marks: [
    Plot.hexagon(
      cars,
      Plot.hexbin(
        {r: "count", fill: "mean"},
        {x:  "displacement (cc)", y: "economy (mpg)", fill: "weight (lb)"}
      )
    )
  ]
})
```

The new [dodge transform](https://observablehq.com/plot/transforms/dodge) can be used to produce beeswarm plots. Given an *x* channel representing the desired horizontal position of circles, the dodgeY transform derives a new *y* (vertical position) channel such that the circles do not overlap; the dodgeX transform similarly derives a new *x* channel given a *y* channel.

[<img src="./img/dodge-random.png" width="640" alt="a beeswarm chart showing a random normal distribution; each of 800 samples is represented by a dot positioned along the x-axis, stacked on top of the y-axis like grains of sand">](https://observablehq.com/plot/transforms/dodge)

```js
Plot.plot({
  height: 320,
  x: {
    domain: [-3, 3]
  },
  marks: [
    Plot.dotX(Array.from({length: 800}, d3.randomNormal()), Plot.dodgeY())
  ]
})
```

If an *r* channel is specified, the circles may have varying radius. By default, the dodge transform sorts the input data by descending radius, such that the largest circles are placed first. The order of placement greatly affects the resulting layout; to change the placement order, use the standard mark **sort** option.

[<img src="./img/dodge.png" width="640" alt="a chart showing the monthly percent change in travel by U.S. county in March 2020 after the coronavirus outbreak; each county is represented as a circle with area proportional to its population, positioned according to the change in travel; most counties, and especially those with stay-at-home orders, show a significant reduction in travel">](https://observablehq.com/plot/transforms/dodge)

```js
Plot.plot({
  height: 400,
  x: {
    domain: [-100, -20],
    percent: true,
    label: "← Reduction in travel (%)"
  },
  r: {
    range: [0, 20]
  },
  color: {
    legend: true,
    tickFormat: d => d ? "lockdown" : "no lockdown"
  },
  marks: [
    Plot.dot(lockdown, Plot.dodgeY("middle", {x: "pct_change", r: "pop", fill: "in_lockdown"}))
  ]
})
```

When using the dodgeY transform, you should set the height of your plot explicitly; otherwise dots may be drawn outside the canvas. You can also adjust the **range** of the *r* scale to produce denser beeswarms.

[breaking] Color scales with diverging color schemes now default to the *diverging* scale type instead of the *linear* scale type. This includes the *brbg*, *prgn*, *piyg*, *puor*, *rdbu*, *rdgy*, *rdylbu*, *rdylgn*, *spectral*, *burd*, and *buylrd* schemes. If you want to use a diverging color scheme with a linear color scale, set the scale **type** option to *linear*. Color scales will also default to diverging if the scale **pivot** option is set. (For diverging scales, the pivot defaults to zero.)

The [sort transform](https://observablehq.com/plot/transforms/sort) now supports sorting on an existing channel, avoiding the need to duplicate the channel definition. For example, to sort dots by ascending radius:

~~~js
Plot.dot(earthquakes, {x: "longitude", y: "latitude", r: "intensity", sort: {channel: "r"}})
~~~

The [dot mark](https://observablehq.com/plot/marks/dot) now sorts by descending radius by default to reduce occlusion. The dot mark now supports the *hexagon* symbol type for pointy-topped hexagons. The new [circle](https://observablehq.com/plot/marks/dot#circle) and [hexagon](https://observablehq.com/plot/marks/dot#hexagon) marks are convenience shorthand for dot marks with the *circle* and *hexagon* symbol, respectively. The dotX, dotY, textX, and textY marks now support the **interval** option. The rule mark now correctly respects the **dx** and **dy** options. The new [hexgrid decoration mark](https://observablehq.com/plot/marks/hexgrid) draws a hexagonal grid; it is intended to be used with the hexbin transform as an alternative to the default horizontal and vertical axis grid.

The **zero** scale option (like the **nice** and **clamp** scale options) may now be specified as a top-level option, applying to all quantitative scales.

Marks can now define a channel hint to set the default range of the *r* scale. This is used by the hexbin transform when producing an *r* output channel.

Improve the performance of internal array operations, including type coercion. Thanks, @yurivish!

Fix a crash when using the [area mark](https://observablehq.com/plot/marks/area) shorthand.

[breaking] The return signature of the internal *mark*.initialize method has changed. It now returns a {data, facets, channels} object instead of {index, channels}, and *channels* is now represented as an object with named properties representing channels rather than an iterable of [*name*, *channel*].

## 0.4.3

[Released April 12, 2022.](https://github.com/observablehq/plot/releases/tag/v0.4.3)

The new [tree mark and transforms](https://observablehq.com/plot/marks/tree) can generate hierarchical node-link diagrams using D3’s [“tidy” tree](https://observablehq.com/@d3/tree) or [cluster (dendrogram)](https://observablehq.com/@d3/cluster) layout. The tree transform uses [d3.stratify](https://observablehq.com/@d3/d3-stratify) to convert tabular data into a hierarchy by parsing a slash-separated **path** for each row.

<img src="./img/tree.png" width="640" alt="a node-link tree diagram representing a software hierarchy">

```js
Plot.plot({
  axis: null,
  inset: 10,
  insetRight: 120,
  height: 500,
  marks: Plot.tree(plotsrc, {markerEnd: "arrow"})
})
```

The [line](https://observablehq.com/plot/marks/line) and [area](https://observablehq.com/plot/marks/area) marks (specifically lineX, lineY, areaX, and areaY) now support an implicit [bin transform](https://observablehq.com/plot/transforms/bin) with the **interval** option. This can be used to “regularize” time series data, say to show gaps or default to zero when data is missing, rather than interpolating across missing data. This is also useful for stacking time series data that is sampled at irregular intervals or with missing samples.

<img src="./img/sparse-series.png" width="640" alt="a time-series area chart showing downloads per day with gaps for missing data">

```js
Plot.plot({
  marks: [
    Plot.lineY(downloads, {x: "date", y: "downloads", interval: d3.utcDay, curve: "step"}),
    Plot.areaY(downloads, {x: "date", y: "downloads", interval: d3.utcDay, fill: "#eee", curve: "step"}),
    Plot.ruleY([0])
  ]
})
```

The default **reduce** is *first*, picking the first value in each interval. If there is no data for a given interval, the value is undefined, resulting in a visible gap in the line or area. By using *sum* instead, you can default to zero when data is missing (and sum values if the data contains more than one observation per time interval).

<img src="./img/dense-series.png" width="640" alt="a time-series area chart showing downloads per day with zeroes for missing data">

```js
Plot.plot({
  marks: [
    Plot.lineY(downloads, {x: "date", y: "downloads", interval: d3.utcDay, reduce: "sum", curve: "step"}),
    Plot.areaY(downloads, {x: "date", y: "downloads", interval: d3.utcDay, reduce: "sum", fill: "#eee", curve: "step"}),
    Plot.ruleY([0])
  ]
})
```

The [stack transform](https://observablehq.com/plot/transforms/stack) now allows the **offset** option to be specified as a function. For example, this can be used to visualize Likert survey results with a neutral category as a [diverging stacked bar chart](https://observablehq.com/@observablehq/plot-diverging-stacked-bar).

<img src="./img/likert.png" width="640" alt="a diverging bar chart of responses to a Likert survey question">

```js
function Likert(
  responses = [
    ["Strongly Disagree", -1],
    ["Disagree", -1],
    ["Neutral", 0],
    ["Agree", 1],
    ["Strongly Agree", 1]
  ]
) {
  const map = new Map(responses);
  return {
    order: Array.from(map.keys()),
    offset(facetstacks, X1, X2, Z) {
      for (const stacks of facetstacks) {
        for (const stack of stacks) {
          const k = d3.sum(stack, i => (X2[i] - X1[i]) * (1 - map.get(Z[i]))) / 2;
          for (const i of stack) {
            X1[i] -= k;
            X2[i] -= k;
          }
        }
      }
    }
  };
}
```

The new [_quantize_ scale type](https://observablehq.com/plot/features/scales#color-scale-options) transforms a continuous domain into discrete, evenly-spaced thresholds. The _threshold_ scale type now supports domains in descending order (in addition to ascending order), such as [20, 10, 5, 0] instead of [0, 5, 10, 20].

<img src="./img/quantize.png" width="640" alt="a scatterplot of Simpsons episodes showing the correlation between number of U.S. viewers and IMDb rating; the decline of the Simspons over time is shown with a quantized color encoding by season">

```js
Plot.plot({
  grid: true,
  color: {
    type: "quantize",
    legend: true
  },
  marks: [
    Plot.ruleY([0]),
    Plot.dot(simpsons, {x: "imdb_rating", y: "us_viewers_in_millions", fill: "season"})
  ]
})
```

The [bin transform](https://observablehq.com/plot/transforms/bin) now coerces the input channel (the quantity being binned) to numbers as necessary. In addition, the bin transform now correctly handles typed array input channels representing temporal data. The [rect mark](https://observablehq.com/plot/marks/rect) now promotes the _x_ channel to _x1_ and _x2_ if the latter two are not specified, and likewise the _y_ channel to _y1_ and _y2_.

Fix a crash when **text** or **title** channels contain heterogenous types; each value is now independently formatted in a type-appropriate default formatter. Fix a rendering bug with one-dimensional rects whose opposite dimension is a band scale. Fix a rendering bug with swoopy arrows. Improve error messages to give more context.

New helpers make it easier to implement custom transforms. [Plot.column](https://observablehq.com/plot/features/transforms#column) constructs lazily-evaluated columns for derived channels, and [Plot.transform](https://observablehq.com/plot/features/transforms#transform) composes a [custom data transform](https://observablehq.com/plot/features/transforms#custom-transforms) with any of Plot’s built-in [basic transforms](https://observablehq.com/plot/features/transforms).

## 0.4.2

[Released February 26, 2022.](https://github.com/observablehq/plot/releases/tag/v0.4.2)

The new [box mark](https://observablehq.com/plot/marks/box) generates a horizontal or vertical boxplot suitable for visualizing one-dimensional distributions. It is a convenience mark that composites a rule, bar, tick, and dot.

<img src="./img/box.png" width="640" alt="a boxplot of Michelson’s 1879 measurements of the speed of light">

```js
Plot.boxX(morley, {x: "Speed", y: "Expt"}).plot({x: {grid: true, inset: 6}})
```

[Plot’s shorthand syntax](https://observablehq.com/plot/features/shorthand) has been expanded. The [bar mark](https://observablehq.com/plot/marks/bar) now supports one-dimensional shorthand: if no *options* are specified, then Plot.barX and Plot.barY can be used to visualize an array of numbers. This shorthand also now applies to the [rect mark](https://observablehq.com/plot/marks/rect) and the [vector mark](https://observablehq.com/plot/marks/vector). The [area mark](https://observablehq.com/plot/marks/area) now supports two-dimensional shorthand: if no *options* are specified, then Plot.area can be used to visualize an array of *xy*-tuples, similar to Plot.line.

<img src="./img/bar-shorthand.png" width="640" alt="a bar chart of twenty random values">

```js
Plot.barY(d3.range(20).map(Math.random)).plot()
```

The mark [sort option](https://observablehq.com/plot/features/scales#sort-mark-option) now supports implicit “width” and “height” channels, defined as |*x2* - *x1*| and |*y2* - *y1*| respectively. These channels are useful for sorting rects and bars by length. The *reverse* option defaults to true when sorting by these channels. When sorting by *y* and no *y* channel is available, sorting will now fallback to *y2* if available; the same fallback logic applies to *x* and *x2*. (This behavior was previously supported on marks that support implicit stacking but now applies universally to all marks.)

<img src="./img/sort-length.png" width="640" alt="a bar chart of energy production by source from 1949 to present, with categorical colors assigned in order of the tallest bar">

```js
Plot.rectY(energy, {x: "Year", interval: 1, y: "Value", fill: "Description", sort: {color: "height"}})
```

The [bin transform](https://observablehq.com/plot/transforms/bin) now supports *x* and *y* reducers which represent the midpoint of the bin: (*x1* + *x2*) / 2 and (*y1* + *y2*) / 2 respectively. The [bin](https://observablehq.com/plot/transforms/bin), [group](https://observablehq.com/plot/transforms/group), and [window](https://observablehq.com/plot/transforms/window) transforms now support percentile reducers of the form *pXX* where *XX* is a number in [00, 99]; for example *p25* represents the first quartile and *p75* represents the third quartile.

The error message when attempting to create a standalone legend without a valid scale definition has been improved. The high cardinality warning for the implicit *z* channel has been relaxed; it is now only triggered if more than half of the values are distinct. When the axis *ticks* option is specified as null, no ticks are generated. When the axis *tickFormat* option is specified as null, no tick labels are generated.

## 0.4.1

[Released February 17, 2022.](https://github.com/observablehq/plot/releases/tag/v0.4.1)

The [area](https://observablehq.com/plot/marks/area) and [line marks](https://observablehq.com/plot/marks/line) now support varying fill, stroke, title, and other channels within series. For example, this chart of unemployment rates by metro area highlights increases in red and decreases in blue using a window transform with the *difference* reducer.

<img src="./img/line-slope.png" width="640" alt="a line chart of unemployment rates by metro area; increases are shown in red, and decreases in blue">

```js
Plot.line(bls, Plot.map({stroke: Plot.window({k: 2, reduce: "difference"})}, {x: "date", y: "unemployment", z: "division", stroke: "unemployment"}))
```

The new *clip* mark option enables clipping to the plot frame. For example, this can be used to clip overlapping areas and produce a horizon chart of hourly traffic patterns.

<img src="./img/horizon.png" width="640" alt="a horizon chart of traffic volume over time">

```js
d3.ticks(0, max, bands).map(t => Plot.areaY(traffic, {x: "date", y: d => d.value - t, fill: t, clip: true}))
```

Plot can now generate helpful warnings for common mistakes. Warnings ⚠️ are indicated in the top-right corner of the plot; open your browser’s developer console to read the warnings. For example, if you use data with date strings resulting in an *ordinal* scale rather than the desired *utc* scale, Plot will advise you to parse strings to dates.

<img src="./img/warning.png" width="640" alt="a line chart with an unreadable ordinal x-axis due to incorrect data typing">

```js
Plot.line(aapl, {x: "Date", y: "Close"}) // 🌶 Oops, Date is a string!
```

> Warning: some data associated with the x scale are strings that appear to be dates (e.g., YYYY-MM-DD). If these strings represent dates, you should parse them to Date objects. Dates are typically associated with a "utc" or "time" scale rather than a "point" scale. If you are using a bar mark, you probably want a rect mark with the interval option instead; if you are using a group transform, you probably want a bin transform instead. If you want to treat this data as ordinal, you can suppress this warning by setting the type of the x scale to "point".

We will add [more warnings](https://github.com/observablehq/plot/issues/755) in the future. If Plot did something you didn’t expect, please [let us know](https://github.com/observablehq/plot/discussions); perhaps it will inspire a new warning that will help other users.

The [text mark](https://observablehq.com/plot/marks/text) now supports automatic wrapping for easier annotation. The new **lineWidth** option specifies the desired length of a line in ems. The line breaking, wrapping, and text metrics implementations are all rudimentary, but they should be acceptable for text that is mostly ASCII. (For more control, you can hard-wrap text manually.) The **monospace** option now provides convenient defaults for monospaced text.

<img src="./img/wrap.png" width="640" alt="a snippet of Moby Dick demonstrating line wrapping">

```js
Plot.text([mobydick], {dx: 6, dy: 6, fontSize: 12, lineWidth: 80, lineHeight: 1.2, frameAnchor: "top-left", monospace: true})
```

The line and link marks now support [marker options](https://observablehq.com/plot/features/markers) for drawing a shape such as a dot or arrowhead on each vertex. Circle and arrow markers are provided, or you can implement a custom marker function that returns an SVG marker element. Markers automatically inherit the stroke color of the associated mark.

<img src="./img/marker.png" width="640" alt="a line chart with circle markers overlaid on each data point">

```js
Plot.lineY(crimea, {x: "date", y: "deaths", stroke: "cause", marker: "circle"})
```

The *fill* and *stroke* mark options can now be expressed as patterns or gradients using funciri color definitions, *e.g.* “url(#pattern)”. Colors can now also be expressed as CSS variables, *e.g.*, “var(--blue)”. All marks now support the *strokeDashoffset* option (for use with *strokeDasharray*).

<img src="./img/gradient.png" width="640" alt="a bar chart with bars that fade from blue to purple">

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", fill: "url(#gradient)"})
```

The bin transform now supports the *interval* option, allowing numeric intervals such as integer binning with a nice default domain that aligns with interval boundaries. (The bin transform already supported time intervals as the *thresholds* option; time intervals can now also be specified as the *interval* option.) For example, if you want to bin by hour of the day, use an *interval* of 1:

<img src="./img/bin-interval.png" width="640" alt="a histogram of average traffic per hour of day">

```js
Plot.rectY(traffic, Plot.binX({y: "mean"}, {x: d => d.date.getUTCHours(), interval: 1, y: "value"}))
```

Plot now supports ARIA attributes for improved accessibility: aria-label, aria-description, aria-hidden. The top-level **ariaLabel** and **ariaDescription** options apply to the root SVG element. The new **ariaLabel** and **ariaDescription** scale options apply to axes; the label defaults to *e.g.* “y-axis” and the description defaults to the scale’s label (*e.g.*, “↑ temperature”). Marks define a group-level aria-label (*e.g.*, “dot”). There is also an optional **ariaLabel** channel for labeling data (*e.g.*, “E 12.7%”), and a group-level **ariaDescription** option for a human-readable description. The **ariaHidden** mark option allows the hiding of decorative elements from the accessibility tree.

The new **paintOrder** mark option controls the [paint order](https://developer.mozilla.org/en-US/docs/Web/CSS/paint-order). The text mark’s paint order now defaults to *stroke*, with a stroke width of 3px and a stroke linejoin of *round*, making it easier to create a halo for separating labels from a busy background, improving legibility.

Fix a crash in default tuple accessors for *x* and *y* when data is undefined. Fix a bug where “none” with surrounding whitespace or capital letters would not be recognized as a valid color. When a channel is specified as a boolean value (*e.g.*, `fill: true`), it is now considered a constant value rather than undefined. Fix a bug where an identity color legend would be rendered as the text “undefined” instead of showing nothing. If scale options are declared, but the scale has no defined type, domain, or data, a scale is no longer constructed rather than a default linear scale. The vector mark now respects the *frameAnchor* option. The default boolean color schemes have been adjusted slightly so that the false value is slightly darker, improving contrast against a white background. The returned scale object now exposes *bandwidth* and *step* values for *band* and *point* scales.

## 0.4.0

[Released January 20, 2022.](https://github.com/observablehq/plot/releases/tag/v0.4.0)

The new [arrow mark](https://observablehq.com/plot/marks/arrow) draws arrows between pairs of points. It is similar to the [link mark](https://observablehq.com/plot/marks/link), except it is suitable for directed edges (say for representing change over time) and supports a configurable arrowhead. It also supports “swoopy” arrows with the *bend* option, and insets for arrows to shorten the arrow’s start or end.

[<img src="./img/arrow.png" width="660" alt="a scatterplot with arrows">](https://observablehq.com/plot/marks/arrow)

```js
Plot.arrow(data, {
  x1: "POP_1980",
  y1: "R90_10_1980",
  x2: "POP_2015",
  y2: "R90_10_2015",
  bend: true,
  stroke: d => d.R90_10_2015 - d.R90_10_1980
})
```

The new [vector mark](https://observablehq.com/plot/marks/vector) similarly draws arrows at the given position (*x* and *y*) with the given magnitude (*length*) and direction (*rotate*). It is intended to visualize vector fields, such as a map of wind speed and direction.

[<img src="./img/vector.png" width="660" alt="a vector field">](https://observablehq.com/plot/marks/vector)

```js
Plot.vector((T => d3.cross(T, T))(d3.ticks(0, 2 * Math.PI, 20)), {
  length: ([x, y]) => (x + y) * 2 + 2,
  rotate: ([x, y]) => (Math.sin(x) - Math.sin(y)) * 60
})
```

The [dot mark](https://observablehq.com/plot/marks/dot) now supports a *symbol* option to control the displayed shape, which defaults to *circle*. The *symbol* channel (and associated *symbol* scale) can also be used as an categorical encoding. The default symbol set is based on whether symbols are stroked or filled, improving differentiability and giving uniform weight. Plot supports all of D3’s built-in symbol types: *circle*, *cross*, *diamond*, *square*, *star*, *triangle*, and *wye* (for fill) and *circle*, *plus*, *times*, *triangle2*, *asterisk*, *square2*, and *diamond2* (for stroke, based on [Heman Robinson’s research](https://www.tandfonline.com/doi/abs/10.1080/10618600.2019.1637746)); you can also implement a [custom symbol type](https://d3js.org/d3-shape/symbol#custom-symbols).

[<img src="./img/symbol.png" width="660" alt="a scatterplot of penguins by mass and flipper length">](https://observablehq.com/plot/marks/dot)

```js
Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species", symbol: "species"})
```

The [text mark](https://observablehq.com/plot/marks/text) now supports multiline text! When a text value contains `\r`, `\r\n`, or `\n`, it will be split into multiple lines using tspan elements. The new *lineAnchor* and *lineHeight* options control how the lines are positioned relative to the given *xy* position. The text, dot, and image marks now also support a *frameAnchor* option for positioning relative to the frame rather than according to data. This is particularly useful for annotations.

[<img src="./img/poem.png" width="660" alt="This Is Just To Say, by William Carlos Williams">](https://observablehq.com/plot/marks/text)

```js
Plot.plot({
  height: 200,
  marks: [
    Plot.frame(),
    Plot.text([`This Is Just To Say\nWilliam Carlos Williams, …`], {frameAnchor: "middle"})
  ]
})
```

When a text mark’s *text* channel, or the *title* channel on any mark, is specified as numbers or dates, the values are now automatically formatted (in the U.S. English locale) to improve readability. For the *text* channel, the default *fontVariant* option additionally changes to tabular-nums. The text mark now also allows *fontSize* to be specified as a CSS length (*e.g.*, “12pt”), keyword (*e.g.*, “x-large”), or percentage.

All marks now support the new standard *href* channel and *target* option, turning the mark into a clickable link.

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", href: d => `https://en.wikipedia.org/wiki/${d.letter}`})
```

The [bin](https://observablehq.com/plot/transforms/bin) and [group](https://observablehq.com/plot/transforms/group) transforms now propagate the *title* and *href* channels, if present, by default. The default reducer for the *title* channel automatically selects the top five distinct title values by count, making it easier to inspect the contents of a given bin or group.

[<img src="./img/bin-title.png" width="656" alt="a histogram of penguins by species">](https://observablehq.com/plot/transforms/bin)

```js
Plot.rectY(data, Plot.binX({y: "count"}, {x: "body_mass_g", fill: "species", title: d => `${d.species} ${d.sex}`}))
```

The bin transform now supports shorthand reducers for the bin extent: *x1*, *x2*, *y1*, and *y2*. The window transform now supports the *first* and *last* reducers to select the first or last element of the window, respectively.

The new generalized [select transform](https://observablehq.com/plot/transforms/select) can now call a custom selector function, or the shorthand *min* and *max*, to select the points to display. The selector function is passed two arguments: the index of the current group (*e.g.*, [0, 1, 2, …]) and the given channel’s values. For example, to select the dot with the greatest *fill* value:

```js
Plot.dotX(data, Plot.select({fill: "max"}, {x: "letter", fill: "frequency", stroke: "black"})
```

The *color* scale now defaults to an *identity* scale if all associated defined values are valid CSS colors, rather than defaulting to the tableau10 categorical color scheme. The new *symbol* scale similarly defaults to *identity* if all associated defined values are valid symbol names (or symbol type objects).

[<img src="./img/identity-color.png" width="640" alt="a chart with red and black bars">](https://observablehq.com/plot/marks/bar)

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", fill: d => /[AEIOU]/.test(d.letter) ? "red" : "black"})
```

The *color* scale now has a special default range for boolean data, encoding false as light gray and true as dark gray. If you’d prefer more color, specify a sequential scheme such as *reds* or *blues*. (You can opt-out of the special boolean range by setting the scale type to *categorical* or by specifying an explicit *range*.)

[<img src="./img/boolean-color.png" width="640" alt="a chart with grey and black bars">](https://observablehq.com/plot/marks/bar)

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", fill: d => /[AEIOU]/.test(d.letter)})
```

The new [Plot.scale](https://observablehq.com/plot/features/scales#scale) method allows you to construct a standalone scale for use independent of any chart, or across charts. The returned object has the same form as *plot*.scale(*name*), allowing you to inspect the scale options and invoke the scale programmatically with *scale*.apply (and *scale*.invert, where applicable).

```js
const scale = Plot.scale({color: {type: "linear"}});
console.log(scale.domain); // [0, 1]
console.log(scale.apply(0.5)); // "rgb(149, 251, 81)"
```

This release includes various minor new features and bug fixes. The new top-level *clamp* option applies to all scales. When margins or insets would result in a scale’s range being inverted, Plot now collapses the range instead of producing confusing output. When the *buylrd* color scheme is applied to a (discrete) ordinal scale, it now has the expected colors (not *rdgy*). Plot now ignores non-finite values when inferring the default domain for quantitative scales. The *swatches* legend now wraps correctly in narrow windows. When the *tickFormat* option is null, ticks will now be unlabeled (rather than using the default format). Plot no longer crashes when you try to display a legend on an identity color scale.

To improve compatibility with popular bundlers such as webpack and Rollup, Plot no longer uses circular ES module imports and thereby avoids the dreaded temporal dead zone. 😱 Plot now uses [vite](https://vitejs.dev) for local development instead of [Snowpack](https://snowpack.dev).

[breaking] For consistency with other marks, the text mark now requires the *dx* and *dy* to be specified as numbers in pixels rather than typographic units such as ems; in addition, the *dx* and *dy* translation now happens prior to rotation (if any). To affect the typographic layout, use the new *lineAnchor* and *lineHeight* options.

[breaking] Plot now requires [D3 ^7.3.0](https://github.com/d3/d3/releases/tag/v7.3.0).

---

For earlier changes, continue to the [2021 CHANGELOG](./CHANGELOG-2021.md).
