# Vector mark

The **vector** mark represents data as little arrows, typically positioned in *x* and *y* quantitative dimensions, with a given magnitude (*length*) and direction (*rotate*), as in a vector field. For example, the plot below shows the wind speed and direction for a section of western Europe. (Based on a [LitVis example](https://github.com/gicentre/litvis/blob/master/examples/windVectors.md).)

```js
Plot.plot({
  inset: 10,
  width: 1152,
  height: 870, // for a rougly equirectangular projection
  color: {
    scheme: "viridis",
    label: "Speed (m/s)",
    zero: true,
    legend: true
  },
  marks: [
    Plot.vector(wind, {
      x: "longitude",
      y: "latitude",
      rotate: ({u, v}) => Math.atan2(u, v) * 180 / Math.PI,
      length: ({u, v}) => Math.hypot(u, v),
      stroke: ({u, v}) => Math.hypot(u, v)
    })
  ]
})
```

Per [Remote Sensing Systems](https://www.remss.com/measurements/ccmp/) documentation:

> *Standard U and V coordinates apply, meaning the positive U is to the right and positive V is above the axis. U and V are relative to true north. CCMP winds are expressed using the oceanographic convention, meaning a wind blowing toward the Northeast has a positive U component and a positive V component.*
>
> *Longitude is given in degrees East from 0.125 to 359.875 and latitude is given in degrees North with negative values representing southern locations.*

And here is another example using Poisson disk sampling of a Perlin noise field:

```js
Plot.plot({
  inset: 12,
  height: 1152,
  width: 1152,
  marks: [
    Plot.vector(samples([0, 0, 2, 2], 4000), {
      length: ([x, y]) => (noise(x + 2, y) + 0.5) * 24,
      rotate: ([x, y]) => noise(x, y) * 360
    })
  ]
})
```

```js
noise = octave(perlin2, 2)
```

## Vector options

Draws little arrows as in a vector field.

In addition to the [standard mark options](#marks), the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale
* **y** - the vertical position; bound to the *y* scale
* **length** - the length in pixels; bound to the *length* scale; defaults to 12
* **rotate** - the rotation angle in degrees clockwise; defaults to 0

If either of the **x** or **y** channels are not specified, the corresponding position is controlled by the **frameAnchor** option.

The following constant options are also supported:

* **shape** - the shape of the vector; defaults to *arrow*
* **r** - a radius in pixels; defaults to 3.5
* **anchor** - one of *start*, *middle*, or *end*; defaults to *middle*
* **frameAnchor** - the [frame anchor](#frameanchor); defaults to *middle*

The **shape** option controls the visual appearance (path geometry) of the vector and supports the following values:

* *arrow* (default) - an arrow with head size proportional to its length
* *spike* - an isosceles triangle with open base
* any object with a **draw** method; it receives a *context*, *length*, and *radius*

If the **anchor** is *start*, the arrow will start at the given *xy* position and point in the direction given by the rotation angle. If the **anchor** is *end*, the arrow will maintain the same orientation, but be positioned such that it ends in the given *xy* position. If the **anchor** is *middle*, the arrow will be likewise be positioned such that its midpoint intersects the given *xy* position.

If the **x** channel is not specified, vectors will be horizontally centered in the plot (or facet). Likewise if the **y** channel is not specified, vectors will be vertically centered in the plot (or facet). Typically either *x*, *y*, or both are specified.

The **rotate** and **length** options can be specified as either channels or constants. When specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel. The length defaults to 12 pixels, and the rotate defaults to 0 degrees (pointing up↑). Vectors with a negative length will be drawn inverted. Positive angles proceed clockwise from noon.

The **stroke** defaults to currentColor. The **strokeWidth** defaults to 1.5, and the **strokeLinecap** defaults to *round*.

Vectors are drawn in input order, with the last data drawn on top. If sorting is needed, say to mitigate overplotting by drawing the smallest vectors on top, consider a [sort and reverse transform](#transforms).

## vector(*data*, *options*)

```js
Plot.vector(wind, {x: "longitude", y: "latitude", length: "speed", rotate: "direction"})
```

Returns a new vector with the given *data* and *options*. If neither the **x** nor **y** options are specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

## vectorX(*data*, *options*)

Equivalent to [Plot.vector](#plotvectordata-options) except that if the **x** option is not specified, it defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …].

## vectorY(*data*, *options*)

Equivalent to [Plot.vector](#plotvectordata-options) except that if the **y** option is not specified, it defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …].

## spike(*data*, *options*)

Equivalent to [Plot.vector](#plotvectordata-options) except that the **shape** defaults to *spike*, the **stroke** defaults to *currentColor*, the **strokeWidth** defaults to 1, the **fill** defaults to **stroke**, the **fillOpacity** defaults to 0.3, and the **anchor** defaults to *start*.
