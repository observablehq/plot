<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import alphabet from "../data/alphabet.ts";
import aapl from "../data/aapl.ts";
import penguins from "../data/penguins.ts";

</script>

# Crosshair mark <VersionBadge version="0.6.7" />

The **crosshair mark** shows the *x* (horizontal↔︎ position) and *y* (vertical↕︎ position) value of the point closest to the [pointer](./pointer.md) on the bottom and left sides of the frame, respectively.

<!-- TODO: add .move() to data-based crosshair, then use it here -->
:::plot defer https://observablehq.com/@observablehq/plot-crosshair
```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"}),
    Plot.crosshair(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```
:::

For charts which have a “dominant” dimension, such as time in a time-series chart, use the crosshairX or crosshairY mark for the [pointerX](./pointer.md#pointerX) or [pointerY](./pointer.md#pointerY) transform as appropriate.

:::plot defer https://observablehq.com/@observablehq/plot-crosshairx
```js
Plot.plot({
  marks: [
    Plot.lineY(aapl, {x: "Date", y: "Close"}),
    Plot.crosshairX(aapl, {x: "Date", y: "Close"})
  ]
})
```
:::

If either **x** or **y** is not specified, the crosshair is one-dimensional.

:::plot defer https://observablehq.com/@observablehq/plot-one-dimensional-crosshair
```js
Plot.plot({
  marks: [
    Plot.tickX(penguins, {x: "body_mass_g"}),
    Plot.crosshairX(penguins, {x: "body_mass_g"})
  ]
})
```
:::

The **color** option sets the fill color of the text and the stroke color of the rule. This option can be specified as a channel to reinforce a color encoding.

:::plot defer https://observablehq.com/@observablehq/plot-color-crosshair
```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"}),
    Plot.crosshair(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", color: "sex", opacity: 0.5})
  ]
})
```
:::

The crosshair mark does not currently support any format options; values are displayed with the default format. If you are interested in this feature, please upvote [#1596](https://github.com/observablehq/plot/issues/1596). In the meantime, you can implement a custom crosshair using the [pointer transform](./pointer.md) and a [text mark](../marks/text.md).

## Dataless crosshair

When called without data, the crosshair tracks the raw pointer position and inverts the plot's scales. This is useful when you want a crosshair on any plot — even one without data that matches the crosshair's position channels — or when you want to read coordinates directly from the scales.

:::plot defer
```js
Plot.plot({
  x: {type: "utc", domain: [new Date("2010-01-01"), new Date("2025-01-01")]},
  y: {domain: [0, 100]},
  marks: [
    Plot.frame(),
    Plot.gridX(),
    Plot.gridY(),
    Plot.crosshair()
  ]
})
```
:::

Displayed values are automatically rounded to the optimal precision that distinguishes neighboring pixels.

## Input events

The crosshair dispatches [*input* events](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event) when the pointer moves. The plot's value (`plot.value`) is set to an object with **x** and **y** properties (the scale-inverted values), or null when the pointer leaves the frame.

```js
const crosshair = Plot.crosshair();
const plot = crosshair.plot({
  x: {domain: [0, 100]},
  y: {domain: [0, 100]},
  marks: [Plot.frame()]
});

plot.addEventListener("input", () => {
  console.log(plot.value); // {x: 42, y: 73} or null
});
```

For faceted plots, the value also includes **fx** and **fy** when applicable.

## Crosshair options

The following options are supported:

- **x** - the horizontal position; bound to the *x* scale
- **y** - the vertical position; bound to the *y* scale
- **color** - shorthand for setting both **ruleStroke** and **textFill**
- **opacity** - shorthand for setting **ruleStrokeOpacity**
- **ruleStroke** - the rule stroke color
- **ruleStrokeOpacity** - the rule stroke opacity; defaults to 0.2
- **ruleStrokeWidth** - the rule stroke width; defaults to 1
- **textFill** - the text fill color
- **textFillOpacity** - the text fill opacity
- **textStroke** - the text stroke color; defaults to *white* to improve legibility
- **textStrokeOpacity** - the text stroke opacity; defaults to 1
- **textStrokeWidth** - the text stroke width; defaults to 5
- **maxRadius** - the maximum pointing distance, in pixels; defaults to 40

The crosshair mark supports faceting, but most other mark options are ignored.

## crosshair(*data*, *options*) {#crosshair}

```js
Plot.crosshair(cars, {x: "economy (mpg)", y: "cylinders"})
```

Returns a new crosshair for the given *data* and *options*, drawing horizontal and vertical rules. The corresponding **x** and **y** values are also drawn just outside the bottom and left sides of the frame, respectively, typically on top of the axes. If either **x** or **y** is not specified, the crosshair will be one-dimensional.

## crosshair(*options*) {#crosshair-dataless}

```js
Plot.crosshair()
```

When called without data, returns a dataless crosshair that tracks the raw pointer position and inverts the plot's scales. The returned mark has a [move](#crosshair-move) method for programmatic control.

## crosshairX(*data*, *options*) {#crosshairX}

```js
Plot.crosshairX(aapl, {x: "Date", y: "Close"})
```

Like crosshair, but using [pointerX](./pointer.md#pointerX) when *x* is the dominant dimension, like time in a time-series chart. When called without data, returns a dataless crosshair restricted to the *x* dimension.

## crosshairY(*data*, *options*) {#crosshairY}

```js
Plot.crosshairY(aapl, {x: "Date", y: "Close"})
```

Like crosshair, but using [pointerY](./pointer.md#pointerY) when *y* is the dominant dimension. When called without data, returns a dataless crosshair restricted to the *y* dimension.

## *crosshair*.move(*value*) {#crosshair-move}

```js
crosshair.move({x: new Date("2020-06-01"), y: 42})
```

Programmatically sets the crosshair position in data space. Pass an object with **x** and/or **y** values to show the crosshair at that position, or null to hide it. The plot dispatches an *input* event, just as if the user had moved the pointer.

```js
crosshair.move(null) // hide
```

For faceted plots, include **fx** or **fy** to target a specific facet:

```js
crosshair.move({x: 45, y: 17, fx: "Chinstrap"})
```
