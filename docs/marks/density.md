# Density

The Density mark shows the estimated density of two-dimensional point clouds. Contours guide the eye towards the local peaks of concentration of the data, much like a topographic map does with elevation. This is especially useful given overplotting in dense datasets.

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

The **bandwidth** option specifies the radius of the [Gaussian kernel](https://en.wikipedia.org/wiki/Gaussian_function) describing the influence of each point as a function of distance; this kernel is summed over a discrete grid covering the plot, and then contours (*isolines*) are derived for values between 0 (exclusive) and the maximum density (exclusive) using the [marching squares algorithm](https://en.wikipedia.org/wiki/Marching_squares). (Internally, the bandwidth is rounded based on the precision of the underlying discrete grid.)

```js
viewof bandwidth = Inputs.range([0, 40], {label: "Bandwidth", value: 20, step: 0.2})
```

```js
Plot.plot({
  inset: 20,
  marks: [
    Plot.density(faithful, {x: "waiting", y: "eruptions", bandwidth}),
    Plot.dot(faithful, {x: "waiting", y: "eruptions"})
  ]
})
```

The **thresholds** option specifies the number of contour lines (minus one) to be computed. For example, with 4 thresholds and a maximum density of 10, contour lines would be drawn for the values 2.5, 5, and 7.5. The default number of thresholds is 20. (You can also pass the thresholds as an explicit array of values.)

```js
viewof thresholds = Inputs.range([1, 40], {label: "Thresholds", value: 20, step: 1})
```

```js
Plot.plot({
  inset: 20,
  marks: [
    Plot.density(faithful, {x: "waiting", y: "eruptions", thresholds}),
    Plot.dot(faithful, {x: "waiting", y: "eruptions"})
  ]
})
```

The density mark also works with one-dimensional values:

```js
Plot.plot({
  height: 100,
  inset: 20,
  marks: [
    Plot.density(faithful, {x: "waiting", stroke: "steelblue", strokeWidth: 0.25, bandwidth: 10}),
    Plot.density(faithful, {x: "waiting", stroke: "steelblue", thresholds: 4, bandwidth: 10}),
    Plot.dot(faithful, {x: "waiting", fill: "currentColor", r: 1.5})
  ]
})
```

By using the _density_ keyword as a **fill** or **stroke** color, you can draw regions with a sequential color encoding.

```js
Plot.density(diamonds, {x: "carat", y: "price", fill: "density"}).plot({
  height: 500,
  grid: true,
  x: {type: "log"},
  y: {type: "log"},
  color: {scheme: "ylgnbu"}
})
```

To make the contours comparable when used across facets or with different series (specified by **z**, **stroke**, or **fill**), the number of thresholds is computed on the series that reaches the highest density. For instance, the chart below shows the highest concentration of penguins, arranged by flipper length and culmen length, in the Biscoe island facet. The contours in the other facets will thus respect the values determined by the Biscoe facet, resulting in comparable density levels.

```js
Plot.plot({
  width: 928,
  height: 360,
  color: {
    scheme: "ylgnbu",
    label: "Density"
  },
  facet: {
    data: penguins,
    x: "island"
  },
  marks: [
    Plot.density(penguins, {x: "flipper_length_mm", y: "culmen_length_mm", fill: "density", clip: true}),
    Plot.frame()
  ]
})
```

Similarly, when arranged by series (here, specified with *stroke*), the series with the highest local maximum will drive the thresholds which will then be used across all the series.

```js
Plot.plot({
  width: 360,
  height: 360,
  inset: 20,
  color: {
    legend: true
  },
  marks: [
    Plot.density(penguins, {
      x: "flipper_length_mm",
      y: "culmen_length_mm",
      stroke: "species",
      fill: "species",
      title: "species",
      fillOpacity: 0.1,
      thresholds: 15,
      mixBlendMode: "multiply",
      clip: true
    }),
    Plot.frame()
  ]
})
```

With the default settings, the density is the local average number of dots on an area of ${tex`100\text{px}^2`}—a square of 10px by 10px. This can be multiplied by the dots’ weights.

The **weight** is the importance of each data point, and defaults to 1 (counting dots). Otherwise, the weight is usually specified as a channel, used to signify that some points have proportionally more influence than others.

```js
viewof skew = Inputs.range([-1, 1], {step: 0.01, label: "Skew (-M/+F)"})
```

```js
Plot.plot({
  width: 360,
  height: 360,
  nice: true,
  color: {legend: true},
  marks: [
    Plot.density(penguins.filter(d => d.sex), {
      weight: d => d.sex === "MALE" ? 1 - skew : 1 + skew,
      x: "flipper_length_mm",
      y: "culmen_length_mm",
      strokeOpacity: 0.5,
      clip: true
    }),
    Plot.dot(penguins.filter(d => d.sex), {
      x: "flipper_length_mm",
      y: "culmen_length_mm",
      stroke: "sex",
      strokeOpacity: d => d.sex === "MALE" ? 1 - skew : 1 + skew
    }),
    Plot.frame()
  ]
})
```

A common use case (or “trick”, if you will) is to specify a negative weight for points that
the density contours should avoid—allowing to to draw regions of influence that
do not overlap.

```js
Plot.plot({
  width: 360,
  height: 360,
  nice: true,
  color: {legend: true},
  marks: [
    ["Adelie", "Chinstrap", "Gentoo"].map((species) =>
      Plot.density(penguins, {
        weight: d => d.species === species ? 1 : -1,
        x: "flipper_length_mm",
        y: "culmen_length_mm",
        z: null,
        fill: () => species,
        fillOpacity: 0.2,
        thresholds: [0.05],
        clip: true
      })
    ),
    Plot.dot(penguins, {
      x: "flipper_length_mm",
      y: "culmen_length_mm",
      fill: "species",
      strokeWidth: 0.5,
      stroke: "white"
    }),
    Plot.frame()
  ]
})
```
