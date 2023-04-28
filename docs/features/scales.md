<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref, shallowRef, onMounted} from "vue";
import gistemp from "../data/gistemp.ts";

const intervaled = ref(true);
const padding = ref(0.1);
const align = ref(0.5);
const radius = ref(8);
const schemeq = ref("turbo");
const schemed = ref("rdbu");
const schemeo = ref("Tableau10");
const interpolateq = ref("rgb");
const anomaly = gistemp.map((d) => d.Anomaly);
const aapl = shallowRef([]);
const goog = shallowRef([]);
const sftemp = shallowRef([]);

onMounted(() => {
  d3.csv("../data/aapl.csv", d3.autoType).then((data) => (aapl.value = data));
  d3.csv("../data/goog.csv", d3.autoType).then((data) => (goog.value = data));
  d3.csv("../data/sf-temperatures.csv", d3.autoType).then((data) => (sftemp.value = data));
});

</script>

# Scales

**Scales** convert an abstract value such as time or temperature to a visual value such as *x*→ or *y*↑ position or color. For example, say we have a dataset (`gistemp`) containing monthly observations of [global average surface temperature](https://data.giss.nasa.gov/gistemp/) from 1880 to 2016, represented as the “anomaly” (or difference) relative to the 1951–1980 average. The first few rows are:

| Date       | Anomaly |
|------------|--------:|
| 1880-01-01 | -0.3    |
| 1880-02-01 | -0.21   |
| 1880-03-01 | -0.18   |
| 1880-04-01 | -0.27   |
| 1880-05-01 | -0.14   |
| 1880-06-01 | -0.29   |

When visualizing this data with a [line](../marks/line.md), the *x* scale is responsible for mapping dates to horizontal↔︎ positions. For example, 1880-01-01 might be mapped to *x* = 40 (on the left) and 2016-12-01 might be mapped to *x* = 620 (on the right). Likewise, the *y* scale maps temperature anomalies to vertical↕︎ positions.

:::plot https://observablehq.com/@observablehq/plot-scales-intro
```js
Plot.lineY(gistemp, {x: "Date", y: "Anomaly"}).plot()
```
:::

In Plot, the [mark](./marks.md) binds channels to scales; for example, the line’s **x** channel is bound to the *x* scale. The channel name and the scale name are often the same, but not always; for example, an area’s **y1** and **y2** channels are both bound to the *y* scale. (You can opt-out of a scale for a particular channel using [scale overrides](./marks.html#mark-options) if needed.)

Think of a scale as a function that takes an abstract value and returns the corresponding visual value. For the *y* scale above, that might look like this:

```js
function y(anomaly) {
  const t = (anomaly - minAnomaly) / (maxAnomaly - minAnomaly); // t in [0, 1]
  return height - marginBottom - t * (height - marginTop - marginBottom);
}
```

The function `y` depends on a few additional details: the chart’s size and margins, and the minimum and maximum temperatures in the data:

```js
const marginTop = 20;
const marginBottom = 30;
const height = 400;
const minAnomaly = d3.min(gistemp, (d) => d.Anomaly);
const maxAnomaly = d3.max(gistemp, (d) => d.Anomaly);
```

Scales aren’t limited to horizontal and vertical position. They can also output to color, radius, length, opacity, and more. For example if we switch to a [rule](../marks/rule.md) and use the **stroke** channel instead of **y**, we get a one-dimensional heatmap:

:::plot defer https://observablehq.com/@observablehq/plot-scales-intro
```js
Plot.ruleX(gistemp, {x: "Date", stroke: "Anomaly"}).plot()
```
:::

While the resulting chart looks different, the *color* scale here behaves similarly to the `y` function above—the only difference is that it interpolates colors (using [d3.interpolateTurbo](https://github.com/d3/d3-scale-chromatic/blob/main/README.md#interpolateTurbo)) instead of numbers (the top and bottom sides of the plot frame):

```js
function color(anomaly) {
  const t = (anomaly - minAnomaly) / (maxAnomaly - minAnomaly); // t in [0, 1]
  return d3.interpolateTurbo(t);
}
```

Within a given [plot](./plots.md), marks share scales. For example, if a plot has two line marks, such as the lines below visualizing the daily closing price of <span style="border-bottom: solid 2px var(--vp-c-red);">Google</span> and <span style="border-bottom: solid 2px var(--vp-c-blue);">Apple</span> stock, both share the same *x* and *y* scales for a consistent encoding.

:::plot defer https://observablehq.com/@observablehq/plot-layered-marks
```js
Plot.plot({
  marks: [
    Plot.ruleY([0]),
    Plot.lineY(goog, {x: "Date", y: "Close", stroke: "red"}),
    Plot.lineY(aapl, {x: "Date", y: "Close", stroke: "blue"})
  ]
})
```
:::

:::tip
When comparing the performance of different stocks, we typically want to normalize the return relative to a purchase price; see the [normalize transform](../transforms/normalize.md) for an example. Also, not that we recommend them, but if you are interested in dual-axis charts, please upvote [#147](https://github.com/observablehq/plot/issues/147).
:::

Plot has many different scales; we categorize them by their _input_ (**domain**) and _output_ (**range**).

The **domain** is the abstract values that the scale expects as input. For quantitative or temporal data, it is typically expressed as an extent such as [*start*, *end*], [*cold*, *hot*], or [*min*, *max*]. For ordinal or nominal data, it is an array of values such as names or categories. The type of input values corresponds to the **type** scale option (_e.g._, *linear* or *ordinal*).

The **range** is the visual values that the scale generates as output. For position scales, it is typically an extent such as [*left*, *right*] or [*bottom*, *top*]; for color scales, it might be a continuous extent [*blue*, *red*] or an array of discrete colors. The type of values that a scale outputs corresponds to the *name* of the scale (_e.g._, *x* or *color*).

<!-- Position, color, radius, length, angle. In many cases this is just what the underlying interpolator is. For position, the output is a number, so we interpolate from the left to the right side. Whereas for color, the output is a color, we need a color space such as RGB or LCh to interpolate, or a fixed color ramp such as *turbo*.  -->

<!-- There are also some special transforms we can apply as part of the visual encoding. For example, continuous transforms such as log and sqrt. And sometimes converting continuous values into discrete values, with quantile, quantize, threshold. The latter transforms especially are usually for color. -->

Let’s look at some examples to make this less abstract.

## Continuous scales

The domain of a quantitative scale is a continuous extent [*min*, *max*] where *min* and *max* are numbers, such as temperatures. Below, the first domain value (*x* = 0) corresponds to the left side of the plot while the second (*x* = 100) corresponds to the right side.

:::plot https://observablehq.com/@observablehq/plot-continuous-scales
```js
Plot.plot({x: {domain: [0, 100], grid: true}})
```
:::

Flipping the domain reverses the scale so that +*x* points ←left instead of right→.

:::plot https://observablehq.com/@observablehq/plot-continuous-scales
```js
Plot.plot({x: {domain: [100, 0], grid: true}})
```
:::

Alternatively, use the **reverse** option; this is convenient when the domain is implied from data rather than specified explicitly.

:::plot https://observablehq.com/@observablehq/plot-continuous-scales
```js
Plot.plot({x: {domain: [0, 100], reverse: true, grid: true}})
```
:::

If the domain is dates, Plot will default to a UTC scale. This is a linear scale with ticks based on the Gregorian calendar.

<!-- Plot doesn’t parse dates; convert your strings to [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) instances with [d3.utcParse](https://github.com/d3/d3-time-format#utcParse) or [d3.autoType](https://github.com/d3/d3-dsv#autoType). -->

:::plot https://observablehq.com/@observablehq/plot-continuous-scales
```js
Plot.plot({x: {domain: [new Date("2021-01-01"), new Date("2022-01-01")], grid: true}})
```
:::

:::tip
We are working on better multi-line ticks for time scales; please upvote [#1285](https://github.com/observablehq/plot/issues/1285) if you are interested.
:::

To force a UTC scale, say when the data is milliseconds since UNIX epoch rather than Date instances, pass *utc* as the **type** option. Though we recommend coercing strings and numbers to more specific types when you load data, rather than relying on scales to do it.

:::plot https://observablehq.com/@observablehq/plot-continuous-scales
```js
Plot.plot({x: {type: "utc", domain: [1609459200000, 1640995200000], grid: true}})
```
:::

If the scale **type** is *time*, the ticks will be in local time—as with the dates below—rather than UTC.

:::plot https://observablehq.com/@observablehq/plot-continuous-scales
```js
Plot.plot({x: {type: "time", domain: [new Date(2021, 0, 1), new Date(2022, 0, 1)], grid: true}})
```
:::

When plotting values that vary widely, such as the luminosity of stars in an [HR diagram](https://observablehq.com/@mbostock/hertzsprung-russell-diagram), a *log* scale may improve readability. Log scales default to base-10 ticks with SI-prefix notation.

:::plot https://observablehq.com/@observablehq/plot-continuous-scales
```js
Plot.plot({x: {type: "log", domain: [1e0, 1e5], grid: true}})
```
:::

If you prefer conventional notation, you can specify the **tickFormat** option to change the behavior of the axis. The **tickFormat** option can either be a [d3.format](https://github.com/d3/d3-format) string or a function that takes a tick value and returns the corresponding string. Note, however, that this may result in overlapping text.

:::plot https://observablehq.com/@observablehq/plot-continuous-scales
```js
Plot.plot({x: {type: "log", domain: [1e0, 1e5], tickFormat: ",", grid: true}})
```
:::

Log scales also support a **base** option, say for powers of two. This does not affect the scale’s encoding, but it does change where ticks are shown.

:::plot https://observablehq.com/@observablehq/plot-continuous-scales
```js
Plot.plot({x: {type: "log", base: 2, domain: [1e0, 1e4], ticks: 20, grid: true}})
```
:::

The domain of a log scale cannot include (or cross) zero; for this, consider a [bi-symmetric log](https://github.com/d3/d3-scale#symlog-scales) scale instead.

:::plot https://observablehq.com/@observablehq/plot-continuous-scales
```js
Plot.plot({x: {type: "symlog", domain: [-10, 10], grid: true}})
```
:::

Power scales and square-root scales are also supported. The *pow* scale supports the **exponent** option, which defaults to 1 (for a linear scale). The *sqrt* scale is shorthand for a *pow* scale with exponent 0.5.

:::plot https://observablehq.com/@observablehq/plot-continuous-scales
```js
Plot.plot({x: {type: "sqrt", domain: [0, 100], grid: true}})
```
:::

:::plot https://observablehq.com/@observablehq/plot-continuous-scales
```js
Plot.plot({x: {type: "pow", exponent: 1 / 3, domain: [0, 100], grid: true}})
```
:::

Continuous scales also support a **clamp** option, which if true, clamps input values to the scale’s domain before scaling. This is useful for preventing marks from escaping the chart area.

## Discrete scales

Sadly, not all data is continuous: some data is merely ordinal, such as t-shirt sizes; and some categorical (*a.k.a.* nominal), such as brands of clothing. To encode such data as position, a *point* or *band* scale is required.

A *point* scale divides space into uniformly-spaced discrete values. It is commonly used for scatterplots (a [dot mark](../marks/dot.md)) of ordinal data. It is the default scale type for ordinal data on the *x* and *y* scale.

:::plot https://observablehq.com/@observablehq/plot-discrete-scales
```js
Plot.plot({x: {type: "point", domain: "ABCDEFGHIJ", grid: true}})
```
:::

A band scale divides space into uniformly-spaced and -sized discrete intervals. It is commonly used for bar charts (bar marks). To show the bands below, we use a [cell](../marks/cell.md) instead of a [grid](../marks/grid.md).

:::plot https://observablehq.com/@observablehq/plot-discrete-scales
```js
Plot
  .cell("ABCDEFGHIJ", {x: Plot.identity, stroke: "currentColor", strokeOpacity: 0.1})
  .plot({x: {type: "band", domain: "ABCDEFGHIJ"}})
```
:::

While *point* and *band* scales appear visually similar when only the grid is visible, the two are not identical—they differ respective to padding. Play with the options below to get a sense of their effect on the scale’s behavior.

<p>
  <label class="label-input">
    <span>Padding:</span>
    <input type="range" v-model.number="padding" min="0" max="1" step="0.01">
    <span style="font-variant-numeric: tabular-nums;">{{padding.toFixed(2)}}</span>
  </label>
  <label class="label-input">
    <span>Align:</span>
    <input type="range" v-model.number="align" min="0" max="1" step="0.01">
    <span style="font-variant-numeric: tabular-nums;">{{align.toFixed(2)}}</span>
  </label>
</p>

:::plot hidden https://observablehq.com/@observablehq/plot-discrete-scales
```js
Plot.plot({
  grid: true,
  marginTop: 0.5,
  x: {
    padding,
    align,
    round: false
  },
  marks: [
    Plot.frame({strokeOpacity: 0.3}),
    Plot.tickX("ABCDEFGHIJ", {x: Plot.identity, stroke: "currentColor"})
  ]
})
```
:::

:::plot hidden https://observablehq.com/@observablehq/plot-discrete-scales
```js
Plot.plot({
  grid: true,
  marginTop: 0.5,
  x: {
    padding,
    align,
    round: false
  },
  marks: [
    Plot.frame({strokeOpacity: 0.3}),
    Plot.cell("ABCDEFGHIJ", {x: Plot.identity, stroke: "currentColor"})
  ]
})
```
:::

Positions scales also have a **round** option which forces the scale to snap to integer pixels. This defaults to true for point and band scales, and false for quantitative scales. Use caution with high-cardinality ordinal domains (*i.e.*, a point or band scale used to encode many different values), as rounding can lead to “wasted” space or even zero-width bands.

## Color scales

While position is the most salient (and important) encoding, color matters too! The default quantitative color scale **type** is *linear*, and the default **scheme** is [*turbo*](https://ai.googleblog.com/2019/08/turbo-improved-rainbow-colormap-for.html). A wide variety of sequential, diverging, and cyclical schemes are supported, including ColorBrewer and [*viridis*](http://bids.github.io/colormap/).

<p>
  <label class="label-input">
    Color scheme:
    <select v-model="schemeq">
      <optgroup label="sequential, single-hue">
        <option value="blues">Blues</option>
        <option value="greens">Greens</option>
        <option value="greys">Greys</option>
        <option value="purples">Purples</option>
        <option value="reds">Reds</option>
        <option value="oranges">Oranges</option>
      </optgroup>
      <optgroup label="sequential, multi-hue">
        <option value="turbo" selected>Turbo</option>
        <option value="viridis">Viridis</option>
        <option value="magma">Magma</option>
        <option value="inferno">Inferno</option>
        <option value="plasma">Plasma</option>
        <option value="cividis">Cividis</option>
        <option value="cubehelix">Cubehelix</option>
        <option value="warm">Warm</option>
        <option value="cool">Cool</option>
        <option value="bugn">BuGn</option>
        <option value="bupu">BuPu</option>
        <option value="gnbu">GnBu</option>
        <option value="orrd">OrRd</option>
        <option value="pubugn">PuBuGn</option>
        <option value="pubu">PuBu</option>
        <option value="purd">PuRd</option>
        <option value="rdpu">RdPu</option>
        <option value="ylgnbu">YlGnBu</option>
        <option value="ylgn">YlGn</option>
        <option value="ylorbr">YlOrBr</option>
        <option value="ylorrd">YlOrRd</option>
      </optgroup>
      <optgroup label="cyclical">
        <option value="rainbow">Rainbow</option>
        <option value="sinebow">Sinebow</option>
      </optgroup>
    </select>
  </label>
</p>

:::plot hidden
```js
Plot.plot({
  axis: null,
  padding: 0,
  color: {
    scheme: schemeq
  },
  marks: [
    Plot.cell(d3.range(40), {x: Plot.identity, fill: Plot.identity, inset: -0.5})
  ]
})
```
:::

You can implement a custom color scheme by specifying the scale’s **range**, or by passing an **interpolate** function that takes a parameter *t* in [0, 1]. The **interpolate** option can specify a color space such as *rgb*, or a two-argument function that takes a pair of values from the range.

<p>
  <label class="label-input">
    Color interpolate:
    <select v-model="interpolateq">
      <option value="rgb">rgb</option>
      <option value="lab">lab</option>
      <option value="hcl">hcl</option>
      <option value="hsl">hsl</option>
      <option value="rgb-gamma">d3.interpolateRgb.gamma(2)</option>
      <option value="angry-rainbow">(t) => `hsl(${t * 360},100%,50%)`</option>
    </select>
  </label>
</p>

:::plot hidden
```js
Plot.plot({
  axis: null,
  padding: 0,
  color: {
    type: "linear",
    ...interpolateq === "angry-rainbow"
      ? {interpolate: (t) => `hsl(${t * 360},100%,50%)`}
      : interpolateq === "rgb-gamma"
      ? {range: ["steelblue", "orange"], interpolate: d3.interpolateRgb.gamma(2)}
      : {range: ["steelblue", "orange"], interpolate: interpolateq}
  },
  marks: [
    Plot.cell(d3.range(40), {x: Plot.identity, fill: Plot.identity, inset: -0.5})
  ]
})
```
:::

And like position scales, you can apply a *sqrt*, *pow*, *log*, or *symlog* transform; these are often useful when working with non-uniformly distributed data.

Diverging color scales are intended to show positive and negative values, or more generally values above or below some **pivot** value. Diverging color scales default to the *RdBu* (red–blue) color scheme. The pivot defaults to zero, but you can change it with the **pivot** option, which should ideally be a value near the middle of the domain.

<p>
  <label class="label-input">
    Color scheme:
    <select v-model="schemed">
      <optgroup label="diverging">
        <option value="brbg">BrBG</option>
        <option value="prgn">PRGn</option>
        <option value="piyg">PiYG</option>
        <option value="puor">PuOr</option>
        <option value="rdbu">RdBu</option>
        <option value="rdgy">RdGy</option>
        <option value="rdylbu">RdYlBu</option>
        <option value="rdylgn">RdYlGn</option>
        <option value="spectral">Spectral</option>
        <option value="burd">BuRd</option>
        <option value="buylrd">BuYlRd</option>
      </optgroup>
    </select>
  </label>
</p>

:::plot hidden
```js
Plot.plot({
  axis: null,
  padding: 0,
  color: {
    type: "linear",
    scheme: schemed
  },
  marks: [
    Plot.cell(d3.range(40), {x: Plot.identity, fill: Plot.identity, inset: -0.5})
  ]
})
```
:::

Below we again show observed global surface temperatures. The reversed *BuRd* color scheme is used since <span :style="{borderBottom: `solid 2px ${d3.interpolateRdBu(0.9)}`}">blue</span> and <span :style="{borderBottom: `solid 2px ${d3.interpolateRdBu(0.1)}`}">red</span> are semantically associated with cold and hot, respectively.

:::plot https://observablehq.com/@observablehq/plot-colored-scatterplot
```js
Plot.plot({
  grid: true,
  color: {
    type: "diverging",
    scheme: "BuRd"
  },
  marks: [
    Plot.ruleY([0]),
    Plot.dot(gistemp, {x: "Date", y: "Anomaly", stroke: "Anomaly"})
  ]
})
```
:::

Plot also provides color schemes for discrete data. Use the *categorical* type for categorical (nominal) unordered data, and the *ordinal* type for ordered data.

<p>
  <label class="label-input">
    Color scheme:
    <select v-model="schemeo">
      <optgroup label="categorical">
        <option>Accent</option>
        <option>Category10</option>
        <option>Dark2</option>
        <option>Paired</option>
        <option>Pastel1</option>
        <option>Pastel2</option>
        <option>Set1</option>
        <option>Set2</option>
        <option>Set3</option>
        <option>Tableau10</option>
      </optgroup>
      <optgroup label="sequential, single-hue">
        <option value="blues">Blues</option>
        <option value="greens">Greens</option>
        <option value="greys">Greys</option>
        <option value="purples">Purples</option>
        <option value="reds">Reds</option>
        <option value="oranges">Oranges</option>
      </optgroup>
      <optgroup label="sequential, multi-hue">
        <option value="turbo" selected>Turbo</option>
        <option value="viridis">Viridis</option>
        <option value="magma">Magma</option>
        <option value="inferno">Inferno</option>
        <option value="plasma">Plasma</option>
        <option value="cividis">Cividis</option>
        <option value="cubehelix">Cubehelix</option>
        <option value="warm">Warm</option>
        <option value="cool">Cool</option>
        <option value="bugn">BuGn</option>
        <option value="bupu">BuPu</option>
        <option value="gnbu">GnBu</option>
        <option value="orrd">OrRd</option>
        <option value="pubugn">PuBuGn</option>
        <option value="pubu">PuBu</option>
        <option value="purd">PuRd</option>
        <option value="rdpu">RdPu</option>
        <option value="ylgnbu">YlGnBu</option>
        <option value="ylgn">YlGn</option>
        <option value="ylorbr">YlOrBr</option>
        <option value="ylorrd">YlOrRd</option>
      </optgroup>
      <optgroup label="cyclical">
        <option value="rainbow">Rainbow</option>
        <option value="sinebow">Sinebow</option>
      </optgroup>
    </select>
  </label>
</p>

:::plot hidden
```js
Plot.plot({
  color: {
    type: "ordinal",
    scheme: schemeo
  },
  marks: [
    Plot.cell("ABCDEFGHIJ", {x: Plot.identity, fill: Plot.identity})
  ]
})
```
:::

:::warning CAUTION
Discrete color schemes are intended for data that has only a few unique values. If the size of the categorical domain exceeds the number of colors in the scheme, colors will be reused; combining values into an “other” category is recommended.
:::

## Other scales

But wait, there’s more! 😅 Plot has *opacity*, *r*, *symbol*, and *length* scales, too. For example, the *r* scale **type** defaults to *sqrt* such that when used with the [dot mark](../marks/dot.md), the resulting area is proportional to the **r** channel value. You can adjust the effective dot size by specifying an explicit **range**, as below.

<p>
  <label class="label-input">
    Radius:
    <input type="range" v-model.number="radius" min="1" max="20" step="0.1">
    <span style="font-variant-numeric: tabular-nums;">{{radius.toFixed(1)}}</span>
  </label>
</p>

:::plot https://observablehq.com/@observablehq/plot-radius-scale-range
```js
Plot.plot({
  r: {range: [0, radius]},
  marks: [
    Plot.dot(d3.range(1, 11), {x: Plot.identity, r: Plot.identity, fill: "currentColor"})
  ]
})
```
:::

The default **range** for the associated *r* scale is constructed such that a zero value maps to zero for an accurate areal encoding, while the first quartile of values is mapped to a radius of three pixels; this tends to be more stable with varying data.

## Type inference

Plot strives to be concise: rather than you laboriously specifying everything, Plot can guess by inspecting the data so you don’t have to set the **type**, **domain**, and **range** (and for color, **scheme**) of scales explicitly. But for Plot’s guesses to be accurate, your data must match Plot’s expectations. Here they are.

A scale’s **type** is most often inferred from associated marks’ channel values: strings and booleans imply an *ordinal* scale; dates imply a *utc* scale; anything else is *linear*. Plot assumes that your data is consistently typed, so inference is based solely on the first non-null, non-undefined value. We recommend typed CSV (passing `{typed: true}` to Observable’s FileAttachment csv method) or explicitly coercing types when loading data (*e.g.*, d3.autoType).

If a scale’s **domain** is specified explicitly, the scale’s **type** is inferred from the **domain** values rather than channels as described above. However, if the **domain** or **range** has more than two elements, the *ordinal* type (or *point* for position scales) is used.

Finally, some marks declare the scale **type** for associated channels. For example, [barX](../marks/bar.md) requires *y* to be a *band* scale. Further, the facet scales *fx* and *fy* are always *band* scales, and the radius scale *r* is implicitly a *sqrt* scale.

If you don’t specify a quantitative scale’s **domain**, it is the extent (minimum and maximum) of associated channel values, except for the *r* (radius) scale where it goes from zero to the maximum. A quantitative domain can be extended to “nice” human-readable values with the **nice** option. For an ordinal scale, the domain defaults to the sorted union (all distinct values in natural order) of associated values; see the [**sort** mark option](#sort-mark-option) to change the order.

All position scales (*x*, *y*, *fx*, and *fy*) have implicit automatic ranges based on the chart dimensions. The *x* scale ranges from the left to right edge, while the *y* scale ranges from the bottom to top edge, accounting for margins.

## Scale transforms

The **transform** scale option allows you to apply a function to all values before they are passed through the scale. This is convenient for transforming a scale’s data, say to convert to thousands or between temperature units.

:::plot defer https://observablehq.com/@observablehq/plot-fahrenheit-to-celsius-scale-transform
```js{5}
Plot.plot({
  y: {
    grid: true,
    label: `↑ Temperature (°C)`,
    transform: (f) => (f - 32) * (5 / 9) // convert Fahrenheit to Celsius
  },
  marks: [
    Plot.ruleY([32]), // 32°F
    Plot.lineY(sftemp, Plot.windowY(7, {x: "date", y: "high"}))
  ]
})
```
:::

The **percent** scale option is shorthand for a **transform** that multiplies values by 100; it also adds a percent symbol (%) to the default label.

:::plot https://observablehq.com/@observablehq/plot-percent-scale-transform
```js{2}
Plot.plot({
  y: {percent: true}, // convert proportion [0, 1] to percent [0, 100]
  color: {scheme: "BuRd"},
  marks: [
    Plot.rectY(gistemp, Plot.binX({y: "proportion", fill: "x"}, {x: "Anomaly", fill: "Anomaly"})),
    Plot.ruleY([0])
  ]
})
```
:::

:::warning CAUTION
[Mark transforms](./transforms.md) typically consume values *before* they are passed through scales (_e.g._, when binning). In this case the mark transforms will see the values prior to the scale transform as input, and the scale transform will apply to the *output* of the mark transform.
:::

The **interval** scale option sets an ordinal scale’s **domain** to the start of every interval within the extent of the data. In addition, it implicitly sets the **transform** of the scale to *interval*.floor, rounding values down to the start of each interval. For example, below we generate a time-series bar chart; when an **interval** is specified, missing days are visible.

<p>
  <label class="label-input">
    Use interval:
    <input type="checkbox" v-model="intervaled">
  </label>
</p>

:::plot https://observablehq.com/@observablehq/plot-band-scale-interval
```js
Plot.plot({
  marginBottom: 80,
  x: {
    tickRotate: -90,
    interval: intervaled ? "day" : null,
    label: null
  },
  y: {
    transform: (d) => d / 1e6,
    label: "↑ Daily trade volume (millions)"
  },
  marks: [
    Plot.barY(aapl.slice(-40), {x: "Date", y: "Volume"}),
    Plot.ruleY([0])
  ]
})
```
:::

:::tip
As an added bonus, the **fontVariant** and **type** options are no longer needed because Plot now understands that the *x* scale, despite being *ordinal*, represents daily observations.
:::

The **interval** option can also be used for quantitative and temporal scales. This enforces uniformity, say rounding timed observations down to the nearest hour, which may be helpful for the [stack transform](../transforms/stack.md) among other uses.

## Scale options

Each scale’s options are specified as a nested options object with the corresponding scale name within the top-level [plot options](./plots.md):

* **x** - horizontal position
* **y** - vertical position
* **r** - radius (size)
* **color** - fill or stroke
* **opacity** - fill or stroke opacity
* **length** - linear length (for [vectors](../marks/vector.md))
* **symbol** - categorical symbol (for [dots](../marks/dot.md))

For example, to set the domain for the *x* scale:

:::plot
```js
Plot.plot({x: {domain: [new Date("1880-01-01"), new Date("2016-11-01")]}})
```
:::

Plot supports many scale types. Some scale types are for quantitative data: values that can be added or subtracted, such as temperature or time. Other scale types are for ordinal or categorical data: unquantifiable values that can only be ordered, such as t-shirt sizes, or values with no inherent order that can only be tested for equality, such as types of fruit. Some scale types are further intended for specific visual encodings: for example, as position or color.

You can set the scale type explicitly via the **type** scale option, though typically the scale type is inferred automatically. Some marks mandate a particular scale type: for example, [barY](../marks/bar.md) requires that the *x* scale is a *band* scale. Some scales have a default type: for example, the *radius* scale defaults to *sqrt* and the *opacity* scale defaults to *linear*. Most often, the scale type is inferred from associated data, pulled either from the domain (if specified) or from associated channels. Strings and booleans imply an ordinal scale; dates imply a UTC scale; and anything else is linear. Unless they represent text, we recommend explicitly converting strings to more specific types when loading data (*e.g.*, with d3.autoType or Observable’s FileAttachment). For simplicity’s sake, Plot assumes that data is consistently typed; type inference is based solely on the first non-null, non-undefined value.

For quantitative data (*i.e.* numbers), a mathematical transform may be applied to the data by changing the scale type:

* *linear* (default) - linear transform (translate and scale)
* *pow* - power (exponential) transform
* *sqrt* - square-root transform (*pow* transform with exponent = 0.5)
* *log* - logarithmic transform
* *symlog* - bi-symmetric logarithmic transform per [Webber *et al.*](https://www.researchgate.net/publication/233967063_A_bi-symmetric_log_transformation_for_wide-range_data)

The appropriate transform depends on the data’s distribution and what you wish to know. A *sqrt* transform exaggerates differences between small values at the expense of large values; it is a special case of the *pow* transform which has a configurable *scale*.**exponent** (0.5 for *sqrt*). A *log* transform is suitable for comparing orders of magnitude and can only be used when the domain does not include zero. The base defaults to 10 and can be specified with the *scale*.**base** option; note that this only affects the axis ticks and not the scale’s behavior. A *symlog* transform is more elaborate, but works well with wide-range values that include zero; it can be configured with the *scale*.**constant** option (default 1).

For temporal data (*i.e.* dates), two variants of a *linear* scale are also supported:

* *utc* (default, recommended) - UTC time
* *time* - local time

UTC is recommended over local time as charts in UTC time are guaranteed to appear consistently to all viewers whereas charts in local time will depend on the viewer’s time zone. Due to limitations in JavaScript’s Date class, Plot does not yet support an explicit time zone other than UTC.

For ordinal data (*e.g.*, strings), use the *ordinal* scale type or the *point* or *band* position scale types. The *categorical* scale type is also supported; it is equivalent to *ordinal* except as a color scale, where it provides a different default color scheme. (Since position is inherently ordinal or even quantitative, categorical data must be assigned an effective order when represented as position, and hence *categorical* and *ordinal* may be considered synonymous in context.)

You can opt-out of a scale using the *identity* scale type. This is useful if you wish to specify literal colors or pixel positions within a mark channel rather than relying on the scale to convert abstract values into visual values. For position scales (*x* and *y*), an *identity* scale is still quantitative and may produce an axis, yet unlike a *linear* scale the domain and range are fixed based on the plot layout.

:::tip
To opt-out of a scale for a single channel, you can specify the channel values as a `{value, scale}` object; see [mark options](./marks.md#mark-options).
:::

Quantitative scales, as well as identity position scales, coerce channel values to numbers; both null and undefined are coerced to NaN. Similarly, time scales coerce channel values to dates; numbers are assumed to be milliseconds since UNIX epoch, while strings are assumed to be in [ISO 8601 format](https://github.com/mbostock/isoformat/blob/main/README.md#parsedate-fallback).

A scale’s domain (the extent of its inputs, abstract values) and range (the extent of its outputs, visual values) are typically inferred automatically. You can set them explicitly using these options:

* **domain** - typically [*min*, *max*], or an array of ordinal or categorical values
* **range** - typically [*min*, *max*], or an array of ordinal or categorical values
* **unknown** - the desired output value (defaults to undefined) for invalid input values
* **reverse** - reverses the domain (or the range), say to flip the chart along *x* or *y*
* **interval** - an interval or time interval (for interval data; see below)

For most quantitative scales, the default domain is the [*min*, *max*] of all values associated with the scale. For the *radius* and *opacity* scales, the default domain is [0, *max*] to ensure a meaningful value encoding. For ordinal scales, the default domain is the set of all distinct values associated with the scale in natural ascending order; for a different order, set the domain explicitly or add a [**sort** option](#sort-mark-option) to an associated mark. For threshold scales, the default domain is [0] to separate negative and non-negative values. For quantile scales, the default domain is the set of all defined values associated with the scale. If a scale is reversed, it is equivalent to setting the domain as [*max*, *min*] instead of [*min*, *max*].

The default range depends on the scale: for position scales (*x*, *y*, *fx*, and *fy*), the default range depends on the [plot’s size and margins](./plots.md). For color scales, there are default color schemes for quantitative, ordinal, and categorical data. For opacity, the default range is [0, 1]. And for radius, the default range is designed to produce dots of “reasonable” size assuming a *sqrt* scale type for accurate area representation: zero maps to zero, the first quartile maps to a radius of three pixels, and other values are extrapolated. This convention for radius ensures that if the scale’s data values are all equal, dots have the default constant radius of three pixels, while if the data varies, dots will tend to be larger.

The behavior of the **unknown** scale option depends on the scale type. For quantitative and temporal scales, the unknown value is used whenever the input value is undefined, null, or NaN. For ordinal or categorical scales, the unknown value is returned for any input value outside the domain. For band or point scales, the unknown option has no effect; it is effectively always equal to undefined. If the unknown option is set to undefined (the default), or null or NaN, then the affected input values will be considered undefined and filtered from the output.

For data at regular intervals, such as integer values or daily samples, the [**interval** option](#scale-transforms) can be used to enforce uniformity. The specified *interval*—such as d3.utcMonth—must expose an *interval*.floor(*value*), *interval*.offset(*value*), and *interval*.range(*start*, *stop*) functions. The option can also be specified as a number, in which case it will be promoted to a numeric interval with the given step. The option can alternatively be specified as a string (*second*, *minute*, *hour*, *day*, *week*, *month*, *quarter*, *half*, *year*, *monday*, *tuesday*, *wednesday*, *thursday*, *friday*, *saturday*, *sunday*) naming the corresponding time interval, or a skip interval consisting of a number followed by the interval name (possibly pluralized), such as *3 months* or *10 years*. This option sets the default *scale*.transform to the given interval’s *interval*.floor function. In addition, the default *scale*.domain is an array of uniformly-spaced values spanning the extent of the values associated with the scale.

Quantitative scales can be further customized with additional options:

* **clamp** - if true, clamp input values to the scale’s domain
* **nice** - if true (or a tick count), extend the domain to nice round values
* **zero** - if true, extend the domain to include zero if needed
* **percent** - if true, transform proportions in [0, 1] to percentages in [0, 100]

Clamping is typically used in conjunction with setting an explicit domain since if the domain is inferred, no values will be outside the domain. Clamping is useful for focusing on a subset of the data while ensuring that extreme values remain visible, but use caution: clamped values may need an annotation to avoid misinterpretation. Top-level **clamp**, **nice**, and **zero** options are supported as shorthand for setting the respective option on all scales.

The **transform** option allows you to apply a function to all values before they are passed through the scale. This is convenient for transforming a scale’s data, say to convert to thousands or between temperature units.

```js
Plot.plot({
  y: {
    label: "↑ Temperature (°F)",
    transform: (f) => f * 9 / 5 + 32 // convert Celsius to Fahrenheit
  },
  marks: …
})
```

### Color scale options

The normal scale types—*linear*, *sqrt*, *pow*, *log*, *symlog*, and *ordinal*—can be used to encode color. In addition, Plot supports special scale types for color:

* *categorical* - like *ordinal*, but defaults to *tableau10*
* *sequential* - like *linear*
* *cyclical* - like *linear*, but defaults to *rainbow*
* *threshold* - encodes based on discrete thresholds specified as the **domain**; defaults to *rdylbu*
* *quantile* - encodes based on the computed quantile thresholds; defaults to *rdylbu*
* *quantize* - transforms a continuous domain into quantized thresholds; defaults to *rdylbu*
* *diverging* - like *linear*, but with a pivot; defaults to *rdbu*
* *diverging-log* - like *log*, but with a pivot that defaults to 1; defaults to *rdbu*
* *diverging-pow* - like *pow*, but with a pivot; defaults to *rdbu*
* *diverging-sqrt* - like *sqrt*, but with a pivot; defaults to *rdbu*
* *diverging-symlog* - like *symlog*, but with a pivot; defaults to *rdbu*

For a *threshold* scale, the **domain** represents *n* (typically numeric) thresholds which will produce a **range** of *n* + 1 output colors; the *i*th color of the **range** applies to values that are smaller than the *i*th element of the domain and larger or equal to the *i* - 1th element of the domain. For a *quantile* scale, the **domain** represents all input values to the scale, and the **n** option specifies how many quantiles to compute from the **domain**; **n** quantiles will produce **n** - 1 thresholds, and an output range of **n** colors. For a *quantize* scale, the domain will be transformed into approximately **n** quantized values, where **n** is an option that defaults to 5.

By default, all diverging color scales are symmetric around the pivot; set **symmetric** to false if you want to cover the whole extent on both sides.

Color scales support two additional options:

* **scheme** - a named color scheme in lieu of a range, such as *reds*
* **interpolate** - in conjunction with a range, how to interpolate colors

For quantile and quantize color scales, the **scheme** option is used in conjunction with **n**, which determines how many quantiles or quantized values to compute, and thus the number of elements in the scale’s range; it defaults to 5 (for quintiles in the case of a quantile scale).

The following sequential scale schemes are supported for both quantitative and ordinal data:

:::plot defer hidden
```js
Plot.plot({
  width: 322,
  height: 25 * 27,
  margin: 0,
  marginRight: 70,
  padding: 0,
  x: {axis: null},
  y: {axis: "right", tickSize: 0},
  color: {type: "identity"},
  marks: [
    Plot.cell([
      ["Blues", d3.interpolateBlues],
      ["Greens", d3.interpolateGreens],
      ["Greys", d3.interpolateGreys],
      ["Purples", d3.interpolatePurples],
      ["Reds", d3.interpolateReds],
      ["Oranges", d3.interpolateOranges],
      ["Turbo", d3.interpolateTurbo],
      ["Viridis", d3.interpolateViridis],
      ["Magma", d3.interpolateMagma],
      ["Inferno", d3.interpolateInferno],
      ["Plasma", d3.interpolatePlasma],
      ["Cividis", d3.interpolateCividis],
      ["Cubehelix", d3.interpolateCubehelixDefault],
      ["Warm", d3.interpolateWarm],
      ["Cool", d3.interpolateCool],
      ["BuGn", d3.interpolateBuGn],
      ["BuPu", d3.interpolateBuPu],
      ["GnBu", d3.interpolateGnBu],
      ["OrRd", d3.interpolateOrRd],
      ["PuBuGn", d3.interpolatePuBuGn],
      ["PuBu", d3.interpolatePuBu],
      ["PuRd", d3.interpolatePuRd],
      ["RdPu", d3.interpolateRdPu],
      ["YlGnBu", d3.interpolateYlGnBu],
      ["YlGn", d3.interpolateYlGn],
      ["YlOrBr", d3.interpolateYlOrBr],
      ["YlOrRd", d3.interpolateYlOrRd],
    ].flatMap(([name, i]) => d3.ticks(0, 1, 20).map((t) => [t, name, String(i(t))])), {fill: "2", insetTop: 0.5, insetBottom: 0.5})
  ]
})
```
:::

The default color scheme, *turbo*, was chosen primarily to ensure high-contrast visibility. Color schemes such as *blues* make low-value marks difficult to see against a white background, for better or for worse. To use a subset of a continuous color scheme (or any single-argument *interpolate* function), set the *scale*.range property to the corresponding subset of [0, 1]; for example, to use the first half of the *rainbow* color scheme, use a range of [0, 0.5]. By default, the full range [0, 1] is used. If you wish to encode a quantitative value without hue, consider using *opacity* rather than *color* (e.g., use Plot.dot’s *strokeOpacity* instead of *stroke*).

The following diverging scale schemes are supported:

:::plot defer hidden
```js
Plot.plot({
  width: 322,
  height: 25 * 11,
  margin: 0,
  marginRight: 70,
  padding: 0,
  x: {axis: null},
  y: {axis: "right", tickSize: 0},
  color: {type: "identity"},
  marks: [
    Plot.cell([
      ["BrBG", d3.interpolateBrBG],
      ["PRGn", d3.interpolatePRGn],
      ["PiYG", d3.interpolatePiYG],
      ["PuOr", d3.interpolatePuOr],
      ["RdBu", d3.interpolateRdBu],
      ["RdGy", d3.interpolateRdGy],
      ["RdYlBu", d3.interpolateRdYlBu],
      ["RdYlGn", d3.interpolateRdYlGn],
      ["Spectral", d3.interpolateSpectral],
      ["BuRd", (t) => d3.interpolateRdBu(1 - t)],
      ["BuYlRd", (t) => d3.interpolateRdYlBu(1 - t)],
    ].flatMap(([name, i]) => d3.ticks(0, 1, 30).map((t) => [t, name, String(i(t))])), {fill: "2", insetTop: 0.5, insetBottom: 0.5})
  ]
})
```
:::

Picking a diverging color scheme name defaults the scale type to *diverging*; set the scale type to *linear* to treat the color scheme as sequential instead. Diverging color scales support a *scale*.**pivot** option, which defaults to zero. Values below the pivot will use the lower half of the color scheme (*e.g.*, reds for the *rdgy* scheme), while values above the pivot will use the upper half (grays for *rdgy*).

The following cylical color schemes are supported:

:::plot defer hidden
```js
Plot.plot({
  width: 322,
  height: 25 * 2,
  margin: 0,
  marginRight: 70,
  padding: 0,
  x: {axis: null},
  y: {axis: "right", tickSize: 0},
  color: {type: "identity"},
  marks: [
    Plot.cell([
      ["rainbow", d3.interpolateRainbow],
      ["sinebow", d3.interpolateSinebow],
    ].flatMap(([name, i]) => d3.ticks(0, 1, 30).map((t) => [t, name, String(i(t))])), {fill: "2", insetTop: 0.5, insetBottom: 0.5})
  ]
})
```
:::

The following categorical color schemes are supported:

:::plot defer hidden
```js
Plot.plot({
  width: 322,
  height: 25 * 10,
  margin: 0,
  marginRight: 70,
  padding: 0,
  x: {axis: null},
  y: {axis: "right", tickSize: 0},
  color: {type: "identity"},
  marks: [
    Plot.cell([
      ["Accent", d3.schemeAccent],
      ["Category10", d3.schemeCategory10],
      ["Dark2", d3.schemeDark2],
      ["Paired", d3.schemePaired],
      ["Pastel1", d3.schemePastel1],
      ["Pastel2", d3.schemePastel2],
      ["Set1", d3.schemeSet1],
      ["Set2", d3.schemeSet2],
      ["Set3", d3.schemeSet3],
      ["Tableau10", d3.schemeTableau10],
    ].flatMap(([name, scheme]) => scheme.map((s, i) => [i, name, s])), {fill: "2", inset: 0.5})
  ]
})
```
:::

The following color interpolators are supported:

* *rgb* - RGB (red, green, blue)
* *hsl* - HSL (hue, saturation, lightness)
* *lab* - CIELAB (*a.k.a.* “Lab”)
* *hcl* - CIELCh<sub>ab</sub> (*a.k.a.* “LCh” or “HCL”)

### Position scale options

The position scales (*x*, *y*, *fx*, and *fy*) support additional options:

* **inset** - inset the default range by the specified amount in pixels
* **round** - round the output value to the nearest integer (whole pixel)

The *x* and *fx* scales support asymmetric insets for more precision. Replace inset by:

* **insetLeft** - insets the start of the default range by the specified number of pixels
* **insetRight** - insets the end of the default range by the specified number of pixels

Similarly, the *y* and *fy* scales support asymmetric insets with:

* **insetTop** - insets the top of the default range by the specified number of pixels
* **insetBottom** - insets the bottom of the default range by the specified number of pixels

The inset scale options can provide “breathing room” to separate marks from axes or the plot’s edge. For example, in a scatterplot with a Plot.dot with the default 3-pixel radius and 1.5-pixel stroke width, an inset of 5 pixels prevents dots from overlapping with the axes. The *scale*.round option is useful for crisp edges by rounding to the nearest pixel boundary.

In addition to the generic *ordinal* scale type, which requires an explicit output range value for each input domain value, Plot supports special *point* and *band* scale types for encoding ordinal data as position. These scale types accept a [*min*, *max*] range similar to quantitative scales, and divide this continuous interval into discrete points or bands based on the number of distinct values in the domain (*i.e.*, the domain’s cardinality). If the associated marks have no effective width along the ordinal dimension—such as a dot, rule, or tick—then use a *point* scale; otherwise, say for a bar, use a *band* scale.

Ordinal position scales support additional options, all specified as proportions in [0, 1]:

* **padding** - how much of the range to reserve to inset first and last point or band
* **align** - where to distribute points or bands (0 = at start, 0.5 = at middle, 1 = at end)

For a *band* scale, you can further fine-tune padding:

* **paddingInner** - how much of the range to reserve to separate adjacent bands
* **paddingOuter** - how much of the range to reserve to inset first and last band

Align defaults to 0.5 (centered). Band scale padding defaults to 0.1 (10% of available space reserved for separating bands), while point scale padding defaults to 0.5 (the gap between the first point and the edge is half the distance of the gap between points, and likewise for the gap between the last point and the opposite edge). Note that rounding and mark insets (e.g., for bars and rects) also affect separation between adjacent marks.

Plot automatically generates [axis](../marks/axis.md) and optionally [grid](../marks/grid.md) marks for position scales. (For more control, declare these marks explicitly.) You can configure the implicit axes with the following scale options:

* **axis** - *top* or *bottom* (or *both*) for *x* and *fx*; *left* or *right* (or *both*) for *y* and *fy*; null to suppress
* **ticks** - the approximate number of ticks to generate, or interval, or array of values
* **tickSize** - the length of each tick (in pixels; default 6 for *x* and *y*, or 0 for *fx* and *fy*)
* **tickSpacing** - the approximate number of pixels between ticks (if **ticks** is not specified)
* **tickPadding** - the separation between the tick and its label (in pixels; default 3)
* **tickFormat** - either a function or specifier string to format tick values; see [Formats](./formats.md)
* **tickRotate** - whether to rotate tick labels (an angle in degrees clockwise; default 0)
* **grid** - whether to draw grid lines across the plot for each tick
* **line** - if true, draw the axis line (only for *x* and *y*)
* **label** - a string to label the axis
* **labelAnchor** - the label anchor: *top*, *right*, *bottom*, *left*, or *center*
* **labelOffset** - the label position offset (in pixels; default depends on margins and orientation)
* **fontVariant** - the font-variant attribute for ticks; defaults to *tabular-nums* if quantitative
* **ariaLabel** - a short label representing the axis in the accessibility tree
* **ariaDescription** - a textual description for the axis

Top-level options are also supported as shorthand: **grid** (for *x* and *y* only; see [facets](./facets.md)), **label**, **axis**, **inset**, **round**, **align**, and **padding**. If the **grid** option is true, show a grid using *currentColor*; if specified as a string, show a grid with the specified color; if an approximate number of ticks, an interval, or an array of tick values, show corresponding grid lines.

## Sort mark option

If an ordinal scale’s domain is not set, it defaults to natural ascending order; to order the domain by associated values in another dimension, either compute the domain manually (consider [d3.groupSort](https://github.com/d3/d3-array/blob/main/README.md#groupSort)) or use an associated mark’s **sort** option. For example, to sort bars by ascending frequency rather than alphabetically by letter:

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y"}})
```

The sort option is an object whose keys are ordinal scale names, such as *x* or *fx*, and whose values are mark channel names, such as **y**, **y1**, or **y2**. By specifying an existing channel rather than a new value, you avoid repeating the order definition and can refer to channels derived by [transforms](./transforms.md) (such as [stack](../transforms/stack.md) or [bin](../transforms/bin.md)). When sorting the *x* domain, if no **x** channel is defined, **x2** will be used instead if available, and similarly for *y* and **y2**; this is useful for marks that implicitly stack such as [area](../marks/area.md), [bar](../marks/bar.md), and [rect](../marks/rect.md). A sort value may also be specified as *width* or *height*, representing derived channels |*x2* - *x1*| and |*y2* - *y1*| respectively.

Note that there may be multiple associated values in the secondary dimension for a given value in the primary ordinal dimension. The secondary values are therefore grouped for each associated primary value, and each group is then aggregated by applying a reducer. Lastly the primary values are sorted based on the associated reduced value in natural ascending order to produce the domain. The default reducer is *max*, but may be changed by specifying the *reduce* option. The above code is shorthand for:

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", reduce: "max"}})
```

Generally speaking, a reducer only needs to be specified when there are multiple secondary values for a given primary value. See the [group transform](../transforms/group.md) for the list of supported reducers.

For descending rather than ascending order, use the *reverse* option:

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", reverse: true}})
```

An additional *limit* option truncates the domain to the first *n* values after sorting. If *limit* is negative, the last *n* values are used instead. Hence, a positive *limit* with *reverse* = true will return the top *n* values in descending order. If *limit* is an array [*lo*, *hi*], the *i*th values with *lo* ≤ *i* < *hi* will be selected. (Note that like the [basic filter transform](../transforms/filter.md), limiting the *x* domain here does not affect the computation of the *y* domain, which is computed independently without respect to filtering.)

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", limit: 5}})
```

If different sort options are needed for different ordinal scales, the channel name can be replaced with a *value* object with additional per-scale options.

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: {value: "y", reverse: true}}})
```

If the input channel is *data*, then the reducer is passed groups of the mark’s data; this is typically used in conjunction with a custom reducer function, as when the built-in single-channel reducers are insufficient.

Note: when the value of the sort option is a string or a function, it is interpreted as a mark [sort transform](../transforms/sort.md). To use both sort options and a mark sort transform, use [Plot.sort](../transforms/sort.md#plotsortcompare-options).

## scale(*options*)

You can also create a standalone scale with Plot.**scale**(*options*). The *options* object must define at least one scale; see [Scale options](#scale-options) for how to define a scale. For example, here is a linear color scale with the default domain of [0, 1] and default scheme *turbo*:

```js
const color = Plot.scale({color: {type: "linear"}});
```

Both [*plot*.scale](./plots.md#plot-scale-name) and [Plot.scale](#scale-options-1) return scale objects. These objects represent the actual (or “materialized”) scale options used by Plot, including the domain, range, interpolate function, *etc.* The scale’s label, if any, is also returned; however, note that other axis properties are not currently exposed. Point and band scales also expose their materialized bandwidth and step.

To reuse a scale across plots, pass the corresponding scale object into another plot specification:

```js
const plot1 = Plot.plot(options);
const plot2 = Plot.plot({...options, color: plot1.scale("color")});
```

For convenience, scale objects expose a *scale*.**apply**(*input*) method which returns the scale’s output for the given *input* value. When applicable, scale objects also expose a *scale*.**invert**(*output*) method which returns the corresponding input value from the scale’s domain for the given *output* value.
