# Frame mark

A frame draws a box around the plot area.

```js
Plot.plot({
  grid: true,
  x: {domain: [0, 1]},
  marks: [Plot.frame()]
})
```

Frames are most commonly used in conjunction with facets to provide better separation (Gestalt grouping) of faceted marks. Without a frame, it can be hard to tell where one facet ends and the next begins.

```js
Plot.plot({
  grid: true,
  inset: 10,
  marks: [
    framed ? Plot.frame() : [],
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "#eee"}),
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species"})
  ]
})
```

Unlike other marks, a frame never takes data; the first argument to Plot.frame is the *options* object. (For a similar data-driven mark, see [Plot.rect](./rect.md).)

```js
Plot.plot({
  grid: true,
  x: {domain: [0, 1]},
  marks: [Plot.frame({stroke: "red"})]
})
```

The **anchor** option, if specified to a value of *left*, *right*, *top* or *bottom*, draws only that side of the frame. In that case, the *fill* and *rx*, *ry* options are ignored:

```js
Plot.plot({
  width: 300,
  height: 100,
  margin: 2,
  marks: [
    Plot.frame({ anchor: "left", stroke: "red", strokeWidth: 4 }),
    Plot.frame({ anchor: "right", stroke: "green", strokeWidth: 4 }),
    Plot.frame({ anchor: "top", stroke: "blue", strokeWidth: 4 }),
    Plot.frame({ anchor: "bottom", stroke: "black", strokeWidth: 4 })
  ]
})
```

## Frame options

Draws a simple frame around the entire plot (or facet).

The frame mark supports the [standard mark options](#marks), and the **rx** and **ry** options to set the [*x* radius](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx) and [*y* radius](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/ry) for rounded corners. It does not accept any data or support channels. The default **stroke** is currentColor, and the default **fill** is none.

If the **anchor** option is specified as one of *left*, *right*, *top*, or *bottom*, that side is rendered as a single line (and the **fill**, **fillOpacity**, **rx**, and **ry** options are ignored).

## frame(*options*)

```js
Plot.frame({stroke: "red"})
```

Returns a new frame with the specified *options*.
