# Spatial interpolators

The [raster](../marks/raster.md) and [contour](../marks/contour.md) marks use spatial interpolation to populate a raster grid from a discrete set of (often ungridded) spatial samples. The **interpolate** option controls how these marks compute the raster grid. The following built-in methods are provided:

* *none* (or null) - assign each sample to the containing pixel
* *nearest* - assign each pixel to the closest sample’s value (Voronoi diagram)
* *barycentric* - apply barycentric interpolation over the Delaunay triangulation
* *random-walk* - apply a random walk from each pixel, stopping when near a sample

The **interpolate** option can also be specified as a function with the following arguments:

* *index* - an array of numeric indexes into the channels *x*, *y*, *value*
* *width* - the width of the raster grid; a positive integer
* *height* - the height of the raster grid; a positive integer
* *x* - an array of values representing the *x*-position of samples
* *y* - an array of values representing the *y*-position of samples
* *value* - an array of values representing the sample’s observed value

So, *x*[*index*[0]] represents the *x*-position of the first sample, *y*[*index*[0]] its *y*-position, and *value*[*index*[0]] its value (*e.g.*, the observed height for a topographic map).

## interpolateNone(*index*, *width*, *height*, *x*, *y*, *value*)

```js
Plot.raster(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90", interpolate: Plot.interpolateNone})
```

Applies a simple forward mapping of samples, binning them into pixels in the raster grid without any blending or interpolation. If multiple samples map to the same pixel, the last one wins; this can introduce bias if the points are not in random order, so use [Plot.shuffle](../transforms/sort.md#shuffle-options) to randomize the input if needed.

## interpolateNearest(*index*, *width*, *height*, *x*, *y*, *value*)

```js
Plot.raster(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90", interpolate: Plot.interpolateNearest})
```

Assigns each pixel in the raster grid the value of the closest sample; effectively a Voronoi diagram.

## interpolatorBarycentric(*options*)

```js
Plot.raster(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90", interpolate: Plot.interpolatorBarycentric()})
```

Constructs a Delaunay triangulation of the samples, and then for each pixel in the raster grid, determines the triangle that covers the pixel’s centroid and interpolates the values associated with the triangle’s vertices using [barycentric coordinates](https://en.wikipedia.org/wiki/Barycentric_coordinate_system). If the interpolated values are ordinal or categorical (_i.e._, anything other than numbers or dates), then one of the three values will be picked randomly weighted by the barycentric coordinates; the given **random** number generator will be used, which defaults to a [linear congruential generator](https://github.com/d3/d3-random/blob/main/README.md#randomLcg) with a fixed seed (for deterministic results).

## interpolatorRandomWalk(*options*)

```js
Plot.raster(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90", interpolate: Plot.interpolatorRandomWalk()})
```

For each pixel in the raster grid, initiates a random walk, stopping when either the walk is within a given distance (**minDistance**) of a sample or the maximum allowable number of steps (**maxSteps**) have been taken, and then assigning the current pixel the closest sample’s value. The random walk uses the “walk on spheres” algorithm in two dimensions described by [Sawhney and Crane](https://www.cs.cmu.edu/~kmcrane/Projects/MonteCarloGeometryProcessing/index.html), SIGGRAPH 2020; the given **random** number generator will be used, which defaults to a [linear congruential generator](https://github.com/d3/d3-random/blob/main/README.md#randomLcg) with a fixed seed (for deterministic results).
