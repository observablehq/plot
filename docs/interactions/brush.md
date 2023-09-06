<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref, shallowRef, onMounted} from "vue";

const penguins = shallowRef([]);

onMounted(() => {
  d3.csv("../data/penguins.csv", d3.autoType).then((data) => (penguins.value = data));
});

</script>

# Brush transform

The **brush transform** allows the interactive selection of discrete elements, such as dots in a scatterplot, by direct manipulation of the chart. A brush listens to mouse and touch events on the chart, allowing the user to define a rectangular region. All the data points that fall within the region are included in the selection.

:::plot defer
```js
Plot.dot(
  penguins,
  Plot.brush({
    x: "culmen_length_mm",
    y: "culmen_depth_mm",
    stroke: "currentColor",
    fill: "#fff",
    unselected: {strokeOpacity: 0.5},
    selected: {fill: "species"}
  })
).plot()
```
:::

When the chart has a dominant axis, an horizontal or vertical brush is recommended; for example, to select bars in a histogram:

:::plot defer
```js
Plot.rectY(
  penguins,
  Plot.brushX(
    Plot.binX(
      {y: "count"},
      {
        x: "body_mass_g",
        thresholds: 40,
        unselected: {opacity: 0.1},
      }
    )
  )
).plot()
```
:::

The brush transform interactively partitions the mark’s index in two: the unselected subset — for points outside the region —, and the selected subset for points inside.  As the selection changes, the mark is replaced by two derived marks: below, a mark for the unselected data, with the mark options combined with the **unselected** option; above, a mark for the selected data, with the mark options combined with the **selected** option. All the channel values are incorporated into default scale domains, allowing *e.g.* a color scale to include the fill channel of the selected mark.

The brush transform supports both one- and two-dimensional brushing modes. The two-dimensional mode, [brush](#brush), is suitable for scatterplots and the general case: it allows the user to define a rectangular region by clicking on a corner (_e.g._ the top-left corner) and dragging the pointer to the bottom-right corner. The one-dimensional modes, [brushX](#brushX) and [brushY](#brushY), in contrast only consider one dimension; this is desirable when a chart has a “dominant” dimension, such as time in a time-series chart, the binned quantitative dimension in a histogram, or the categorical dimension of a bar chart.

The brush transform emits an [*input* event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event) whenever the selection changes, and sets the value of the plot element to the selected data. This allows you to use a plot as an [Observable view](https://observablehq.com/@observablehq/views) (viewof), or to register an *input* event listener to react to brushing.

## Brush options

The following options control the brush transform:

- **x1** - the starting horizontal↔︎ target position; bound to the *x* scale
- **y1** - the starting vertical↕︎ target position; bound to the *y* scale
- **x2** - the ending horizontal↔︎ target position; bound to the *x* scale
- **y2** - the ending vertical↕︎ target position; bound to the *y* scale
- **x** - the fallback horizontal↔︎ target position; bound to the *x* scale
- **y** - the fallback vertical↕︎ target position; bound to the *y* scale
- **selected** - additional options for the derived mark representing the selection
- **unselected** - additional options for the derived mark representing non-selected data

The positional options define a sensitive surface for each data point, defined on the horizontal axis as the extent between *x1* and *x2* if specified, between *x* and *x + bandwidth* if *x* is a band scale, or the value *x* otherwise. The sensitive surface’s vertical extent likewise spans from *y1* to *y2* if specified, from *y* to *y + bandwidth* if *y* is a band scale, or is equal to the *y* value otherwise.

When the user interacts with the plot by clicking and dragging the brush to define a rectangular region, all the elements whose sensitive surface intersect with the brushed region are selected, and the derived marks are re-rendered.

The selected data exposed as the value of the plot is an array of the (possibly transformed) data rendered by the *selected* derived mark. For example, in the case of the histogram above, the selected data is an array of bins, each containing the penguins whose body mass is between the bin’s lower and upper bounds.

The value is decorated with the brush’s coordinates (in data space) as its **x1** and **x2** properties for a quantitative scale *x*, and its **x** property if *x* is ordinal — and likewise for *y*. The value is also decorated with a **done** property set to false while brushing, true when the user releases the pointer, and undefined when the brush is canceled. Additionally, when faceting, it exposes the brushed facet’s *fx* and *fy* properties.

For details on the user interface (including touch events, pointer events and modifier keys), see [d3-brush](https://github.com/d3/d3-brush).

## brush(*options*) {#brush}

```js
Plot.dot(penguins, Plot.brush({x: "culmen_length_mm", y: "culmen_depth_mm"}))
```

Applies the brush render transform to the specified *options* to filter the mark index such that the points whose sensitive surface intersect with the brushed region the point closest to the pointer is rendered.

## brushX(*options*) {#brushX}

```js
Plot.tip(aapl, Plot.pointerX({x: "Date", y: "Close"}))
```

Like [brush](#brush), except the determination of the intersection exclusively considers the *x* (horizontal↔︎) position; this should be used for plots where *x* is the dominant dimension, such as the binned quantitative dimension in a histogram, or the categorical dimension of a bar chart.

## brushY(*options*) {#brushY}

```js
Plot.tip(alphabet, Plot.pointerY({x: "frequency", y: "letter"}))
```

Like [brush](#brush), except the determination of the intersection exclusively considers the *y* (vertical↕) position; this should be used for plots where *y* is the dominant dimension.
