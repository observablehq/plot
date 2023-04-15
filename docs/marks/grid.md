<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

</script>

# Grid mark

Draws an axis-aligned grid.

:::plot
```js
Plot.gridX().plot({x: {type: "linear"}})
```
:::

:::plot
```js
Plot.gridX(d3.range(101), {stroke: Plot.identity, strokeOpacity: 1}).plot()
```
:::

## Grid options

The optional *data* is an array of tick values—it defaults to the scale’s ticks. The grid mark draws a line for each tick value, across the whole frame.

The following options are supported:

* **strokeDasharray** - the [stroke dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) for dashed lines, defaults to null

The following options are supported as constant or data-driven channels:

* **stroke** - the grid color, defaults to *currentColor*
* **strokeWidth** - the grid’s line width, defaults to 1
* **strokeOpacity** - the stroke opacity, defaults to 0.1
* **y1** - the start of the line, a channel of *y* positions
* **y2** - the end of the line, a channel of *y* positions

All the other common options are supported when applicable (*e.g.*, **title**).

## gridX(*data*, *options*)

```js
Plot.gridX({strokeDasharray: "5,3"})
```

Returns a new *x* grid with the given *options*.

## gridY(*data*, *options*)

```js
Plot.gridY({strokeDasharray: "5,3"})
```

Returns a new *y* grid with the given *options*.

## gridFx(*data*, *options*)

```js
Plot.gridFx({strokeDasharray: "5,3"})
```

Returns a new *fx* grid with the given *options*.

## gridFy(*data*, *options*)

```js
Plot.gridFy({strokeDasharray: "5,3"})
```

Returns a new *fy* grid with the given *options*.
