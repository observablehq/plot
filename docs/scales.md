# Scales, axes, and legends

Scales map an abstract value such as time or temperature to a visual value such as *x*- or *y*-position or color. Scales define a plot’s coordinate system.

In Plot, scales are named: **x** or **y** for position; **fx** or **fy** for facet position; **r** for radius; or **color**. A plot can have multiple scales but at most one scale of a given name. Mark channels are bound to scales; for example, a dot’s **x** channel is bound to the **x** scale. The channel name and the scale name are often the same, but not always; for example, a bar’s **y1** and **y2** channels are both bound to the **y** scale.

A scale is configured primarily by its input **domain** and output **range**: the domain is a set of abstract values typically derived from data, such as a time interval [*start*, *end*] or temperature interval [*cold*, *hot*]; the range is a set of visual values, such as an extent of the chart in pixels [*left*, *right*] or a color interval [*blue*, *red*].

To observe scale behavior, let’s first look at some empty plots with only an *x*-scale and some hard-coded domains. The *x*-axis reveals the resulting position (a value from the range) for the corresponding abstract value (a value from the domain).

## Continuous position

The domain of a quantitative scale is a continuous interval [*min*, *max*] where *min* and *max* are numbers, such as temperatures. Below, the first domain value (*x* = 0) corresponds to the left edge of the plot while the second (*x* = 100) corresponds to the right edge.

```js
Plot.plot({x: {domain: [0, 100]}, grid: true})
```

Flipping the domain reverses the scale so that +*x* points ←left instead of right→.

```js
Plot.plot({x: {domain: [100, 0]}, grid: true})
```

Alternatively, use the **reverse** option; this is convenient when the domain is implied from data rather than specified explicitly. (We’ll cover implied domains in more detail in the *inference* section below.)

```js
Plot.plot({x: {domain: [0, 100], reverse: true}, grid: true})
```

If the domain is dates, Plot will default to a UTC scale. This is a linear scale with ticks based on the Gregorian calendar. (Plot uses [d3.scaleTime](https://github.com/d3/d3-scale#time_ticks)’s “multi-scale” tick format, so January shows the year.) Plot doesn’t parse dates; convert your strings to [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) instances with [d3.utcParse](https://github.com/d3/d3-time-format#utcParse) or [d3.autoType](https://github.com/d3/d3-dsv#autoType), or by passing typed: true to Observable’s FileAttachment function.

```js
Plot.plot({x: {domain: [new Date("2021-01-01"), new Date("2022-01-01")]}, grid: true})
```

To force a UTC scale, say when the data is milliseconds since UNIX epoch rather than Date instances, pass “utc” as the **type** option.

```js
Plot.plot({x: {type: "utc", domain: [1609459200000, 1640995200000]}, grid: true})
```

If the *type* is “time”, the ticks will be in local time rather than UTC. Be careful here: if your reader is in a different time zone, you may see different plots! UTC is strongly recommended if you are plotting daily (or less frequent) data.

```js
Plot.plot({x: {type: "time", domain: [new Date(2021, 0, 1), new Date(2022, 0, 1)]}, grid: true})
```

When plotting values that vary widely, such as the luminosity of stars in an [HR diagram](https://observablehq.com/@mbostock/hertzsprung-russell-diagram), a [logarithmic transformation](http://github.com/d3/d3-scale#log-scales) may improve readability; this can be enabled with type “log”. This defaults to base-10 ticks with exponential notation.

```js
Plot.plot({x: {type: "log", domain: [1e0, 1e5]}, grid: true})
```

If you prefer conventional notation, you can specify the **tickFormat** option to change the behavior of the axis. Note, however, that this may result in overlapping text.

```js
Plot.plot({x: {type: "log", domain: [1e0, 1e5], tickFormat: ","}, grid: true})
```

SI-prefix notation is also supported; the **tickFormat** option can either be a [d3.format](https://github.com/d3/d3-format) string or a function that takes a tick value and returns the corresponding string.

```js
Plot.plot({x: {type: "log", domain: [1e0, 1e5], tickFormat: "~s"}, grid: true})
```

Log scales also support a **base** option, say for powers of two. Exponential notation is only the default for base 10.

```js
Plot.plot({x: {type: "log", base: 2, domain: [1e0, 1e4], ticks: 20}, grid: true})
```

The domain of a log scale cannot include (or cross) zero; for this, consider a [bi-symmetric log](https://github.com/d3/d3-scale#symlog-scales) scale instead.

```js
Plot.plot({x: {type: "symlog", domain: [-10, 10]}, grid: true})
```

Power scales and square-root scales are also supported. The “pow” scale supports the **exponent** option, which defaults to 1 (for a linear scale).

Plot.plot({x: {type: "sqrt", domain: [0, 100]}, grid: true})

```js
Plot.plot({x: {type: "pow", exponent: 1 / 3, domain: [0, 100]}, grid: true})
```

Continuous scales also support a **clamp** option, which if true, clamps input values to the scale’s domain before scaling. This is useful for preventing marks from escaping the chart area.

## Discrete position

Sadly, not all data is continuous and quantitative: some data is merely ordinal such as t-shirt sizes, and some categorical (*a.k.a.* nominal) such as brands of clothing. To encode such data as position, a point or band scale is required.

A point scale divides space into uniformly-spaced discrete values. It is commonly used for scatterplots (dot marks) of ordinal data. It is the default scale type for ordinal data on the *x* and *y* scale.

```js
Plot.plot({x: {type: "point", domain: [..."ABCDEFGHIJ"]}, grid: true})
```

A band scale divides space into uniformly-spaced and -sized discrete intervals. It is commonly used for bar charts (bar marks).

```js
Plot.plot({x: {type: "band", domain: [..."ABCDEFGHIJ"]}, grid: true})
```

While *point* and *band* scales appear visually similar when only the grid is visible, the two are not identical — they differ respective to padding. Play with the options below to get a sense of their effect on the scale’s behavior.

<!-- viewof padding = Inputs.range([0, 1], {value: 0.1, step: 0.01, label: "Padding"}) -->

<!-- viewof align = Inputs.range([0, 1], {value: 0.5, step: 0.01, label: "Align"}) -->

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
    Plot.frame({stroke: "#ccc"}),
    Plot.tickX([..."ABCDEFGHIJ"], {x: d => d, fill: "none", stroke: "currentColor"})
  ]
})
```

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
    Plot.frame({stroke: "#ccc"}),
    Plot.cell([..."ABCDEFGHIJ"], {x: d => d, fill: "none", stroke: "currentColor"})
  ]
})
```

Positions scales also have a **round** option which forces the scale to snap to integer pixels. This defaults to true for point and band scales, and false for quantitative scales. Use caution with high-cardinality ordinal domains (*i.e.*, a point or band scale used to encode many different values), as rounding can lead to “wasted” space or even zero-width bands.

## Continuous color

While position is the most salient, and thus more important, encoding, many visualizations also employ a color encoding. As with position, the default type of quantitative color scale is *linear*: the difference in value should be proportional to the perceived difference in color.

<!-- viewof schemeq = Inputs.select(new Map([
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

```js
Plot.plot({
  color: {
    scheme: schemeq
  },
  marks: [
    Plot.cell([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], {x: d => d, fill: d => d})
  ]
})
```

The default color scheme is [Turbo](https://ai.googleblog.com/2019/08/turbo-improved-rainbow-colormap-for.html). A wide variety of sequential, diverging, and cyclical schemes are supported, including ColorBrewer and [Viridis](http://bids.github.io/colormap/). You can implement a custom color scheme by specifying the scale’s *range*, or by passing an *interpolate* function that takes a parameter *t* in [0, 1]. The *interpolate* option can also be used to specify a color space, or a two-argument function that takes a pair of values from the range.

```js
Plot.plot({
  color: {
    type: "linear",
    range: ["steelblue", "orange"] // uses d3.interpolateRgb
  },
  marks: [
    Plot.cell([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], {x: d => d, fill: d => d})
  ]
})
```

```js
Plot.plot({
  color: {
    type: "linear",
    range: ["steelblue", "orange"],
    interpolate: "hcl" // uses d3.interpolateHcl
  },
  marks: [
    Plot.cell([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], {x: d => d, fill: d => d})
  ]
})
```

```js
Plot.plot({
  color: {
    type: "linear",
    interpolate: t => `hsl(${t * 360},100%,50%)` // angry rainbow!
  },
  marks: [
    Plot.cell([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], {x: d => d, fill: d => d})
  ]
})
```

And like position scales, you can apply a *sqrt*, *pow*, *log*, or *symlog* transform; these are often useful when working with non-uniformly distributed data.

```js
html`${["log", "symlog", "sqrt", "linear"].map(type => html`<div style="position: relative;">
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
})}`)}
```

Diverging color scales are intended to show positive and negative values (or more generally values above or below some *pivot* value); diverging color scales default to the “RdBu” (red–blue) color scheme.

```js
Plot.plot({
  color: {
    type: "diverging"
  },
  marks: [
    Plot.cell([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], {x: d => d, fill: d => d})
  ]
})
```

The pivot defaults to zero, but you can change it with the **pivot** option, which should ideally be a value near the middle of the domain.

<!-- viewof pivot = Inputs.range([-5, 5], {step: 0.1, value: -3, label: "Pivot"}) -->

```js
Plot.plot({
  color: {
    type: "diverging",
    pivot
  },
  marks: [
    Plot.cell([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], {x: d => d, fill: d => d})
  ]
})
```

Here is a practical example showing observed global surface temperatures, represented as “anomalies” relative to the 1951–1980 average. Note that the “BuRd” color scheme is used since blue and red are semantically associated with cold and hot, respectively.

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

```js
gistemp = FileAttachment("gistemp.csv").csv({typed: true})
```

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

```js
Plot.plot({
  color: {
    type: "categorical",
    scheme: schemec
  },
  marks: [
    Plot.cell([..."ABCDEFGHIJ"], {x: d => d, fill: d => d})
  ]
})
```

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

```js
Plot.plot({
  color: {
    type: "ordinal",
    domain: "ABCDEFGHIJ",
    scheme: schemeo,
    unknown: "gray"
  },
  marks: [
    Plot.cell([..."ABCDEFGHIJ", null], {x: d => d ?? "N/A", fill: d => d})
  ]
})
```

Note that we are using the **unknown** option to set the color of invalid values.

## Continuous radius

For [dot marks](./dot.md), the *r* channel makes the dots’ area proportional to the associated quantitative value. The default range for the associated *r* scale is constructed such that a zero value maps to zero for an accurate areal encoding, while the first quartile of values is mapped to a radius of three pixels; this tends to be more stable with varying data. Adjust the dot size as needed by specifying an explicit range.

<!-- viewof radius = Inputs.range([1, 20], {label: "Radius", step: 0.1, value: 8}) -->

```js
Plot.plot({
  r: {
    range: [0, radius]
  },
  marks: [
    Plot.dot([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], {x: d => d, r: d => d, fill: "black"})
  ]
})
```

## Inference

Plot strives to be concise: rather than you laboriously specifying everything, Plot can guess by inspecting the data so you don’t have to set the **type**, **domain**, and **range** (and for color, **scheme**) of scales explicitly. But for Plot’s guesses to be accurate, your data must match Plot’s expectations. Here they are.

A scale’s **type** is most often inferred from associated marks’ channel values: strings and booleans imply an ordinal scale; dates imply a UTC scale; anything else is linear. Plot assumes that your data is consistently typed, so inference is based solely on the first non-null, non-undefined value. We recommend typed CSV (passing typed: true to FileAttachment’s csv method) or explicitly coercing types when loading data (*e.g.*, d3.autoType).

If a scale’s **domain** is specified explicitly, the scale’s **type** is inferred from the domain values rather than channels as described above. However, if the domain or range has more than two elements, the ordinal type (or point for position scales) is used.

Finally, some marks declare the scale **type** for associated channels. For example, Plot.barX defines *y* as a band scale. It is an error if the user-defined scale type does not match the mark. Further, the facet scales *fx* and *fy* are always band scales, and the radius scale *r* is implicitly a sqrt scale.

If you don’t specify a quantitative scale’s **domain**, it is the extent (minimum and maximum) of associated channel values, except for the *r* (radius) scale where it goes from zero to the maximum. A quantitative domain can be extended to “nice” human-readable values with the **nice** option. For an ordinal scale, the domain defaults to the sorted union (all distinct values in natural order) of associated values.

All position scales (*x*, *y*, *fx*, and *fy*) have implicit automatic ranges based on the chart dimensions. The *x*-scale ranges from the left to right edge, while the *y*-scale ranges from the bottom to top edge, accounting for margins.

## Transforms

The *scale*.**transform** option allows you to apply a function to all values before they are passed through the scale. This is convenient for transforming a scale’s data, say to convert to thousands or between temperature units.

```js
sftemp = FileAttachment("sf-temperatures.csv").csv({typed: true})
```

<!-- viewof celsius = Inputs.toggle({label: "Celsius"}) -->

```js
Plot.plot({
  y: {
    grid: true,
    label: `↑ Daily temperature range (°${celsius ? "C" : "F"})`,
    transform: celsius ? f => (f - 32) * (5 / 9) : undefined // Fahrenheit to Celsius
  },
  marks: [
    Plot.areaY(sftemp, {x: "date", y1: "low", y2: "high"})
  ]
})
```

The shorthand *scale*.**percent** option multiplies values by 100, and adds a % symbol to the default label.

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

Next we’ll look at data transformations.
