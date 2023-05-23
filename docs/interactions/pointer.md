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

The pointer transform is similar to the [filter](../transforms/filter.md) and [select](../transforms/select.md) transforms: it filters the mark’s index to show a subset of the data. The difference is that the pointer transform is *interactive*: it listens to [pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) and re-renders the mark as the closest point changes. Since the mark is lazily rendered during interaction, it is fast: only the visible elements are rendered as needed. And, like the filter and select transforms, unfiltered channel values are incorporated into default scale domains.

The pointer transform supports both one- and two-dimensional pointing modes. The two-dimensional mode, [pointer](#pointer-options-1), is used above and is suitable for scatterplots and the general case: it finds the point closest to the pointer by measuring distance in *x* and *y*. The one-dimensional modes, [pointerX](#pointerx-options) and [pointerY](#pointery-options), in contrast only consider distance in one dimension; this is desirable when a chart has a “dominant” dimension, such as time in a time-series chart, the binned quantitative dimension in a histogram, or the categorical dimension of a bar chart.

Try the different modes on the line chart below to get a feel for how their behavior.

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

“One-dimensional” is a slight misnomer: the pointerX and pointerY transforms consider distance in both dimensions, but the distance along the non-dominant dimension is divided by 100. Below, the pointerX transform is applied to a multi-series line chart; the closest point in *x* is chosen, while *y* is used to “break ties” such that you can focus different series by moving the mouse vertically.

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

One-dimensional pointing makes even small bars or rects easily hoverable. If you switch the histogram below to two-dimensional pointing, you must hover near a rect’s centroid (shown in <span style="border-bottom: solid 2px var(--vp-c-red);">red</span>) to trigger a tip, whereas one-dimensional pointing triggers the tip anywhere in the chart.

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

The pointer transform will prefer the midpoint of the **x1** and **x2** channels, if present, to the **x** channel, and likewise for **y1**, **y2**, and **y**; this allows the pointer transform to be applied to a rect, bar, area, or other mark with paired channels. It also enables these marks to support the **tip** mark option. (If no *x* or *y* channels are specified, the pointer transform respects the **frameAnchor** option.)

The **px** and **py** channels may be used to specify pointing target positions independent of the displayed mark. Below, text in the top-left corner shows the focused date and closing price. The focused point is also highlighted with a red dot and rule.

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

As the above chart shows, a plot can have multiple pointer transforms. Each pointer transform functions independently (with the exception of *click-to-stick*, described next), though we recommend configuring them with the same target positions and pointing mode so that the same point is focused across marks.

The pointer transform supports “click-to-stick”: clicking on the chart locks the currently-focused point until you click again. By locking the pointer, you can select text from the tip for copy and paste. If a plot has multiple pointer transforms, clicking will lock all pointer transforms.

## Pointer options

The following options control the pointer transform:

- **px** - the horizontal↔︎ target position; bound to the *x* scale
- **py** - the vertical↕︎ target position; bound to the *y* scale
- **x** - the fallback horizontal↔︎ target position; bound to the *x* scale
- **y** - the fallback vertical↕︎ target position; bound to the *y* scale
- **x1** - the starting horizontal↔︎ target position; bound to the *x* scale
- **y1** - the starting vertical↕︎ target position; bound to the *y* scale
- **x2** - the ending horizontal↔︎ target position; bound to the *x* scale
- **y2** - the ending vertical↕︎ target position; bound to the *y* scale
- **maxRadius** - the reach, or maximum distance, in pixels; defaults to 40
- **frameAnchor** - how to position the target within the frame; defaults to *middle*

To resolve the horizontal target position, the pointer transform applies the following order of precedence:

1. the **px** channel, if present;
2. the midpoint of the **x1** and **x2** channels, if both are present;
3. the **x** channel, if present;
4. the **x1** channel, if present;
5. and lastly the position given by the **frameAnchor**.

The same precedence applies to the **py**, **y**, **y1**, and **y2** channels.

## pointer(*options*)

```js
Plot.tip(penguins, Plot.pointer({x: "culmen_length_mm", y: "culmen_depth_mm"}))
```

Applies the pointer render transform to the specified *options* to filter the mark index such that only the point closest to the pointer is rendered; the mark will re-render interactively in response to pointer events.

## pointerX(*options*)

```js
Plot.tip(aapl, Plot.pointerX({x: "Date", y: "Close"}))
```

Like [pointer](#pointer-options-1), except the determination of the closest point considers mostly the *x* (horizontal↔︎) position; this should be used for plots where *x* is the dominant dimension, such as time in a time-series chart, the binned quantitative dimension in a histogram, or the categorical dimension of a bar chart.

## pointerY(*options*)

```js
Plot.tip(alphabet, Plot.pointerY({x: "frequency", y: "letter"}))
```

Like [pointer](#pointer-options-1), except the determination of the closest point considers mostly the *y* (vertical↕︎) position; this should be used for plots where *y* is the dominant dimension, such as time in a time-series chart, the binned quantitative dimension in a histogram, or the categorical dimension of a bar chart.
