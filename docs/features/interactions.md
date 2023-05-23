<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";

const olympians = shallowRef([
  {weight: 31, height: 1.21, sex: "female"},
  {weight: 170, height: 2.21, sex: "male"}
]);

onMounted(() => {
  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
});

</script>

# Interactions

Interaction allows reading values out of a plot (details on demand), or fluidly changing a view of data without editing code (zoom and filter). There are a variety of ways to achieve interaction with Plot, including built-in interaction features and development techniques with frameworks such as Observable and React.

## Pointing

When looking at a scatterplot, the reader may wonder, *what abstract values does this dot represent?*

The [pointer transform](../interactions/pointer.md) can provide an answer: it dynamically [filters](../transforms/filter.md) a mark such that only the data closest to the pointer (such as the mouse) is rendered. The pointer transform is often paired with the [tip mark](../marks/tip.md) for interactive tooltips, revealing exact values as the pointer moves over the plot. The tip can show additional fields not otherwise visible, such as the *name* and *sport* of Olympic athletes below.

:::plot defer
```js
Plot.dot(olympians, {
  x: "weight",
  y: "height",
  stroke: "sex",
  channels: {name: "name", sport: "sport"},
  tip: true
}).plot()
```
:::

The [crosshair mark](../marks/crosshair.md) uses the pointer transform internally to display a [rule](../marks/rule.md) and a [text](../marks/text.md) showing the **x** (horizontal↔︎ position) and **y** (vertical↕︎ position) value of the nearest data.

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.dot(olympians, {x: "weight", y: "height", stroke: "sex"}),
    Plot.crosshair(olympians, {x: "weight", y: "height"})
  ]
})
```
:::

These values are displayed atop the axes on the edge of the frame; unlike the tip mark, the crosshair mark will not obscure other marks in the plot.

## Selecting

Support for selecting points within a plot through direct manipulation is under development. If you are interested in this feature, please upvote [#5](https://github.com/observablehq/plot/issues/5). See [#721](https://github.com/observablehq/plot/pull/721) for some early work on brushing.

## Zooming

Support for interactive panning and zooming is planned for a future release. If you are interested in this feature, please upvote [#1590](https://github.com/observablehq/plot/issues/1590).

## Animation

Support for declarative animation is planned for a future release. If you are interested in this feature, please upvote [#166](https://github.com/observablehq/plot/issues/166). See [#995](https://github.com/observablehq/plot/pull/995) for some early work on a **time** channel.

## Custom reactivity

With the exception of render transforms (see the [pointer transform](https://github.com/observablehq/plot/blob/main/src/interactions/pointer.js) implementation), Plot does not currently provide incremental re-rendering (partial updates to previously-rendered plots) or animated transitions between views.

That said, you can simply throw away an old plot and replace it with a new one! This allows plotting of dynamic data: data which can change in real-time as it streams in, or because it is derived in response to external inputs such as range sliders and search boxes.

On Observable, you can use [viewof](https://observablehq.com/@observablehq/views) in conjunction with [Observable Inputs](https://observablehq.com/@observablehq/inputs) for interactivity. If your cell references another cell, it will automatically re-run whenever the upstream cell’s value changes. For example, try dragging the slider in this [hexbin example](https://observablehq.com/@observablehq/plot-hexbin-binwidth?intent=fork). In React, use [useEffect](https://react.dev/reference/react/useEffect) and [useRef](https://react.dev/reference/react/useRef) to re-render the plot when data changes. In Vue, use [ref](https://vuejs.org/api/reactivity-core.html#ref). For more, see our [getting started guide](../getting-started.md).

You can also manipulate the SVG that Plot creates, if you are comfortable using lower-level APIs; see examples by [Mike Freeman](https://observablehq.com/@mkfreeman/plot-animation) and [Philippe Rivière](https://observablehq.com/@fil/plot-animate-a-bar-chart).
