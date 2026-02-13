<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {shallowRef, computed, onMounted} from "vue";
import penguins from "../data/penguins.ts";

const world = shallowRef(null);
const land = computed(() => world.value && topojson.feature(world.value, world.value.objects.land));
const allCities = shallowRef([]);
const cities = computed(() => allCities.value.filter((d) => d.population > 500000));

onMounted(() => {
  d3.json("../data/countries-110m.json").then((data) => (world.value = data));
  d3.csv("../data/cities-10k.csv", d3.autoType).then((data) => (allCities.value = data));
});

</script>

# Brush mark

The **brush mark** renders a two-dimensional [brush](https://d3js.org/d3-brush) that allows the user to select a rectangular region by clicking and dragging. It is typically used to highlight a subset of data, or to filter data for display in a linked view.

:::plot hidden
```js
Plot.plot({
  marks: ((brush) => (d3.timeout(() => d3.select(brush._brushNodes[0]).call(brush._brush.move, [[100, 60], [300, 200]])), [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "species"}),
    brush
  ]))(Plot.brush())
})
```
:::

```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "species"}),
    Plot.brush()
  ]
})
```

The brush mark does not require data. When added to a plot, it renders a [brush](https://d3js.org/d3-brush) overlay covering the frame. The user can click and drag to create a rectangular selection, drag the selection to reposition it, or drag an edge or corner to resize it. Clicking outside the selection clears it.

## Input events

The brush dispatches an [*input* event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event) whenever the selection changes. The plot’s value (`plot.value`) is set to a [BrushValue](#brushvalue) object when a selection is active, or null when the selection is cleared. This allows you to use a plot as an [Observable view](https://observablehq.com/@observablehq/views), or to register an *input* event listener to react to the brush.

```js
const plot = Plot.plot(options);

plot.addEventListener("input", (event) => {
  console.log(plot.value);
});
```

The **filter** function on the brush value tests whether a data point falls inside the selection. Its signature depends on whether the plot uses faceting:

| Facets      | Signature                      |
|-------------|--------------------------------|
| none        | *filter*(*x*, *y*)             |
| **fx** only | *filter*(*x*, *y*, *fx*)       |
| **fy** only | *filter*(*x*, *y*, *fy*)       |
| both        | *filter*(*x*, *y*, *fx*, *fy*) |

When faceted, the filter returns true only for points in the brushed facet. For example:

```js
plot.addEventListener("input", () => {
  const filter = plot.value?.filter;
  const selected = filter ? penguins.filter((d) => filter(d.culmen_length_mm, d.culmen_depth_mm)) : penguins;
  console.log(selected);
});
```

## Reactive marks

The brush can be paired with reactive marks that respond to the brush state. Create a brush mark, then call its **inactive**, **context**, and **focus** methods to derive options that reflect the selection.

- **inactive** — shows the mark when no selection is active; hides it during brushing.
- **context** — hidden when no selection is active; during brushing, shows points *outside* the selection.
- **focus** — hidden when no selection is active; during brushing, shows points *inside* the selection.

A typical pattern is to layer three reactive marks: the inactive mark provides a default view, while the context and focus marks replace it during brushing, the context dimming unselected points and the focus highlighting selected ones.

:::plot defer hidden
```js
Plot.plot({
  marks: ((brush) => [
    brush,
    Plot.dot(penguins, brush.inactive({x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species", r: 2})),
    Plot.dot(penguins, brush.context({x: "culmen_length_mm", y: "culmen_depth_mm", fill: "#ccc", r: 2})),
    Plot.dot(penguins, brush.focus({x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species", r: 3}))
  ])(Plot.brush())
})
```
:::

```js
const brush = Plot.brush();
Plot.plot({
  marks: [
    brush,
    Plot.dot(penguins, brush.inactive({x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species", r: 2})),
    Plot.dot(penguins, brush.context({x: "culmen_length_mm", y: "culmen_depth_mm", fill: "#ccc", r: 2})),
    Plot.dot(penguins, brush.focus({x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species", r: 3}))
  ]
})
```

:::tip
To achieve higher contrast, place the brush below the reactive marks; reactive marks default to using **pointerEvents** *none* to ensure they don't obstruct pointer events.
:::

## Faceting

The brush mark supports [faceting](../features/facets.md). When the plot uses **fx** or **fy** facets, each facet gets its own brush. Starting a brush in one facet clears any selection in other facets. The dispatched value includes the **fx** and **fy** facet values of the brushed facet, and the **filter** function also filters on the relevant facet values.

:::plot defer hidden
```js
Plot.plot({
  height: 270,
  grid: true,
  marks: ((brush) => [
    Plot.frame(),
    brush,
    Plot.dot(penguins, brush.inactive({x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species", fill: "sex", r: 2})),
    Plot.dot(penguins, brush.context({x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species", fill: "#ccc", r: 2})),
    Plot.dot(penguins, brush.focus({x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species", fill: "sex", r: 3}))
  ])(Plot.brush())
})
```
:::

```js
const brush = Plot.brush();
Plot.plot({
  marks: [
    Plot.frame(),
    brush,
    Plot.dot(penguins, brush.inactive({x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species", fill: "sex", r: 2})),
    Plot.dot(penguins, brush.context({x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species", fill: "#ccc", r: 2})),
    Plot.dot(penguins, brush.focus({x: "culmen_length_mm", y: "culmen_depth_mm", fx: "species", fill: "sex", r: 3}))
  ]
})
```

## Projections

For plots with a [geographic projection](../features/projections.md), the brush operates in screen space. The brush value’s **x1**, **y1**, **x2**, **y2** bounds are expressed in pixels from the top-left corner of the frame, and the **filter** function takes the data's coordinates (typically longitude and latitude) and projects them to test against the brush extent.

<div v-if="land && cities.length">

:::plot defer hidden
```js
Plot.plot({
  projection: "equal-earth",
  marks: ((brush) => [
    Plot.geo(land, {strokeWidth: 0.5}),
    Plot.sphere(),
    brush,
    Plot.dot(cities, brush.inactive({x: "longitude", y: "latitude", r: 2, fill: "#999"})),
    Plot.dot(cities, brush.context({x: "longitude", y: "latitude", r: 1, fill: "#999"})),
    Plot.dot(cities, brush.focus({x: "longitude", y: "latitude", r: 3, fill: "red"}))
  ])(Plot.brush())
})
```
:::

</div>

```js
const brush = Plot.brush();
Plot.plot({
  projection: "equal-earth",
  marks: [
    Plot.geo(land, {strokeWidth: 0.5}),
    Plot.sphere(),
    brush,
    Plot.dot(cities, brush.inactive({x: "longitude", y: "latitude", r: 2, fill: "#999"})),
    Plot.dot(cities, brush.context({x: "longitude", y: "latitude", r: 1, fill: "#999"})),
    Plot.dot(cities, brush.focus({x: "longitude", y: "latitude", r: 3, fill: "red"}))
  ]
})
```

## BrushValue {#brushvalue}

The brush value dispatched on [_input_ events](#input-events). When the brush is cleared, the value is null; otherwise it's an object with the following properties:

- **x1** - the lower *x* bound of the selection (in data space, or pixels if projected)
- **x2** - the upper *x* bound of the selection
- **y1** - the lower *y* bound of the selection
- **y2** - the upper *y* bound of the selection
- **fx** - the *fx* facet value, if applicable
- **fy** - the *fy* facet value, if applicable
- **filter** - a function to test whether a point is inside the selection
- **pending** - `true` during interaction; absent when committed

By convention, *x1* < *x2* and *y1* < *y2*.

The **pending** property indicates the user is still interacting with the brush. To skip intermediate values and react only to committed selections:

```js
plot.addEventListener("input", () => {
  if (plot.value?.pending) return;
  // handle committed value (null if cleared)
});
```

## brush() {#brush}

```js
const brush = Plot.brush()
```

Returns a new brush. The mark exposes the **inactive**, **context**, and **focus** methods for creating reactive marks that respond to the brush state.

## *brush*.inactive(*options*) {#brush.inactive}

```js
Plot.dot(data, brush.inactive({x: "weight", y: "height", fill: "species"}))
```

Returns mark options that show the mark when no brush selection is active, and hide it during brushing. Use this for the default appearance of data before any selection is made.

## *brush*.context(*options*) {#brush.context}

```js
Plot.dot(data, brush.context({x: "weight", y: "height", fill: "#ccc"}))
```

Returns mark options that hide the mark by default and, during brushing, show only the points *outside* the selection. Use this for a dimmed background layer.

## *brush*.focus(*options*) {#brush.focus}

```js
Plot.dot(data, brush.focus({x: "weight", y: "height", fill: "species"}))
```

Returns mark options that hide the mark by default and, during brushing, show only the points *inside* the selection. Use this to highlight the selected data.

## *brush*.move(*value*) {#brush.move}

```js
brush.move({x1: 36, x2: 48, y1: 15, y2: 20})
```

Programmatically sets the brush selection in data space. The *value* must have **x1**, **x2**, **y1**, and **y2** properties. For faceted plots, include **fx** or **fy** to target a specific facet. Pass null to clear the selection.

```js
brush.move({x1: 40, x2: 52, y1: 15, y2: 20, fx: "Chinstrap"})
```

```js
brush.move(null)
```

For projected plots, the coordinates are in pixels (consistent with the [BrushValue](#brushvalue)), so you need to project the two corners of the brush beforehand. In the future Plot might expose its *projection* to facilitate this. Please upvote [this issue](https://github.com/observablehq/plot/issues/1191) to help prioritize this feature.
