# Vector

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
