<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref, shallowRef, onMounted} from "vue";

const pointered = ref(true);
const aapl = shallowRef([]);
const industries = shallowRef([]);
const olympians = shallowRef([]);
const penguins = shallowRef([]);
const linetip = ref("x");
const recttip = ref("x");

onMounted(() => {
  d3.csv("../data/aapl.csv", d3.autoType).then((data) => (aapl.value = data));
  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
  d3.csv("../data/bls-industry-unemployment.csv", d3.autoType).then((data) => (industries.value = data));
  d3.csv("../data/penguins.csv", d3.autoType).then((data) => (penguins.value = data));
});

</script>

# Pointer transform

The **pointer transform** filters a mark interactively such that only the point closest to the pointer is rendered. It is typically used to show details on hover, often with a [tip](../marks/tip.md) or [crosshair](./crosshair.md) mark, but it can be paired with any mark.

To demonstrate, below the pointer transform filters a filled <span style="border-bottom: solid 2px var(--vp-c-red);">red</span> dot behind a stroked <span style="border-bottom: solid 2px currentColor;">{{ $dark ? "white" : "black"}}</span> dot. As you hover the chart, only the closest red dot to the pointer is rendered. If you remove the pointer transform by toggling the checkbox, all the red dots will be visible.

<p>
  <label class="label-input">
    Use pointer:
    <input type="checkbox" v-model="pointered">
  </label>
</p>

:::plot defer hidden
```js
Plot.plot({
  marks: [
    Plot.dot(penguins, (pointered ? Plot.pointer : (o) => o)({x: "culmen_length_mm", y: "culmen_depth_mm", fill: "red", r: 8})),
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```
:::

<div v-if="pointered">

```js-vue
Plot.plot({
  marks: [
    Plot.dot(penguins, Plot.pointer({x: "culmen_length_mm", y: "culmen_depth_mm", fill: "red", r: 8})),
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```

</div>
<div v-else>

```js-vue
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "red", r: 8}),
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```

</div>

The pointer transform is similar to the [filter](../transforms/filter.md) and [select](../transforms/select.md) transforms: it filters the mark’s index to show a subset of the data. The difference is that the pointer transform is *interactive*: it listens to [pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) and re-renders the mark as the closest point changes. Since the mark is lazily rendered during interaction, it is fast: only the visible elements are rendered as needed. And, like the filter and select transforms, the mark’s channels are computed once during the initial render and hence can be incorporated into the default scale domains.

The pointer transform supports both one- and two-dimensional pointing modes. The two-dimensional mode, [pointer](#pointer-options-1), is used above, and is suitable for scatterplots and the general case: it finds the point closest to the pointer by measuring distance in *x* and *y*. The one-dimensional modes, [pointerX](#pointerx-options) and [pointerY](#pointery-options), in contrast only consider distance in one dimension. This is useful when a chart has a “dominant” dimension, such as time in a time-series chart, the binned quantitative dimension in a histogram, or the categorical dimension of a bar chart.

Try the different modes on the line chart below to get a feel for how they behave.

<p>
  <span class="label-input">
    Pointing mode:
    <label style="margin-left: 0.5em;"><input type="radio" name="linetip" value="xy" v-model="linetip" /> pointer</label>
    <label style="margin-left: 0.5em;"><input type="radio" name="linetip" value="x" v-model="linetip" /> pointerX</label>
    <label style="margin-left: 0.5em;"><input type="radio" name="linetip" value="y" v-model="linetip" /> pointerY</label>
  </span>
</p>

:::plot defer
```js-vue
Plot.lineY(aapl, {x: "Date", y: "Close", tip: "{{linetip}}"}).plot()
```
:::

“One-dimensional pointing” is a slight misnomer: the pointerX and pointerY transforms consider distance in both dimensions, but the distance is weighted by a factor of 100 to the dominant dimension. Below, the pointerX transform is applied to a multi-series line chart; the closest point in *x* is chosen, while *y* is used to “break ties” such that you can focus different series by moving the mouse vertically.

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.ruleY([0]),
    Plot.lineY(industries, {x: "date", y: "unemployed", stroke: "industry", tip: "x"})
  ]
})
```
:::

One-dimensional pointing makes even small bars or rects easily hoverable. If you switch the histogram below to two-dimensional pointing, note that you have to hover near a rect’s centroid (shown in <span style="border-bottom: solid 2px var(--vp-c-red);">red</span>) to trigger a tip, whereas one-dimensional pointing triggers the tip anywhere in the chart.

<p>
  <span class="label-input">
    Pointing mode:
    <label style="margin-left: 0.5em;"><input type="radio" name="recttip" value="xy" v-model="recttip" /> pointer</label>
    <label style="margin-left: 0.5em;"><input type="radio" name="recttip" value="x" v-model="recttip" /> pointerX</label>
  </span>
</p>

:::plot defer
```js-vue
Plot.plot({
  x: {label: "Daily volume (log₁₀)"},
  marks: [
    Plot.rectY(aapl, Plot.binX({y: "count"}, {x: (d) => Math.log10(d.Volume), thresholds: 40, tip: "{{recttip}}"})),
    Plot.dot(aapl, Plot.stackY(Plot.binX({y: "count"}, {x: (d) => Math.log10(d.Volume), thresholds: 40, stroke: "red"})))
  ]
})
```
:::

This reveals an important caveat: the pointer transform understands only points and not the arbitrary geometry of marks. By default, the pointer transform only focuses the closest point if it is within 40 pixels of the pointer (in either one or two dimensions, depending on the pointing mode). With large marks, there may be “dead spots” that do not trigger pointing even when the pointer is within the displayed mark. You can mitigate dead spots either by switching to one-dimensional pointing, if appropriate, or by setting the **maxRadius** option to increase the pointing distance cutoff.

Another caveat is that since the pointer transform only focuses one point at a time, if points are coincident (or nearly so), some points may not be focusable. In the future, the pointer transform might allow focusing multiple points simultaneously, or some method of cycling through nearby points. If you are interested in this feature, please upvote [#1621](https://github.com/observablehq/plot/issues/1621).

Regarding position:

- Supports **x1**, **x2**, **x**, and **px** channels, **frameAnchor**
- The **px** channels allows pointing independent on display

Example using **px** and **py** to place the hover details in the top-left corner of the frame.

:::plot defer
```js
Plot.plot({
  height: 160,
  y: {axis: "right", grid: true, nice: true},
  marks: [
    Plot.lineY(aapl, {x: "Date", y: "Close"}),
    Plot.ruleX(aapl, Plot.pointerX({x: "Date", py: "Close", stroke: "red"})),
    Plot.dot(aapl, Plot.pointerX({x: "Date", y: "Close", stroke: "red"})),
    Plot.text(aapl, Plot.pointerX({px: "Date", py: "Close", dy: -17, frameAnchor: "top-left", fontVariant: "tabular-nums", text: (d) => [`Date ${Plot.formatIsoDate(d.Date)}`, `Close ${d.Close.toFixed(2)}`].join("   ")}))
  ]
})
```
:::

Another example to create crosshairs (but see the crosshair mark).

:::plot defer
```js
Plot.plot({
  marks: [
    Plot.ruleX(penguins, Plot.pointer({x: "culmen_length_mm", py: "culmen_depth_mm", stroke: "red", inset: -6})),
    Plot.ruleY(penguins, Plot.pointer({px: "culmen_length_mm", y: "culmen_depth_mm", stroke: "red", inset: -6})),
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```
:::

Notes:

- Pointers support “click-to-stick”
- Have to click on the SVG to unstick (otherwise, listener leak)
- In the future, keyboard navigation?
- In the future, point by **z**, say to highlight series?
- Can have multiple pointers on the same plot
- Typically the pointers have the same set of targets, but this is not required

When a chart gives an overview of a dataset, we sometimes want to focus on a certain region of interest, for instance to obtain details about specific data points—such as outliers in a scatterplot.

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
