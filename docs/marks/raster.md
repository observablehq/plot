<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import volcano from "../data/volcano.ts";

</script>

# Raster mark

The **raster** mark paints a raster image from spatial samples. In contrast with the [image](./image.md) mark, which shows an existing image, the raster mark _creates_ an image from abstract data. (For contours from spatial samples, see the [contour mark](./contour.md).)

Whereas a vector image represents lines, rectangles, circles as geometrical paths, a raster image (or _bitmap_) is a rectangular grid of colored pixels organized in rows and columns. The colors are usually given in levels of red, green, and blue (RGB), and often opacity (A).

Consider the following grid of numbers with {{volcano.height}} rows and {{volcano.width}} columns. Each number represents the elevation in meters of the [Maungawhau](https://en.wikipedia.org/wiki/Maungawhau) volcano at a given location.

Printing the numbers directly gives the following chart—unreadable at this scale:

:::plot hidden
```js
Plot.plot({
  x: {label: "column →"},
  y: {reverse: true, label: "↓ row"},
  marks: [
    Plot.text(volcano.values, {
      text: Plot.identity,
      x: (d, i) => i % volcano.width,
      y: (d, i) => Math.floor(i / volcano.width),
      fontSize: 3
    }),
    Plot.rect({length: 1}, {
      x1: 10.5,
      x2: 29.5,
      y1: 10.5,
      y2: 29.5,
      stroke: "currentColor"
    })
  ]
})
```
:::

Now, let’s focus on the outlined region:

:::plot hidden
```js
Plot.plot({
  x: {domain: [9.5, 30.5]},
  y: {domain: [30.5, 9.5]},
  marks: [
    Plot.text(volcano.values, {
      text: Plot.identity,
      x: (d, i) => i % volcano.width,
      y: (d, i) => Math.floor(i / volcano.width),
      fontWeight: 460,
      clip: true
    }),
    Plot.rect({length: 1}, {x1: 10.5, x2: 29.5, y1: 10.5, y2: 29.5, stroke: "black"})
  ]
})
```
:::

… and color every number with a suitable color scale:

:::plot hidden
```js
Plot.plot({
  x: {domain: [9.5, 30.5]},
  y: {domain: [30.5, 9.5]},
  marks: [
    Plot.dot(volcano.values, {
      x: (d, i) => i % volcano.width,
      y: (d, i) => Math.floor(i / volcano.width),
      fill: Plot.identity,
      r: 16,
      dy: -12,
      symbol: "square",
      clip: true
    }),
    Plot.text(volcano.values, {
      text: Plot.identity,
      x: (d, i) => i % volcano.width,
      y: (d, i) => Math.floor(i / volcano.width),
      fontWeight: 460,
      clip: true
    }),
    Plot.rect({length: 1}, {x1: 10.5, x2: 29.5, y1: 10.5, y2: 29.5, stroke: "black"})
  ]
})
```
:::

… finally, we can forget the numbers, and zoom back out:

:::plot defer
```js
Plot.raster(volcano.values, {width: volcano.width, height: volcano.height}).plot()
```
:::

_Voilà!_ This is the raster mark in a nutshell.

But that is not all: most of the time, the data you want to draw isn’t already laid out on a convenient rectangular grid, as the volcano dataset above. For instance, an image can be described by triplets of ⟨_x_, _y_, _value_⟩. These triplets live on a plane, but _x_ and _y_ are not necessarily integers, and not necessarily inside the raster frame; furthermore, they are not given in a specific order.

The raster mark also covers with this type of data; however, it needs a different way to specify the information.

The dataset below was acquired in the 1960s by the [Great Britain aeromagnetic survey](https://www.bgs.ac.uk/datasets/gb-aeromagnetic-survey/), and describes the IGRF (International Geomagnetic Reference Field) measured by plane fly-overs in 1955.

```js
Plot.raster(ca55, {x: "LONGITUDE", y: "LATITUDE", fill: "MAG_IGRF90"}).plot()
```

The raster mark above draws a point (a single pixel) for each datum, at its *x* and *y* coordinates (rounded to the closest pixel), and the value with which to color that point. The returned chart image is still composed of a single raster image.

This preliminary image has issues: there are not enough points to fill the whole raster, and each pixel is too small. Many pixels remain white (or rather, transparent), where no value has been determined. The data’s location is given with longitudes and latitudes, and should use a [projection](../features/projections.md). And, as always, a proper color scale needs to be specified.

Let’s start by addressing the easiest: projection, and color. We’ll also use the pixelSize option to make the pixels larger (this option is specified as the width in screen pixels of a raster pixel). And a line mark will display the paths of the plane that took the samples during the measurement campaign.

```js
projection = ({
  type: "mercator",
  domain: {
    type: "MultiPoint",
    coordinates: ca55.map((d) => [d.LONGITUDE, d.LATITUDE])
  }
})
```

```js
Plot.plot({
  projection,
  inset: 10,
  height: 500,
  color: { type: "diverging" },
  marks: [
    Plot.line(ca55, {
      x: "LONGITUDE",
      y: "LATITUDE",
      z: "LINE_NUMB-SEG",
      markerEnd: "arrow",
      strokeOpacity: 0.3,
      strokeWidth: 1
    }),
    Plot.raster(ca55, {
      x: "LONGITUDE",
      y: "LATITUDE",
      fill: "MAG_IGRF90",
      pixelSize: 5,
      imageRendering: "pixelated"
    })
  ]
})
```

*Note: unfortunately Safari does not respect the image-rendering: pixelated property for images in SVG. Until this is fixed, if you want to draw “big pixels” on the Web, it is recommended to use [rect](./rect.md) or [dot](./dot.md) instead, and switch to the raster mark for higher-density images only.*

## Spatial interpolation

The image above starts to be readable, but it would be frustrating not to do more with this dataset. It contains many measurements, painstakingly sampled across England, and we should try and extend them to create a complete map. This is the role of the **interpolate** methods of the raster mark. Methods, plural, because there is more than one way to do spatial interpolation.

The first interpolation method (and easiest to think about) is *nearest*: to color a given location ⟨*x*, *y*⟩ on the raster, it finds the nearest sample in the dataset. Note that, in this method and others, the position of a pixel is defined at its center—the first pixel at the top-left is not ⟨0, 0⟩, but ⟨0.5, 0.5⟩. The _nearest_ interpolation method fills the map with Voronoi cells—called Thiessen polygons in the cartographic lingo.

```js
plotca.legend("color")
```

```js
plotca = Plot.plot({
  projection,
  inset: 10,
  height: 500,
  marginBottom: 2,
  color: { type: "diverging" },
  marks: [
    Plot.raster(ca55, {
      x: "LONGITUDE",
      y: "LATITUDE",
      fill: "MAG_IGRF90",
      interpolate: "nearest"
    }),
    Plot.frame()
  ]
})
```

If we make the hypothesis that the phenomenon that we observe is actually continuous, it might be better to use the _barycentric_ interpolation, which first covers the region with triangles whose vertices are data points, then interpolates values inside each triangle with a linear gradient between the three values. (Points outside the convex hull are extrapolated with a specific heuristic.)

```js
Plot.plot({
  projection,
  inset: 10,
  height: 500,
  marginBottom: 2,
  color: { type: "diverging" },
  marks: [
    Plot.raster(ca55, {
      x: "LONGITUDE",
      y: "LATITUDE",
      fill: "MAG_IGRF90",
      interpolate: "barycentric"
    }),
    Plot.frame()
  ]
})
```

Finally, you can use the _random-walk_ method. It is based on the following idea: to estimate the value at a given location ⟨*x*, *y*⟩, we first check if that location is touching one of the data points (_i.e._, is at a distance lesser than 0.5 pixel). If that is the case, we use the value at that point, and stop. Otherwise, we make a small step in a random direction, and repeat the process. To make this reasonably performant, this intuition is implemented with the [walk on spheres](https://observablehq.com/@fil/walk-on-spheres) algorithm, limited to 2 consecutive jumps.

```js
Plot.plot({
  projection,
  inset: 10,
  height: 500,
  marginBottom: 2,
  color: { type: "diverging" },
  marks: [
    Plot.raster(ca55, {
      x: "LONGITUDE",
      y: "LATITUDE",
      fill: "MAG_IGRF90",
      interpolate: "random-walk"
    }),
    Plot.frame()
  ]
})
```

With the _random-walk_ method, the image is grainy (and the grain reflects the uncertainty). We can use the _blur_ parameter to make it smoother:

```js
Plot.plot({
  projection,
  inset: 10,
  height: 500,
  marginBottom: 2,
  color: { type: "diverging" },
  marks: [
    Plot.raster(ca55, {
      x: "LONGITUDE",
      y: "LATITUDE",
      fill: "MAG_IGRF90",
      interpolate: "random-walk",
      blur: 5
    }),
    Plot.frame()
  ]
})
```

All these interpolation methods are also exposed as functions so you can use them outside of Plot, or configure them more precisely. If none of them covers your needs, it is even possible to define your own as a function that receives an array of indices into the data, the associated channels x, y, and value, and facet information. See the [API documentation](https://github.com/observablehq/plot/blob/main/README.md#spatial-interpolation) for details.

Choosing the best spatial interpolation method strongly depends on the use case, and on what the values represent. Both examples above—the volcano elevation and the geomagnetic reference field—are numeric values that reflect a continuous quantitative dimension. But we can use spatial interpolation on discrete, categorical values too. The methods included in Plot have all been implemented in such a way that they can be applied both to quantitative or categorical dimensions. Our next example features the [iris dataset](https://archive.ics.uci.edu/ml/datasets/iris), which encodes the lengths of petals and sepals of different irises, together with their species.

```js
irisChart = Plot.plot({
  inset: 30,
  color: { scheme: "category10", legend: true },
  marks: [
    Plot.raster(iris, {
      interpolate: interpolateIris,
      x: "petalLength",
      y: "sepalLength",
      fill: "species",
      fillOpacity: 0.8,
      blur: blurIris
    }),
    Plot.dot(iris, {
      x: "petalLength",
      y: "sepalLength",
      fill: "species",
      stroke: "white"
    })
  ]
})
```

<!-- viewof interpolateIris = Inputs.radio(
  [null, "nearest", "random-walk", "barycentric"],
  {
    value: "random-walk",
    label: "interpolate",
    format: (d) => d ?? "null"
  }
) -->

<!-- viewof blurIris = Inputs.range([0, 10], { value: 0, label: "blur radius", step: 1 }) -->

For ordinal values, such as the species of an iris, there is no way to represent the “weighted mean” of ${iriscolor("setosa")}, ${iriscolor("versicolor")} and ${iriscolor("virginica")}—so the spatial interpolation switches to a different strategy. In the categorical case, the spatial interpolators mix the different values with a dice roll: when a point represent setosa with a probability of 1/2, versicolor 1/3 and virginica 1/6, we take a random number between 0 and 1 and decide on setosa if it’s less that 0.5, versicolor if less than 5/6, and virginica otherwise.

This creates an interesting “map” of the species in the space of petal length _vs._ sepal length. If you read the background color as the possible distribution of species in the different regions, you begin to get a feel for what each interpolation method does.

In this case the _random-walk_ method is clearly the best: where there are enough samples of the same color, the interpolated color is almost solid. In other words, we can be pretty sure that a new iris whose measurements are in the ${iriscolor("versicolor")} region would indeed be versicolor. Where there is more doubt—either because we’re in a region that has both ${iriscolor("versicolor")} and ${iriscolor("virginica")}, or because we’re far from any existing sample—there is more noise. In that case, the local mixing of colors corresponds (more or less) to the relative probabilities of each species. (This map of probabilities is what a machine-learning algorithm tries to figure.)

And, if you find that the dithering is not to your taste, you can also add some blurring. Note that in this case we blur the resulting _image_, instead of the data—this is the only possibility, since the data cannot be interpolated.

## Working with opacity

The examples above have been colorful, demonstrating the **fill** output of the raster mark. Another possibility is to set a constant fill and a variable **fillOpacity** channel. Everything works the same, but the generated image is now a mask with a variable opacity. For example, the image below adds a blue tint to the map, with a density that corresponds to the data.

```js
Plot.plot({
  projection,
  inset: 10,
  height: 500,
  opacity: { transform: Math.abs },
  marks: [
    Plot.line(ca55, {
      x: "LONGITUDE",
      y: "LATITUDE",
      z: "LINE_NUMB-SEG",
      strokeWidth: 1,
      markerEnd: "arrow"
    }),
    Plot.raster(ca55, {
      x: "LONGITUDE",
      y: "LATITUDE",
      fill: "steelblue",
      fillOpacity: "MAG_IGRF90",
      interpolate: "nearest"
    })
  ]
})
```

## Function sampling

But that is not all! Sometimes you want to color every pixel in a rectangle with a function that depends on the location ⟨*x*, *y*⟩, similar to a WebGL fragment shader. This case is also supported by the raster mark: when the **fill** channel is defined as a function and there is no data, that function is called repeatedly, for each pixel, with the coordinates (in data space) where the value should be computed. This is useful in mathematics, for example to draw the fractal defined by [Mandelbrot](https://en.wikipedia.org/wiki/Mandelbrot_set)’s function, which tells us whether a certain recursive sequence diverges, and how fast, given two parameters *x* and *y*:

```js
function mandelbrot(x, y) {
  for (let n = 0, zr = 0, zi = 0; n < 80; ++n) {
    [zr, zi] = [zr * zr - zi * zi + x, 2 * zr * zi + y];
    if (zr * zr + zi * zi > 4) return n;
  }
  // undefined if it has converged, for a transparent pixel
}
```

```js
Plot.plot({
  height: 500,
  marks: [
    Plot.raster({
      fill: mandelbrot,
      pixelSize: 1 / devicePixelRatio,
      x1: -2,
      x2: 1,
      y1: -1.164,
      y2: 1.164
    })
  ]
})
```

## Faceting

The raster mark works with faceting, allowing to select different samples on different facets (say, by time). In the case of the function fill, however, since there is no data, the method for faceting is a bit different than usual: facets are passed to the function as the third argument.

```js
{
  const lin = (x) => x / (4 * Math.PI);
  const { sin, cos } = Math;
  return Plot.plot({
    width: 450,
    height: 420,
    color: { type: "diverging" },
    fx: { tickFormat: (f) => f?.name },
    fy: { tickFormat: (f) => f?.name },
    marks: [
      Plot.raster({
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

## Raster options

Renders a raster image from spatial samples. If data is provided, it represents discrete samples in abstract coordinates *x* and *y*; the *fill* and *fillOpacity* channels specify further abstract values (_e.g._, height in a topographic map) to be [spatially interpolated](#spatial-interpolation) to produce an image.

```js
Plot.raster(volcano.values, {width: volcano.width, height: volcano.height})
```

The *fill* and *fillOpacity* channels may alternatively be specified as continuous functions *f*(*x*, *y*) to be evaluated at each pixel centroid of the raster grid (without interpolation).

```js
Plot.raster({x1: -1, x2: 1, y1: -1, y2: 1, fill: (x, y) => Math.atan2(y, x)})
```

The resolution of the rectangular raster image may be specified with the following options:

* **width** - the number of pixels on each horizontal line
* **height** - the number of lines; a positive integer

The raster dimensions may also be imputed from the extent of *x* and *y* and a pixel size:

* **x1** - the starting horizontal position; bound to the *x* scale
* **x2** - the ending horizontal position; bound to the *x* scale
* **y1** - the starting vertical position; bound to the *y* scale
* **y2** - the ending vertical position; bound to the *y* scale
* **pixelSize** - the screen size of a raster pixel; defaults to 1

If **width** is specified, **x1** defaults to 0 and **x2** defaults to **width**; likewise, if **height** is specified, **y1** defaults to 0 and **y2** defaults to **height**. Otherwise, if **data** is specified, **x1**, **y1**, **x2**, and **y2** respectively default to the frame’s left, top, right, and bottom coordinates. Lastly, if **data** is not specified (as when **fill** or **fillOpacity** is a function of *x* and *y*), you must specify all of **x1**, **x2**, **y1**, and **y2** to define the raster domain (see below). The **pixelSize** may be set to the inverse of the devicePixelRatio for a sharper image.

The following raster-specific constant options are supported:

* **interpolate** - the [spatial interpolation method](#spatial-interpolation)
* **imageRendering** - the [image-rendering attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/image-rendering); defaults to *auto* (bilinear)
* **blur** - a non-negative pixel radius for smoothing; defaults to 0

The **imageRendering** option may be set to *pixelated* to disable bilinear interpolation for a sharper image; however, note that this is not supported in WebKit. The **interpolate** option is ignored when **fill** or **fillOpacity** is a function of *x* and *y*.

## raster(*data*, *options*)

```js
Plot.raster(volcano.values, {width: volcano.width, height: volcano.height, fill: Plot.identity})
```

Returns a new raster mark with the given (optional) *data* and *options*.
