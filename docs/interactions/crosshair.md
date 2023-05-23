<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import alphabet from "../data/alphabet.ts";
import aapl from "../data/aapl.ts";
import penguins from "../data/penguins.ts";

</script>

# Crosshair mark

The **crosshair mark** shows the *x* (horizontal↔︎ position) and *y* (vertical↕︎ position) value of the point closest to the [pointer](./pointer.md) on the bottom and left sides of the frame, respectively.

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "sex"}),
    Plot.crosshair(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```
:::

If either **x** or **y** is not specified, the crosshair is be one-dimensional.

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.tickX(penguins, {x: "body_mass_g"}),
    Plot.crosshair(penguins, {x: "body_mass_g"})
  ]
})
```
:::

For charts which have an independent variable, typically a time series with dates on the *x* axis, the crosshairX mark is recommended to track the horizontal position of the pointer.

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.lineY(aapl, {x: "Date", y: "Close"}),
    Plot.crosshairX(aapl, {x: "Date", y: "Close"})
  ]
})
```
:::

Conversely, for charts where the independent variable is along the *y* axis, the crosshairY mark is recommended to track the vertical position of the pointer.

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.barX(alphabet, {x: "frequency", y: "letter", fillOpacity: 0.25, sort: {y: "-x"}}),
    Plot.crosshairY(alphabet, {x: "frequency", y: "letter", ruleStrokeOpacity: 1})
  ]
})
```
:::

## Crosshair options

The following options are supported:

* **maxRadius** - reach of the crosshair pointer; defaults to 40 pixels
* **ruleStroke** - the rule color
* **textFill** - the text fill color
* **textStroke** - the text stroke color; defaults to *white* to improve legibility
* **color** - shorthand for setting both **ruleStroke** and **textFill**
* **ruleStrokeOpacity** - the rule stroke opacity; defaults to 0.2
* **ruleStrokeWidth** - the rule stroke width; defaults to 1
* **ruleStrokeOpacity** - the rule stroke opacity; defaults to 0.2
* **textStrokeOpacity** - the text stroke opacity; defaults to 1
* **textStrokeOpacity** - the text stroke width; defaults to 5

## crosshair(*data*, *options*)

```js
Plot.crosshair(cars, {x: "economy (mpg)", y: "cylinders"})
```

Returns a new crosshair for the given *data* and *options*, drawing horizontal and vertical rules centered at the point closest to the [pointer](./pointer.md#pointeroptions). The corresponding **x** and **y** values are also drawn just outside the bottom and left sides of the frame, respectively, typically on top of the axes. If either **x** or **y** is not specified, the crosshair will be one-dimensional.

## crosshairX(*data*, *options*)

```js
Plot.crosshairX(aapl, {x: "Date", y: "Close"})
```

Like crosshair, but uses the [pointerX](./pointer.md#pointerxoptions) transform: the determination of the closest point is heavily weighted by the *x* (horizontal↔︎) position; this should be used for plots where *x* represents the independent variable, such as time in a time-series chart, or the aggregated dimension when grouping or binning.

## crosshairY(*data*, *options*)

```js
Plot.crosshairY(alphabet, {x: "frequency", y: "letter"})
```

Like crosshair, but uses the [pointerY](./pointer.md#pointeryoptions) transform: the determination of the closest point is heavily weighted by the *y* (vertical↕︎) position; this should be used for plots where *y* represents the independent variable, such as time in a time-series chart, or the aggregated dimension when grouping or binning.
