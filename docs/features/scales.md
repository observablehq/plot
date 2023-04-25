<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref} from "vue";
import gistemp from "../data/gistemp.ts";

const schemeq = ref("turbo");
const schemed = ref("rdbu");
const interpolateq = ref("rgb");

</script>

# Scales

:::danger TODO
This guide is still under construction. 🚧 Please come back when it’s finished.
:::

Scales map an abstract value such as time or temperature to a visual value such as *x*- or *y*-position or color. Scales define a plot’s coordinate system.

In Plot, scales are named: **x** or **y** for position; **fx** or **fy** for facet position; **r** for radius; or **color**. A plot can have multiple scales but at most one scale of a given name. Mark channels are bound to scales; for example, a dot’s **x** channel is bound to the **x** scale. The channel name and the scale name are often the same, but not always; for example, a bar’s **y1** and **y2** channels are both bound to the **y** scale.

A scale is configured primarily by its input **domain** and output **range**: the domain is a set of abstract values typically derived from data, such as a time interval [*start*, *end*] or temperature interval [*cold*, *hot*]; the range is a set of visual values, such as an extent of the chart in pixels [*left*, *right*] or a color interval [*blue*, *red*].

To observe scale behavior, let’s first look at some empty plots with only an *x*-scale and some hard-coded domains. The *x*-axis reveals the resulting position (a value from the range) for the corresponding abstract value (a value from the domain).

## Continuous position

The domain of a quantitative scale is a continuous interval [*min*, *max*] where *min* and *max* are numbers, such as temperatures. Below, the first domain value (*x* = 0) corresponds to the left edge of the plot while the second (*x* = 100) corresponds to the right edge.

:::plot
```js
Plot.gridX().plot({x: {domain: [0, 100]}})
```
:::

Flipping the domain reverses the scale so that +*x* points ←left instead of right→.

:::plot
```js
Plot.gridX().plot({x: {domain: [100, 0]}})
```
:::

Alternatively, use the **reverse** option; this is convenient when the domain is implied from data rather than specified explicitly. (We’ll cover implied domains in more detail in the *inference* section below.)

:::plot
```js
Plot.gridX().plot({x: {domain: [0, 100], reverse: true}})
```
:::

If the domain is dates, Plot will default to a UTC scale. This is a linear scale with ticks based on the Gregorian calendar. (Plot uses [d3.scaleTime](https://github.com/d3/d3-scale#time_ticks)’s “multi-scale” tick format, so January shows the year.)

<!-- Plot doesn’t parse dates; convert your strings to [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) instances with [d3.utcParse](https://github.com/d3/d3-time-format#utcParse) or [d3.autoType](https://github.com/d3/d3-dsv#autoType). -->

:::plot
```js
Plot.gridX().plot({x: {domain: [new Date("2021-01-01"), new Date("2022-01-01")]}})
```
:::

To force a UTC scale, say when the data is milliseconds since UNIX epoch rather than Date instances, pass “utc” as the **type** option.

:::plot
```js
Plot.gridX().plot({x: {type: "utc", domain: [1609459200000, 1640995200000]}})
```
:::

If the *type* is “time”, the ticks will be in local time rather than UTC. Be careful here: if your reader is in a different time zone, you may see different plots! UTC is strongly recommended if you are plotting daily (or less frequent) data.

:::plot
```js
Plot.gridX().plot({x: {type: "time", domain: [new Date(2021, 0, 1), new Date(2022, 0, 1)]}})
```
:::

When plotting values that vary widely, such as the luminosity of stars in an [HR diagram](https://observablehq.com/@mbostock/hertzsprung-russell-diagram), a [logarithmic transformation](http://github.com/d3/d3-scale#log-scales) may improve readability; this can be enabled with type “log”. This defaults to base-10 ticks with exponential notation.

:::plot
```js
Plot.gridX().plot({x: {type: "log", domain: [1e0, 1e5]}})
```
:::

If you prefer conventional notation, you can specify the **tickFormat** option to change the behavior of the axis. Note, however, that this may result in overlapping text.

:::plot
```js
Plot.gridX().plot({x: {type: "log", domain: [1e0, 1e5], tickFormat: ","}})
```
:::

SI-prefix notation is also supported; the **tickFormat** option can either be a [d3.format](https://github.com/d3/d3-format) string or a function that takes a tick value and returns the corresponding string.

:::plot
```js
Plot.gridX().plot({x: {type: "log", domain: [1e0, 1e5], tickFormat: "~s"}})
```
:::

Log scales also support a **base** option, say for powers of two. Exponential notation is only the default for base 10.

:::plot
```js
Plot.gridX().plot({x: {type: "log", base: 2, domain: [1e0, 1e4], ticks: 20}})
```
:::

The domain of a log scale cannot include (or cross) zero; for this, consider a [bi-symmetric log](https://github.com/d3/d3-scale#symlog-scales) scale instead.

:::plot
```js
Plot.gridX().plot({x: {type: "symlog", domain: [-10, 10]}})
```
:::

Power scales and square-root scales are also supported. The “pow” scale supports the **exponent** option, which defaults to 1 (for a linear scale).

:::plot
```js
Plot.gridX().plot({x: {type: "sqrt", domain: [0, 100]}})
```
:::

:::plot
```js
Plot.gridX().plot({x: {type: "pow", exponent: 1 / 3, domain: [0, 100]}})
```
:::

Continuous scales also support a **clamp** option, which if true, clamps input values to the scale’s domain before scaling. This is useful for preventing marks from escaping the chart area.

## Discrete position

Sadly, not all data is continuous and quantitative: some data is merely ordinal such as t-shirt sizes, and some categorical (*a.k.a.* nominal) such as brands of clothing. To encode such data as position, a point or band scale is required.

A point scale divides space into uniformly-spaced discrete values. It is commonly used for scatterplots (dot marks) of ordinal data. It is the default scale type for ordinal data on the *x* and *y* scale.

:::plot
```js
Plot.gridX().plot({x: {type: "point", domain: [..."ABCDEFGHIJ"]}})
```
:::

A band scale divides space into uniformly-spaced and -sized discrete intervals. It is commonly used for bar charts (bar marks).

:::plot
```js
Plot.gridX().plot({x: {type: "band", domain: [..."ABCDEFGHIJ"]}})
```
:::

While *point* and *band* scales appear visually similar when only the grid is visible, the two are not identical—they differ respective to padding. TK Play with the options below to get a sense of their effect on the scale’s behavior.

<!-- viewof padding = Inputs.range([0, 1], {value: 0.1, step: 0.01, label: "Padding"}) -->

<!-- viewof align = Inputs.range([0, 1], {value: 0.5, step: 0.01, label: "Align"}) -->

:::plot hidden
```js
Plot.plot({
  grid: true,
  marginTop: 0.5,
  x: {
    padding: undefined, // TODO
    align: undefined, // TODO
    round: false
  },
  marks: [
    Plot.frame({stroke: "#ccc"}),
    Plot.tickX([..."ABCDEFGHIJ"], {x: (d) => d, fill: "none", stroke: "currentColor"})
  ]
})
```
:::

:::plot hidden
```js
Plot.plot({
  grid: true,
  marginTop: 0.5,
  x: {
    padding: undefined, // TODO
    align: undefined, // TODO
    round: false
  },
  marks: [
    Plot.frame({stroke: "#ccc"}),
    Plot.cell([..."ABCDEFGHIJ"], {x: (d) => d, fill: "none", stroke: "currentColor"})
  ]
})
```
:::

Positions scales also have a **round** option which forces the scale to snap to integer pixels. This defaults to true for point and band scales, and false for quantitative scales. Use caution with high-cardinality ordinal domains (*i.e.*, a point or band scale used to encode many different values), as rounding can lead to “wasted” space or even zero-width bands.

## Continuous color

While position is the most salient, and thus more important, encoding, many visualizations also employ a color encoding. As with position, the default type of quantitative color scale is *linear*: the difference in value should be proportional to the perceived difference in color.

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
    Plot.cell(d3.range(40), {x: (d) => d, fill: (d) => d, inset: -0.5})
  ]
})
```
:::

The default color scheme is [Turbo](https://ai.googleblog.com/2019/08/turbo-improved-rainbow-colormap-for.html). A wide variety of sequential, diverging, and cyclical schemes are supported, including ColorBrewer and [Viridis](http://bids.github.io/colormap/). You can implement a custom color scheme by specifying the scale’s *range*, or by passing an *interpolate* function that takes a parameter *t* in [0, 1]. The *interpolate* option can also be used to specify a color space, or a two-argument function that takes a pair of values from the range.

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
    Plot.cell(d3.range(40), {x: (d) => d, fill: (d) => d, inset: -0.5})
  ]
})

```
:::

And like position scales, you can apply a *sqrt*, *pow*, *log*, or *symlog* transform; these are often useful when working with non-uniformly distributed data.

<!-- html`${["log", "symlog", "sqrt", "linear"].map((type) => html`<div style="position: relative;">
  <div style="position: absolute; color: white; font: bold 13px/33px var(--sans-serif); padding: 0 38px;">${type}</div>${Plot.plot({
  height: 33,
  color: {
    type
  },
  x: {
    round: true,
    padding: 0,
    axis: null
  },
  marks: [
    Plot.cellX({length: 64}, {x: (d, i) => i, fill: (d, i) => (i + 1)})
  ]
})}`)} -->

Diverging color scales are intended to show positive and negative values (or more generally values above or below some *pivot* value); diverging color scales default to the “RdBu” (red–blue) color scheme.

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
    Plot.cell(d3.range(40), {x: (d) => d, fill: (d) => d, inset: -0.5})
  ]
})
```
:::

The pivot defaults to zero, but you can change it with the **pivot** option, which should ideally be a value near the middle of the domain.

<!-- viewof pivot = Inputs.range([-5, 5], {step: 0.1, value: -3, label: "Pivot"}) -->

:::plot hidden
```js
Plot.plot({
  color: {
    type: "diverging",
    pivot: undefined // TODO
  },
  marks: [
    Plot.cell([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], {x: (d) => d, fill: (d) => d})
  ]
})
```
:::

Here is a practical example showing observed global surface temperatures, represented as “anomalies” relative to the 1951–1980 average. Note that the “BuRd” color scheme is used since blue and red are semantically associated with cold and hot, respectively.

:::plot
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

## Discrete color

Plot also provides color schemes for discrete data. Use the *categorical* type for categorical (nominal) unordered data, and the *ordinal* type for ordered data. Unlike continuous color schemes for quantitative data, these discrete color schemes are optimized for low-cardinality domains. Note that if the size of the categorical domain exceeds the number of colors in the scheme, colors will be reused; combining values into an “other” category is recommended.

<!-- viewof schemec = Inputs.select(new Map([
["Accent (categorical, 8 colors)", "accent"],
["Category10 (categorical, 10 colors)", "category10"],
["Dark2 (categorical, 8 colors)", "dark2"],
["Paired (categorical, 12 colors)", "paired"],
["Pastel1 (categorical, 9 colors)", "pastel1"],
["Pastel2 (categorical, 8 colors)", "pastel2"],
["Set1 (categorical, 9 colors)", "set1"],
["Set2 (categorical, 8 colors)", "set2"],
["Set3 (categorical, 12 colors)", "set3"],
["Tableau10 (categorical, 10 colors)", "tableau10"]
]), {label: "Color scheme", value: "tableau10"}) -->

:::plot hidden
```js
Plot.plot({
  color: {
    type: "categorical",
    scheme: undefined // TODO schemec
  },
  marks: [
    Plot.cell([..."ABCDEFGHIJ"], {x: (d) => d, fill: (d) => d})
  ]
})
```
:::

<!-- viewof schemeo = Inputs.select(new Map([
["Blues (sequential, single-hue)", "blues"],
["Greens (sequential, single-hue)", "greens"],
["Greys (sequential, single-hue)", "greys"],
["Purples (sequential, single-hue)", "purples"],
["Reds (sequential, single-hue)", "reds"],
["Oranges (sequential, single-hue)", "oranges"],
["Turbo (sequential, multi-hue)", "turbo"],
["Viridis (sequential, multi-hue)", "viridis"],
["Magma (sequential, multi-hue)", "magma"],
["Inferno (sequential, multi-hue)", "inferno"],
["Plasma (sequential, multi-hue)", "plasma"],
["Cividis (sequential, multi-hue)", "cividis"],
["Cubehelix (sequential, multi-hue)", "cubehelix"],
["Warm (sequential, multi-hue)", "warm"],
["Cool (sequential, multi-hue)", "cool"],
["BuGn (sequential, multi-hue)", "bugn"],
["BuPu (sequential, multi-hue)", "bupu"],
["GnBu (sequential, multi-hue)", "gnbu"],
["OrRd (sequential, multi-hue)", "orrd"],
["PuBuGn (sequential, multi-hue)", "pubugn"],
["PuBu (sequential, multi-hue)", "pubu"],
["PuRd (sequential, multi-hue)", "purd"],
["RdPu (sequential, multi-hue)", "rdpu"],
["YlGnBu (sequential, multi-hue)", "ylgnbu"],
["YlGn (sequential, multi-hue)", "ylgn"],
["YlOrBr (sequential, multi-hue)", "ylorbr"],
["YlOrRd (sequential, multi-hue)", "ylorrd"],
["BrBG (diverging)", "brbg"],
["PRGn (diverging)", "prgn"],
["PiYG (diverging)", "piyg"],
["PuOr (diverging)", "puor"],
["RdBu (diverging)", "rdbu"],
["RdGy (diverging)", "rdgy"],
["RdYlBu (diverging)", "rdylbu"],
["RdYlGn (diverging)", "rdylgn"],
["Spectral (diverging)", "spectral"],
["BuRd (diverging)", "burd"],
["BuYlRd (diverging)", "buylrd"],
["Rainbow (cyclical)", "rainbow"],
["Sinebow (cylical)", "sinebow"]
]), {label: "Color scheme", value: "turbo"}) -->

:::plot hidden
```js
Plot.plot({
  color: {
    type: "ordinal",
    domain: "ABCDEFGHIJ",
    scheme: undefined, // TODO schemeo
    unknown: "gray"
  },
  marks: [
    Plot.cell([..."ABCDEFGHIJ", null], {x: (d) => d ?? "N/A", fill: (d) => d})
  ]
})
```
:::

Note that we are using the **unknown** option to set the color of invalid values.

## Continuous radius

For [dot marks](../marks/dot.md), the *r* channel makes the dots’ area proportional to the associated quantitative value. The default range for the associated *r* scale is constructed such that a zero value maps to zero for an accurate areal encoding, while the first quartile of values is mapped to a radius of three pixels; this tends to be more stable with varying data. Adjust the dot size as needed by specifying an explicit range.

<!-- viewof radius = Inputs.range([1, 20], {label: "Radius", step: 0.1, value: 8}) -->

:::plot hidden
```js
Plot.plot({
  r: {
    range: [0, 10] // TODO radius
  },
  marks: [
    Plot.dot([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], {x: (d) => d, r: (d) => d, fill: "black"})
  ]
})
```
:::

## Scale type inference

Plot strives to be concise: rather than you laboriously specifying everything, Plot can guess by inspecting the data so you don’t have to set the **type**, **domain**, and **range** (and for color, **scheme**) of scales explicitly. But for Plot’s guesses to be accurate, your data must match Plot’s expectations. Here they are.

A scale’s **type** is most often inferred from associated marks’ channel values: strings and booleans imply an ordinal scale; dates imply a UTC scale; anything else is linear. Plot assumes that your data is consistently typed, so inference is based solely on the first non-null, non-undefined value. We recommend typed CSV (passing typed: true to FileAttachment’s csv method) or explicitly coercing types when loading data (*e.g.*, d3.autoType).

If a scale’s **domain** is specified explicitly, the scale’s **type** is inferred from the domain values rather than channels as described above. However, if the domain or range has more than two elements, the ordinal type (or point for position scales) is used.

Finally, some marks declare the scale **type** for associated channels. For example, Plot.barX defines *y* as a band scale. It is an error if the user-defined scale type does not match the mark. Further, the facet scales *fx* and *fy* are always band scales, and the radius scale *r* is implicitly a sqrt scale.

If you don’t specify a quantitative scale’s **domain**, it is the extent (minimum and maximum) of associated channel values, except for the *r* (radius) scale where it goes from zero to the maximum. A quantitative domain can be extended to “nice” human-readable values with the **nice** option. For an ordinal scale, the domain defaults to the sorted union (all distinct values in natural order) of associated values.

All position scales (*x*, *y*, *fx*, and *fy*) have implicit automatic ranges based on the chart dimensions. The *x*-scale ranges from the left to right edge, while the *y*-scale ranges from the bottom to top edge, accounting for margins.

## Sort option

If an ordinal scale’s domain is not set, it defaults to natural ascending order; to order the domain by associated values in another dimension, either compute the domain manually (consider [d3.groupSort](https://github.com/d3/d3-array/blob/main/README.md#groupSort)) or use an associated mark’s **sort** option. For example, to sort bars by ascending frequency rather than alphabetically by letter:

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y"}})
```

The sort option is an object whose keys are ordinal scale names, such as *x* or *fx*, and whose values are mark channel names, such as *y*, *y1*, or *y2*. By specifying an existing channel rather than a new value, you avoid repeating the order definition and can refer to channels derived by [transforms](./transforms.md) (such as [stack](../transforms/stack.md) or [bin](../transforms/bin.md)). When sorting on the *x*, if no such channel is defined, the *x2* channel will be used instead if available, and similarly for *y* and *y2*; this is useful for marks that implicitly stack such as [area](../marks/area.md), [bar](../marks/bar.md), and [rect](../marks/rect.md). A sort value may also be specified as *width* or *height*, representing derived channels |*x2* - *x1*| and |*y2* - *y1*| respectively.

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

Note: when the value of the sort option is a string or a function, it is interpreted as a [basic sort transform](../transforms/sort.md). To use both sort options and a sort transform, use [Plot.sort](../transforms/sort.md#plotsortcompare-options).

## Scale transforms

The *scale*.**transform** option allows you to apply a function to all values before they are passed through the scale. This is convenient for transforming a scale’s data, say to convert to thousands or between temperature units.

<!-- sftemp = FileAttachment("sf-temperatures.csv").csv({typed: true}) -->

<!-- viewof celsius = Inputs.toggle({label: "Celsius"}) -->

```js
Plot.plot({
  y: {
    grid: true,
    label: `↑ Daily temperature range (°${celsius ? "C" : "F"})`,
    transform: celsius ? (f) => (f - 32) * (5 / 9) : undefined // Fahrenheit to Celsius
  },
  marks: [
    Plot.areaY(sftemp, {x: "date", y1: "low", y2: "high"})
  ]
})
```

The shorthand *scale*.**percent** option multiplies values by 100, and adds a % symbol to the default label.

:::plot
```js
Plot.plot({
  y: {
    percent: true
  },
  color: {
    type: "diverging",
    scheme: "BuRd"
  },
  marks: [
    Plot.rectY(gistemp, Plot.binX({y: "proportion", fill: "median"}, {x: "Anomaly", fill: "Anomaly"})),
    Plot.ruleY([0])
  ]
})
```
:::

## Scale options

Plot passes data through [scales](https://observablehq.com/@observablehq/plot-scales) as needed before rendering marks. A scale maps abstract values such as time or temperature to visual values such as position or color. Within a given plot, marks share scales. For example, if a plot has two Plot.line marks, both share the same *x* and *y* scales for a consistent representation of data. (Plot does not currently support dual-axis charts, which are [not advised](https://blog.datawrapper.de/dualaxis/).)

```js
Plot.plot({
  marks: [
    Plot.line(aapl, {x: "Date", y: "Close"}),
    Plot.line(goog, {x: "Date", y: "Close"})
  ]
})
```

Each scale’s options are specified as a nested options object with the corresponding scale name within the top-level plot *options*:

* **x** - horizontal position
* **y** - vertical position
* **r** - radius (size)
* **color** - fill or stroke
* **opacity** - fill or stroke opacity
* **length** - linear length (for [vectors](../marks/vector.md))
* **symbol** - categorical symbol (for [dots](../marks/dot.md))

For example, to set the domain for the *x* and *y* scales:

```js
Plot.plot({
  x: {
    domain: [new Date("1880-01-01"), new Date("2016-11-01")]
  },
  y: {
    domain: [-0.78, 1.35]
  }
})
```

Plot supports many scale types. Some scale types are for quantitative data: values that can be added or subtracted, such as temperature or time. Other scale types are for ordinal or categorical data: unquantifiable values that can only be ordered, such as t-shirt sizes, or values with no inherent order that can only be tested for equality, such as types of fruit. Some scale types are further intended for specific visual encodings: for example, as [position](#position-scales) or [color](#color-scales).

You can set the scale type explicitly via the *scale*.**type** option, though typically the scale type is inferred automatically. Some marks mandate a particular scale type: for example, [Plot.barY](../marks/bar.md) requires that the *x* scale is a *band* scale. Some scales have a default type: for example, the *radius* scale defaults to *sqrt* and the *opacity* scale defaults to *linear*. Most often, the scale type is inferred from associated data, pulled either from the domain (if specified) or from associated channels. Strings and booleans imply an ordinal scale; dates imply a UTC scale; and anything else is linear. Unless they represent text, we recommend explicitly converting strings to more specific types when loading data (*e.g.*, with d3.autoType or Observable’s FileAttachment). For simplicity’s sake, Plot assumes that data is consistently typed; type inference is based solely on the first non-null, non-undefined value.

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

For ordinal data (*e.g.*, strings), use the *ordinal* scale type or the *point* or *band* [position scale types](#position-scales). The *categorical* scale type is also supported; it is equivalent to *ordinal* except as a [color scale](#color-scales), where it provides a different default color scheme. (Since position is inherently ordinal or even quantitative, categorical data must be assigned an effective order when represented as position, and hence *categorical* and *ordinal* may be considered synonymous in context.)

You can opt-out of a scale using the *identity* scale type. This is useful if you wish to specify literal colors or pixel positions within a mark channel rather than relying on the scale to convert abstract values into visual values. For position scales (*x* and *y*), an *identity* scale is still quantitative and may produce an axis, yet unlike a *linear* scale the domain and range are fixed based on the plot layout. (To opt out of a scale for a single channel, you can specify the channel values as a {value, scale} object; see [mark options](./plots.md#marks).)

Quantitative scales, as well as identity position scales, coerce channel values to numbers; both null and undefined are coerced to NaN. Similarly, time scales coerce channel values to dates; numbers are assumed to be milliseconds since UNIX epoch, while strings are assumed to be in [ISO 8601 format](https://github.com/mbostock/isoformat/blob/main/README.md#parsedate-fallback).

A scale’s domain (the extent of its inputs, abstract values) and range (the extent of its outputs, visual values) are typically inferred automatically. You can set them explicitly using these options:

* *scale*.**domain** - typically [*min*, *max*], or an array of ordinal or categorical values
* *scale*.**range** - typically [*min*, *max*], or an array of ordinal or categorical values
* *scale*.**unknown** - the desired output value (defaults to undefined) for invalid input values
* *scale*.**reverse** - reverses the domain (or in somes cases, the range), say to flip the chart along *x* or *y*
* *scale*.**interval** - an interval or time interval (for interval data; see below)

For most quantitative scales, the default domain is the [*min*, *max*] of all values associated with the scale. For the *radius* and *opacity* scales, the default domain is [0, *max*] to ensure a meaningful value encoding. For ordinal scales, the default domain is the set of all distinct values associated with the scale in natural ascending order; for a different order, set the domain explicitly or add a [sort option](#sort-option) to an associated mark. For threshold scales, the default domain is [0] to separate negative and non-negative values. For quantile scales, the default domain is the set of all defined values associated with the scale. If a scale is reversed, it is equivalent to setting the domain as [*max*, *min*] instead of [*min*, *max*].

The default range depends on the scale: for [position scales](#position-scales) (*x*, *y*, *fx*, and *fy*), the default range depends on the plot’s [size and margins](./plots.md#layout). For [color scales](#color-scales), there are default color schemes for quantitative, ordinal, and categorical data. For opacity, the default range is [0, 1]. And for radius, the default range is designed to produce dots of “reasonable” size assuming a *sqrt* scale type for accurate area representation: zero maps to zero, the first quartile maps to a radius of three pixels, and other values are extrapolated. This convention for radius ensures that if the scale’s data values are all equal, dots have the default constant radius of three pixels, while if the data varies, dots will tend to be larger.

The behavior of the *scale*.**unknown** option depends on the scale type. For quantitative and temporal scales, the unknown value is used whenever the input value is undefined, null, or NaN. For ordinal or categorical scales, the unknown value is returned for any input value outside the domain. For band or point scales, the unknown option has no effect; it is effectively always equal to undefined. If the unknown option is set to undefined (the default), or null or NaN, then the affected input values will be considered undefined and filtered from the output.

For data at regular intervals, such as integer values or daily samples, the *scale*.**interval** option can be used to enforce uniformity. The specified *interval*—such as d3.utcMonth—must expose an *interval*.floor(*value*), *interval*.offset(*value*), and *interval*.range(*start*, *stop*) functions. The option can also be specified as a number, in which case it will be promoted to a numeric interval with the given step. The option can alternatively be specified as a string (*second*, *minute*, *hour*, *day*, *week*, *month*, *quarter*, *half*, *year*, *monday*, *tuesday*, *wednesday*, *thursday*, *friday*, *saturday*, *sunday*) naming the corresponding UTC interval. This option sets the default *scale*.transform to the given interval’s *interval*.floor function. In addition, the default *scale*.domain is an array of uniformly-spaced values spanning the extent of the values associated with the scale.

Quantitative scales can be further customized with additional options:

* *scale*.**clamp** - if true, clamp input values to the scale’s domain
* *scale*.**nice** - if true (or a tick count), extend the domain to nice round values
* *scale*.**zero** - if true, extend the domain to include zero if needed
* *scale*.**percent** - if true, transform proportions in [0, 1] to percentages in [0, 100]

Clamping is typically used in conjunction with setting an explicit domain since if the domain is inferred, no values will be outside the domain. Clamping is useful for focusing on a subset of the data while ensuring that extreme values remain visible, but use caution: clamped values may need an annotation to avoid misinterpretation. Top-level **clamp**, **nice**, and **zero** options are supported as shorthand for setting the respective option on all scales.

The *scale*.**transform** option allows you to apply a function to all values before they are passed through the scale. This is convenient for transforming a scale’s data, say to convert to thousands or between temperature units.

```js
Plot.plot({
  y: {
    label: "↑ Temperature (°F)",
    transform: (f) => f * 9 / 5 + 32 // convert Celsius to Fahrenheit
  },
  marks: …
})
```

## scale(*options*)

You can also create a standalone scale with Plot.**scale**(*options*). The *options* object must define at least one scale; see [Scale options](#scale-options) for how to define a scale. For example, here is a linear color scale with the default domain of [0, 1] and default scheme *turbo*:

```js
const color = Plot.scale({color: {type: "linear"}});
```

## Scale objects

Both [*plot*.scale](./plots.md#plot-scale-name) and [Plot.scale](#scale-options-1) return scale objects. These objects represent the actual (or “materialized”) scale options used by Plot, including the domain, range, interpolate function, *etc.* The scale’s label, if any, is also returned; however, note that other axis properties are not currently exposed. Point and band scales also expose their materialized bandwidth and step.

To reuse a scale across plots, pass the corresponding scale object into another plot specification:

```js
const plot1 = Plot.plot(…);
const plot2 = Plot.plot({…, color: plot1.scale("color")});
```

For convenience, scale objects expose a *scale*.**apply**(*input*) method which returns the scale’s output for the given *input* value. When applicable, scale objects also expose a *scale*.**invert**(*output*) method which returns the corresponding input value from the scale’s domain for the given *output* value.

## Color scales

The normal scale types—*linear*, *sqrt*, *pow*, *log*, *symlog*, and *ordinal*—can be used to encode color. In addition, Plot supports special scale types for color:

* *categorical* - equivalent to *ordinal*, but defaults to the *tableau10* scheme
* *sequential* - equivalent to *linear*
* *cyclical* - equivalent to *linear*, but defaults to the *rainbow* scheme
* *threshold* - encodes based on the specified discrete thresholds; defaults to the *rdylbu* scheme
* *quantile* - encodes based on the computed quantile thresholds; defaults to the *rdylbu* scheme
* *quantize* - transforms a continuous domain into quantized thresholds; defaults to the *rdylbu* scheme
* *diverging* - like *linear*, but with a pivot; defaults to the *rdbu* scheme
* *diverging-log* - like *log*, but with a pivot that defaults to 1; defaults to the *rdbu* scheme
* *diverging-pow* - like *pow*, but with a pivot; defaults to the *rdbu* scheme
* *diverging-sqrt* - like *sqrt*, but with a pivot; defaults to the *rdbu* scheme
* *diverging-symlog* - like *symlog*, but with a pivot; defaults to the *rdbu* scheme

For a *threshold* scale, the *domain* represents *n* (typically numeric) thresholds which will produce a *range* of *n* + 1 output colors; the *i*th color of the *range* applies to values that are smaller than the *i*th element of the domain and larger or equal to the *i* - 1th element of the domain. For a *quantile* scale, the *domain* represents all input values to the scale, and the *n* option specifies how many quantiles to compute from the *domain*; *n* quantiles will produce *n* - 1 thresholds, and an output range of *n* colors. For a *quantize* scale, the domain will be transformed into approximately *n* quantized values, where *n* is an option that defaults to 5.

By default, all diverging color scales are symmetric around the pivot; set *symmetric* to false if you want to cover the whole extent on both sides.

Color scales support two additional options:

* *scale*.**scheme** - a named color scheme in lieu of a range, such as *reds*
* *scale*.**interpolate** - in conjunction with a range, how to interpolate colors

For quantile and quantize color scales, the *scale*.scheme option is used in conjunction with *scale*.**n**, which determines how many quantiles or quantized values to compute, and thus the number of elements in the scale’s range; it defaults to 5 (for quintiles in the case of a quantile scale).

The following sequential scale schemes are supported for both quantitative and ordinal data:

```
* <sub><img src="./img/blues.png" width="32" height="16" alt="blues"></sub> *blues*
* <sub><img src="./img/greens.png" width="32" height="16" alt="greens"></sub> *greens*
* <sub><img src="./img/greys.png" width="32" height="16" alt="greys"></sub> *greys*
* <sub><img src="./img/oranges.png" width="32" height="16" alt="oranges"></sub> *oranges*
* <sub><img src="./img/purples.png" width="32" height="16" alt="purples"></sub> *purples*
* <sub><img src="./img/reds.png" width="32" height="16" alt="reds"></sub> *reds*
* <sub><img src="./img/bugn.png" width="32" height="16" alt="bugn"></sub> *bugn*
* <sub><img src="./img/bupu.png" width="32" height="16" alt="bupu"></sub> *bupu*
* <sub><img src="./img/gnbu.png" width="32" height="16" alt="gnbu"></sub> *gnbu*
* <sub><img src="./img/orrd.png" width="32" height="16" alt="orrd"></sub> *orrd*
* <sub><img src="./img/pubu.png" width="32" height="16" alt="pubu"></sub> *pubu*
* <sub><img src="./img/pubugn.png" width="32" height="16" alt="pubugn"></sub> *pubugn*
* <sub><img src="./img/purd.png" width="32" height="16" alt="purd"></sub> *purd*
* <sub><img src="./img/rdpu.png" width="32" height="16" alt="rdpu"></sub> *rdpu*
* <sub><img src="./img/ylgn.png" width="32" height="16" alt="ylgn"></sub> *ylgn*
* <sub><img src="./img/ylgnbu.png" width="32" height="16" alt="ylgnbu"></sub> *ylgnbu*
* <sub><img src="./img/ylorbr.png" width="32" height="16" alt="ylorbr"></sub> *ylorbr*
* <sub><img src="./img/ylorrd.png" width="32" height="16" alt="ylorrd"></sub> *ylorrd*
* <sub><img src="./img/cividis.png" width="32" height="16" alt="cividis"></sub> *cividis*
* <sub><img src="./img/inferno.png" width="32" height="16" alt="inferno"></sub> *inferno*
* <sub><img src="./img/magma.png" width="32" height="16" alt="magma"></sub> *magma*
* <sub><img src="./img/plasma.png" width="32" height="16" alt="plasma"></sub> *plasma*
* <sub><img src="./img/viridis.png" width="32" height="16" alt="viridis"></sub> *viridis*
* <sub><img src="./img/cubehelix.png" width="32" height="16" alt="cubehelix"></sub> *cubehelix*
* <sub><img src="./img/turbo.png" width="32" height="16" alt="turbo"></sub> *turbo*
* <sub><img src="./img/warm.png" width="32" height="16" alt="warm"></sub> *warm*
* <sub><img src="./img/cool.png" width="32" height="16" alt="cool"></sub> *cool*
```

The default color scheme, *turbo*, was chosen primarily to ensure high-contrast visibility. Color schemes such as *blues* make low-value marks difficult to see against a white background, for better or for worse. To use a subset of a continuous color scheme (or any single-argument *interpolate* function), set the *scale*.range property to the corresponding subset of [0, 1]; for example, to use the first half of the *rainbow* color scheme, use a range of [0, 0.5]. By default, the full range [0, 1] is used. If you wish to encode a quantitative value without hue, consider using *opacity* rather than *color* (e.g., use Plot.dot’s *strokeOpacity* instead of *stroke*).

The following diverging scale schemes are supported:

```
* <sub><img src="./img/brbg.png" width="32" height="16" alt="brbg"></sub> *brbg*
* <sub><img src="./img/prgn.png" width="32" height="16" alt="prgn"></sub> *prgn*
* <sub><img src="./img/piyg.png" width="32" height="16" alt="piyg"></sub> *piyg*
* <sub><img src="./img/puor.png" width="32" height="16" alt="puor"></sub> *puor*
* <sub><img src="./img/rdbu.png" width="32" height="16" alt="rdbu"></sub> *rdbu*
* <sub><img src="./img/rdgy.png" width="32" height="16" alt="rdgy"></sub> *rdgy*
* <sub><img src="./img/rdylbu.png" width="32" height="16" alt="rdylbu"></sub> *rdylbu*
* <sub><img src="./img/rdylgn.png" width="32" height="16" alt="rdylgn"></sub> *rdylgn*
* <sub><img src="./img/spectral.png" width="32" height="16" alt="spectral"></sub> *spectral*
* <sub><img src="./img/burd.png" width="32" height="16" alt="burd"></sub> *burd*
* <sub><img src="./img/buylrd.png" width="32" height="16" alt="buylrd"></sub> *buylrd*
```

Picking a diverging color scheme name defaults the scale type to *diverging*; set the scale type to *linear* to treat the color scheme as sequential instead. Diverging color scales support a *scale*.**pivot** option, which defaults to zero. Values below the pivot will use the lower half of the color scheme (*e.g.*, reds for the *rdgy* scheme), while values above the pivot will use the upper half (grays for *rdgy*).

The following cylical color schemes are supported:

```
* <sub><img src="./img/rainbow.png" width="32" height="16" alt="rainbow"></sub> *rainbow*
* <sub><img src="./img/sinebow.png" width="32" height="16" alt="sinebow"></sub> *sinebow*
```

The following categorical color schemes are supported:

```
* <sub><img src="./img/accent.png" width="96" height="16" alt="accent"></sub> *accent* (8 colors)
* <sub><img src="./img/category10.png" width="120" height="16" alt="category10"></sub> *category10* (10 colors)
* <sub><img src="./img/dark2.png" width="96" height="16" alt="dark2"></sub> *dark2* (8 colors)
* <sub><img src="./img/paired.png" width="144" height="16" alt="paired"></sub> *paired* (12 colors)
* <sub><img src="./img/pastel1.png" width="108" height="16" alt="pastel1"></sub> *pastel1* (9 colors)
* <sub><img src="./img/pastel2.png" width="96" height="16" alt="pastel2"></sub> *pastel2* (8 colors)
* <sub><img src="./img/set1.png" width="108" height="16" alt="set1"></sub> *set1* (9 colors)
* <sub><img src="./img/set2.png" width="96" height="16" alt="set2"></sub> *set2* (8 colors)
* <sub><img src="./img/set3.png" width="144" height="16" alt="set3"></sub> *set3* (12 colors)
* <sub><img src="./img/tableau10.png" width="120" height="16" alt="tableau10"></sub> *tableau10* (10 colors)
```

The following color interpolators are supported:

* *rgb* - RGB (red, green, blue)
* *hsl* - HSL (hue, saturation, lightness)
* *lab* - CIELAB (*a.k.a.* “Lab”)
* *hcl* - CIELCh<sub>ab</sub> (*a.k.a.* “LCh” or “HCL”)

For example, to use CIELCh<sub>ab</sub>:

```js
Plot.plot({
  color: {
    range: ["red", "blue"],
    interpolate: "hcl"
  },
  marks: …
})
```

Or to use gamma-corrected RGB (via [d3-interpolate](https://github.com/d3/d3-interpolate)):

```js
Plot.plot({
  color: {
    range: ["red", "blue"],
    interpolate: d3.interpolateRgb.gamma(2.2)
  },
  marks: …
})
```

## Position scales

The position scales (*x*, *y*, *fx*, and *fy*) support additional options:

* *scale*.**inset** - inset the default range by the specified amount in pixels
* *scale*.**round** - round the output value to the nearest integer (whole pixel)

The *x* and *fx* scales support asymmetric insets for more precision. Replace inset by:

* *scale*.**insetLeft** - insets the start of the default range by the specified number of pixels
* *scale*.**insetRight** - insets the end of the default range by the specified number of pixels

Similarly, the *y* and *fy* scales support asymmetric insets with:

* *scale*.**insetTop** - insets the top of the default range by the specified number of pixels
* *scale*.**insetBottom** - insets the bottom of the default range by the specified number of pixels

The inset scale options can provide “breathing room” to separate marks from axes or the plot’s edge. For example, in a scatterplot with a Plot.dot with the default 3-pixel radius and 1.5-pixel stroke width, an inset of 5 pixels prevents dots from overlapping with the axes. The *scale*.round option is useful for crisp edges by rounding to the nearest pixel boundary.

In addition to the generic *ordinal* scale type, which requires an explicit output range value for each input domain value, Plot supports special *point* and *band* scale types for encoding ordinal data as position. These scale types accept a [*min*, *max*] range similar to quantitative scales, and divide this continuous interval into discrete points or bands based on the number of distinct values in the domain (*i.e.*, the domain’s cardinality). If the associated marks have no effective width along the ordinal dimension—such as a dot, rule, or tick—then use a *point* scale; otherwise, say for a bar, use a *band* scale. In the image below, the top *x* scale is a *point* scale while the bottom *x* scale is a *band* scale; see [Plot: Scales](https://observablehq.com/@observablehq/plot-scales) for an interactive version.

```
<img src="./img/point-band.png" width="640" alt="point and band scales">
````

Ordinal position scales support additional options, all specified as proportions in [0, 1]:

* *scale*.**padding** - how much of the range to reserve to inset first and last point or band
* *scale*.**align** - where to distribute points or bands (0 = at start, 0.5 = at middle, 1 = at end)

For a *band* scale, you can further fine-tune padding:

* *scale*.**paddingInner** - how much of the range to reserve to separate adjacent bands
* *scale*.**paddingOuter** - how much of the range to reserve to inset first and last band

Align defaults to 0.5 (centered). Band scale padding defaults to 0.1 (10% of available space reserved for separating bands), while point scale padding defaults to 0.5 (the gap between the first point and the edge is half the distance of the gap between points, and likewise for the gap between the last point and the opposite edge). Note that rounding and mark insets (e.g., for bars and rects) also affect separation between adjacent marks.

Plot automatically generates [axis](../marks/axis.md) and optionally [grid](../marks/grid.md) marks for position scales. (For more control, declare these marks explicitly.) You can configure the implicit axes with the following scale options:

* *scale*.**axis** - the orientation: *top* or *bottom* (or *both*) for *x* and *fx*; *left* or *right* (or *both*) for *y* and *fy*; null to suppress
* *scale*.**ticks** - the approximate number of ticks to generate, or interval, or array of values
* *scale*.**tickSize** - the length of each tick (in pixels; default 6 for *x* and *y*, or 0 for *fx* and *fy*)
* *scale*.**tickSpacing** - the approximate number of pixels between ticks (if *scale*.**ticks** is not specified)
* *scale*.**tickPadding** - the separation between the tick and its label (in pixels; default 3)
* *scale*.**tickFormat** - either a function or specifier string to format tick values; see [Formats](./formats.md)
* *scale*.**tickRotate** - whether to rotate tick labels (an angle in degrees clockwise; default 0)
* *scale*.**grid** - whether to draw grid lines across the plot for each tick
* *scale*.**line** - if true, draw the axis line (only for *x* and *y*)
* *scale*.**label** - a string to label the axis
* *scale*.**labelAnchor** - the label anchor: *top*, *right*, *bottom*, *left*, or *center*
* *scale*.**labelOffset** - the label position offset (in pixels; default depends on margins and orientation)
* *scale*.**fontVariant** - the font-variant attribute for axis ticks; defaults to tabular-nums for quantitative axes
* *scale*.**ariaLabel** - a short label representing the axis in the accessibility tree
* *scale*.**ariaDescription** - a textual description for the axis

Top-level options are also supported as shorthand: **grid** (for *x* and *y* only; see [facet.grid](./facets.md)), **label**, **axis**, **inset**, **round**, **align**, and **padding**. If the **grid** option is true, show a grid with the currentColor stroke; if specified as a string, show a grid with the specified stroke color; if an approximate number of ticks, an interval, or an array of tick values, show corresponding grid lines.
