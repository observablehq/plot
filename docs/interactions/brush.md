<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref, shallowRef, onMounted} from "vue";

// const pointered = ref(true);
// const aapl = shallowRef([]);
// const industries = shallowRef([]);
// const olympians = shallowRef([]);
const penguins = shallowRef([]);
// const linetip = ref("x");
// const recttip = ref("x");

onMounted(() => {
//  d3.csv("../data/aapl.csv", d3.autoType).then((data) => (aapl.value = data));
//  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
//  d3.csv("../data/bls-industry-unemployment.csv", d3.autoType).then((data) => (industries.value = data));
  d3.csv("../data/penguins.csv", d3.autoType).then((data) => (penguins.value = data));
});

</script>

# Brush transform

The **brush transform** filters a mark interactively such that only the data that fall within the rectangular region defined by the user are rendered. It is typically used to select discrete elements, such as dots in a scatterplot:

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "currentColor"}),
    Plot.dot(penguins, Plot.brush({x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species", stroke: "currentColor", r: 4}))
  ]
})
```
:::

When the chart has a dominant axis, an horizontal or vertical brush is recommended; for example, to select bars in a histogram:

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.rectY(penguins, Plot.binX({y: "count"}, {x: "body_mass_g", thresholds: 40, fillOpacity: 0.2})),
    Plot.rectY(penguins, Plot.brushX(Plot.binX({y: "count"}, {fill:"currentColor", x: "body_mass_g", thresholds: 40}))),
  ]
})
```
:::

The brush transform is similar to the [pointer](../interaction/pointer.md) transform: it interactively filters the mark’s index to show a subset of the data, and re-renders the mark as the selection changes. Since the mark is lazily rendered during interaction, it is fast: only the visible elements are rendered as needed. And, like the filter and select transforms, unfiltered channel values are incorporated into default scale domains.

The brush transform supports both one- and two-dimensional brushing modes. The two-dimensional mode, [brush](#brush-options-1), is used above and is suitable for scatterplots and the general case: it allows the user to define a rectangular region by clicking on a corner (_e.g._ the top-left corner) and dragging the pointer to the bottom-right corner. The one-dimensional modes, [brushX](#brushx-options) and [brushY](#brushy-options), in contrast only consider one dimension; this is desirable when a chart has a “dominant” dimension, such as time in a time-series chart, the binned quantitative dimension in a histogram, or the categorical dimension of a bar chart.

The brush transform emits an [*input* event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event) whenever the selection changes, and sets the value of the plot element to the selected data. This allows you to use a plot as an [Observable view](https://observablehq.com/@observablehq/views) (viewof), or to register an *input* event listener to react to brushing.

## Brush options

The following options control the brush transform:

- **x1** - the starting horizontal↔︎ target position; bound to the *x* scale
- **y1** - the starting vertical↕︎ target position; bound to the *y* scale
- **x2** - the ending horizontal↔︎ target position; bound to the *x* scale
- **y2** - the ending vertical↕︎ target position; bound to the *y* scale
- **x** - the fallback horizontal↔︎ target position; bound to the *x* scale
- **y** - the fallback vertical↕︎ target position; bound to the *y* scale
- **selectionMode** - controls the value exposed to listeners of the *input* events.

The positional options define a sensitive surface for each data point, defined on the horizontal axis as the extent between *x1* and *x2* if specified, between *x* and *x + bandwidth* if *x* is a band scale, or the value *x* otherwise. The sensitive surface’s vertical extent likewise spans from *y1* to *y2* if specified, from *y* to *y + bandwidth* if *y* is a band scale, or is equal to the *y* value otherwise.

When the user interacts with the plot by clicking and dragging the brush to define a rectangular region, all the elements whose sensitive surface intersect with the brushed region are selected, and the mark is re-rendered.

The brush’s selection mode determines the contents of the plot’s value property when the user manipulates the brush. It supports the following options:

* **data** - default; the selected data
* **extent** - the selection extent, in data space

The selected data is an array of the possibly transformed data rendered by the mark. For example, in the case of the histogram above, the selected data is an array of bins, each containing the penguins whose body mass is between the bin’s lower and upper bounds.

The selection extent is an object with properties *x*: [x1, x2] for brushX, *y*: [y1, y2] for brushY, and both *x* and *y* for brush. Additionally, when faceting, it contains the facet’s *fx* and *fy* properties.

For details on the user interface (including touch events, pointer events and modifier keys), see [d3-brush](https://github.com/d3/d3-brush).

## brush(*options*)

```js
Plot.dot(penguins, Plot.brush({x: "culmen_length_mm", y: "culmen_depth_mm"}))
```

Applies the brush render transform to the specified *options* to filter the mark index such that the points whose sensitive surface intersect with the brushed region the point closest to the pointer is rendered; the mark will re-render interactively in response to brush events.

## brushX(*options*)

```js
Plot.tip(aapl, Plot.pointerX({x: "Date", y: "Close"}))
```

Like [brush](#brush-options-1), except the determination of the intersection exclusively considers the *x* (horizontal↔︎) position; this should be used for plots where *x* is the dominant dimension, such as the binned quantitative dimension in a histogram, or the categorical dimension of a bar chart.

## brushY(*options*)

```js
Plot.tip(alphabet, Plot.pointerY({x: "frequency", y: "letter"}))
```

Like [brush](#brush-options-1), except the determination of the intersection exclusively considers the *y* (vertical↕) position; this should be used for plots where *y* is the dominant dimension.
