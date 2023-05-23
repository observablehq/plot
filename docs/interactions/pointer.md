<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import aapl from "../data/aapl.ts";
import penguins from "../data/penguins.ts";

</script>

# Pointer transform

The **pointer interaction** is a primitive that, combined with a mark, allows to create meaningful [interactions](../features/interactions.md) on a chart.

The pointer interaction is often invoked implicitly by the standard marks that support the **tip** option to generate an interative [tip](../marks/tip.md) that displays, on demand, the channel values. It also powers the [crosshair](./crosshair.md) interactive mark.

:::plot defer
```js{5}
Plot.dot(penguins, {
  x: "culmen_length_mm",
  y: "culmen_depth_mm",
  stroke: "sex",
  tip: true
}).plot()
```
:::

However, the pointer interaction can be paired with any mark, not just a tip or crosshair: a dot, say, to emphasize the focused point:

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species"}),
    Plot.dot(penguins, Plot.pointer({x: "culmen_length_mm", y: "culmen_depth_mm", r: 5}))
  ]
})
```
:::

You can independently control the target position from the display using the **px** and **py** channels, say to show the currently-focused point’s value at the top.

:::plot defer
```js{6-7}
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species"}),
    Plot.dot(penguins, Plot.pointer({x: "culmen_length_mm", y: "culmen_depth_mm", r: 5})),
    Plot.text(penguins, Plot.pointer({
      px: "culmen_length_mm",
      py: "culmen_depth_mm",
      text: "species",
      frameAnchor: "top",
      dy: 10,
      fill: "species",
      fontSize: 20
    }))
  ]
})
```
:::

The pointer interaction is a special *render transform* which listens to the pointermove and pointerenter events on the plot’s svg element to detect the mouse or tap location. When the pointer moves, it identifies the closest data point *i* —provided its distance to the pointer is lower than **maxRadius**. When that closest point changes, the mark is rerendered with an index equal to [*i*]—typically removing the representation of any previously selected data point and showing the selected value instead.

The pointer interaction (and by extension the crosshair mark and tip mark option) supports “click-to-stick”: if you click on the chart, the currently-focused point will remain locked until you click again. By temporarily locking the pointer, you can select text from the tip for copy and paste. (On mobile, tap on the screen to select and show the closest point.)

The pointer interaction supports both two-dimensional (pointer) and one-dimensional (pointerX and pointerY) pointing modes. A one-dimensional pointing will typically be used on the independent dimension of a chart, for example on a time-series chart to find the closest *x*-value:

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.lineY(aapl, {x: "Date", y: "Close"}),
    Plot.dot(aapl, Plot.pointerX({x: "Date", y: "Close", r: 5, fill: "red"}))
  ]
})
```
:::

## Pointer options

The following options control the pointer interaction:

* **px** - the horizontal position of the pointer
* **py** - the vertical position of the pointer
* **maxRadius** - the reach, or maximum distance, in pixels; defaults to 40

**px** and **py** are specified as abstract values in “data space”. If **px** is not specified, it falls back to **x1**, **x2**, or **x**. If **py** is not specified, it falls back to **y1**, **y2**, or **y**. This allows to listen to pointer movements in some location and display the mark (a tip, or a text) in a different—and possibly fixed—location.

## pointer(*options*)

```js
Plot.pointer({x: "culmen_length_mm", y: "culmen_depth_mm"})
```

Given a position along *x* and *y*, adds a pointer interaction to the given *options*, and returns the options. The interaction selects the closest point to the user gesture. It listens to the pointermove and pointerenter events on the plot’s svg element to detect the mouse or tap location. It then selects the data point *i* that is closest to that location, and rerenders the mark with the index [*i*]. If the distance in pixels from the pointer location to the selected data point is greater than **maxRadius**, the selection is empty. The interaction also listens to pointerdown events, and toggles the sticky behavior. When the behavior is sticky, pointermove events are ignored—allowing the user, for example, to select and copy the text in the tip mark. The pointerout events (when the mouse exists the region of the plot), also empty the selection, and rerender the mark.

## pointerX(*options*)

```js
Plot.pointerX({x: "Date", y: "Close"})
```

Like pointer, but the distance is computed (mainly) along the *x* dimension—with a tiny contribution of the vertical distance along the *y* axis to disambiguate ties. Intended to work with any mark that privileges the horizontal dimension for pointing, such as a vertical bar chart, a temporal line chart where time is horizontal, etc.

## pointerY(*options*)

```js
Plot.pointerY({x: "frequency", y: "letter"})
```

Like pointer, but the distance is computed (mainly) along the *y* dimension—with a tiny contribution of the horizontal distance along the *x* axis to disambiguate ties. Intended to work with any mark that privileges the vertical dimension for pointing, such as a horizontal bar chart.
