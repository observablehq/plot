<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import alphabet from "../data/alphabet.ts";
import aapl from "../data/aapl.ts";
import penguins from "../data/penguins.ts";

</script>

# Crosshair mark

The **crosshair mark** shows the *x* (horizontal↔︎ position) and *y* (vertical↕︎ position) value of the point closest to the [pointer](./pointer.md) on the bottom and left sides of the frame, respectively.

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

For charts which have a “dominant” dimension, such as time in a time-series chart, use the crosshairX or crosshairY mark for the [pointerX](./pointer.md#pointerx-options) or [pointerY](./pointer.md#pointery-options) transform as appropriate.

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

:::plot defer https://observablehq.com/@observablehq/plot-colored-crosshair
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

## crosshair(*data*, *options*)

```js
Plot.crosshair(cars, {x: "economy (mpg)", y: "cylinders"})
```

Returns a new crosshair for the given *data* and *options*, drawing horizontal and vertical rules. The corresponding **x** and **y** values are also drawn just outside the bottom and left sides of the frame, respectively, typically on top of the axes. If either **x** or **y** is not specified, the crosshair will be one-dimensional.

## crosshairX(*data*, *options*)

```js
Plot.crosshairX(aapl, {x: "Date", y: "Close"})
```

Like crosshair, but using [pointerX](./pointer.md#pointerx-options) when *x* is the dominant dimension, like time in a time-series chart.

## crosshairY(*data*, *options*)

```js
Plot.crosshairY(aapl, {x: "Date", y: "Close"})
```

Like crosshair, but using [pointerY](./pointer.md#pointery-options) when *y* is the dominant dimension.
