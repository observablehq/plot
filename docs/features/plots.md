# Plots

:::danger TODO
This guide is still under construction. 🚧 Please come back when it’s finished.
:::

## plot(*options*)

Renders a new plot given the specified *options* and returns the corresponding SVG or HTML figure element. All *options* are optional.

## *mark*.plot(*options*)

Given a *mark*, such as the result of calling [Plot.barY](../marks/bar.md), you can call *mark*.plot to render a plot. This is [shorthand](./shorthand.md) for calling [Plot.plot](./plots.md) where the *marks* option specifies this single mark.

```js
const mark = Plot.barY(alphabet, {x: "letter", y: "frequency"});
return mark.plot();
```

More commonly this shorthand is written as a single expression:

```js
Plot.barY(alphabet, {x: "letter", y: "frequency"}).plot()
```

This is equivalent to:

```js
Plot.plot({marks: [Plot.barY(alphabet, {x: "letter", y: "frequency"})]})
```

If needed, you can pass additional *options* to *mark*.plot, which is equivalent to passing *options* to Plot.plot. (If the *marks* option is used, additional marks are concatenated with the shorthand *mark*.)

```js
Plot.barY(alphabet, {x: "letter", y: "frequency"}).plot({width: 1024})
```

## Marks

The **marks** option specifies an array of [marks](./plots.md#marks) to render. Each mark has its own data and options; see the respective mark type (*e.g.*, [bar](../marks/bar.md) or [dot](../marks/dot.md)) for which mark options are supported. Each mark may be a nested array of marks, allowing composition. Marks may also be a function which returns an SVG element, if you wish to insert some arbitrary content into your plot. And marks may be null or undefined, which produce no output; this is useful for showing marks conditionally (*e.g.*, when a box is checked). Marks are drawn in *z* order, last on top. For example, here a single rule at *y* = 0 is drawn on top of blue bars for the [*alphabet* dataset](https://observablehq.com/@observablehq/sample-datasets).

```js
Plot.plot({
  marks: [
    Plot.barY(alphabet, {x: "letter", y: "frequency", fill: "steelblue"}),
    Plot.ruleY([0])
  ]
})
```

## Layout

These options determine the overall layout of the plot; all are specified as numbers in pixels:

* **marginTop** - the top margin
* **marginRight** - the right margin
* **marginBottom** - the bottom margin
* **marginLeft** - the left margin
* **margin** - shorthand for the four margins
* **width** - the outer width of the plot (including margins)
* **height** - the outer height of the plot (including margins)
* **aspectRatio** - the desired aspect ratio of data (affecting default **height**)

The default **width** is 640. On Observable, the width can be set to the [standard width](https://github.com/observablehq/stdlib/blob/main/README.md#width) to make responsive plots. The default **height** is chosen automatically based on the plot’s associated scales; for example, if *y* is linear and there is no *fy* scale, it might be 396. The default margins depend on the maximum margins of the plot’s constituent [marks](./plots.md#marks). While most marks default to zero margins (because they are drawn inside the chart area), Plot’s [axis mark](../marks/axis.md) has non-zero default margins.

The **aspectRatio** option, if not null, computes a default **height** such that a variation of one unit in the *x* dimension is represented by the corresponding number of pixels as a variation in the *y* dimension of one unit. Note: when using facets, set the *fx* and *fy* scales’ **round** option to false if you need an exact aspect ratio.

## Other options

The **style** option allows custom styles to override Plot’s defaults. It may be specified either as a string of inline styles (*e.g.*, `"color: red;"`, in the same fashion as assigning [*element*.style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)) or an object of properties (*e.g.*, `{color: "red"}`, in the same fashion as assigning [*element*.style properties](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration)). Note that unitless numbers ([quirky lengths](https://www.w3.org/TR/css-values-4/#deprecated-quirky-length)) such as `{padding: 20}` may not be supported by some browsers; you should instead specify a string with units such as `{padding: "20px"}`. By default, the returned plot has a white background, a max-width of 100%, and the system-ui font. Plot’s marks and axes default to [currentColor](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#currentcolor_keyword), meaning that they will inherit the surrounding content’s color. For example, a dark theme:

```js
Plot.plot({
  marks: …,
  style: {
    background: "black",
    color: "white"
  }
})
```

If a **caption** is specified, Plot.plot wraps the generated SVG element in an HTML figure element with a figcaption, returning the figure. To specify an HTML caption, consider using the [`html` tagged template literal](http://github.com/observablehq/htl); otherwise, the specified string represents text that will be escaped as needed.

```js
Plot.plot({
  marks: …,
  caption: html`Figure 1. This chart has a <i>fancy</i> caption.`
})
```

The generated SVG element has a random class name which applies a default stylesheet. Use the top-level **className** option to specify that class name.

The **document** option specifies the [document](https://developer.mozilla.org/en-US/docs/Web/API/Document) used to create plot elements. It defaults to window.document, but can be changed to another document, say when using a virtual DOM library for server-side rendering in Node.
