<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref} from "vue";
import alphabet from "../data/alphabet.ts";

const atop = ref(true);

</script>

# Grid mark <VersionBadge version="0.6.3" />

The **grid mark** is a specially-configured [rule](./rule.md) for drawing an axis-aligned grid. Like the [axis mark](./axis.md), a grid mark is automatically generated by Plot when you use the **grid** scale option. But you can also declare a grid mark explicitly, for example to draw grid lines atop rather than below bars.

<p>
  <label class="label-input">
    Show grid on top:
    <input type="checkbox" v-model="atop">
  </label>
</p>

:::plot
```js
Plot.plot({
  x: {axis: "top", percent: true, grid: !atop},
  marks: [
    Plot.barX(alphabet, {x: "frequency", y: "letter", sort: {y: "width"}}),
    atop ? Plot.gridX({interval: 1, stroke: "var(--vp-c-bg)", strokeOpacity: 0.5}) : null,
    Plot.ruleX([0])
  ]
})
```
:::

The **interval** option above instructs the grid lines to be drawn at unit intervals, _i.e._ whole percentages. As an alternative, you can use the **ticks** option to specify the desired number of ticks or the **tickSpacing** option to specify the desired separation between adjacent ticks in pixels.

:::plot
```js
Plot.gridX().plot({x: {type: "linear"}})
```
:::

The color of the grid lines can be controlled with the **stroke** option (or the alias **color**). While this option is are typically set to a constant color (such as _red_ or the default _currentColor_), it can be specified as a channel to assign colors dynamically based on the associated tick value.

:::plot
```js
Plot.gridX(d3.range(101), {stroke: Plot.identity, strokeOpacity: 1}).plot()
```
:::

You can set other [stroke options](../features/marks.md#mark-options) to further customize the appearance, say for dashed strokes.

:::plot
```js
Plot.gridX({strokeDasharray: "2", strokeOpacity: 1}).plot({x: {type: "linear"}})
```
:::

See the [axis mark](./axis.md) for more details and examples.

## Grid options

The optional *data* is an array of tick values — it defaults to the scale’s ticks. The grid mark draws a line for each tick value, across the whole frame.

The following options are supported:

* **strokeDasharray** - the [stroke dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) for dashed lines, defaults to null

The following options are supported as constant or data-driven channels:

* **stroke** - the grid color, defaults to *currentColor*
* **strokeWidth** - the grid’s line width, defaults to 1
* **strokeOpacity** - the stroke opacity, defaults to 0.1
* **y1** - the start of the line, a channel of *y* positions
* **y2** - the end of the line, a channel of *y* positions

All the other common options are supported when applicable (*e.g.*, **title**).

## gridX(*data*, *options*) {#gridX}

```js
Plot.gridX({strokeDasharray: "5,3"})
```

Returns a new *x* grid with the given *options*.

## gridY(*data*, *options*) {#gridY}

```js
Plot.gridY({strokeDasharray: "5,3"})
```

Returns a new *y* grid with the given *options*.

## gridFx(*data*, *options*) {#gridFx}

```js
Plot.gridFx({strokeDasharray: "5,3"})
```

Returns a new *fx* grid with the given *options*.

## gridFy(*data*, *options*) {#gridFy}

```js
Plot.gridFy({strokeDasharray: "5,3"})
```

Returns a new *fy* grid with the given *options*.
