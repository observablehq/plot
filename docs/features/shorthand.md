<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const numbers = [
  170.16, 172.53, 172.54, 173.44, 174.35, 174.55, 173.16, 174.59, 176.18, 177.90,
  176.15, 179.37, 178.61, 177.30, 177.30, 177.25, 174.51, 172.00, 170.16, 165.53,
  166.87, 167.17, 166.00, 159.10, 154.83, 163.09, 160.29, 157.07, 158.50, 161.95,
  163.04, 169.79, 172.36, 172.05, 172.83, 171.80, 173.67, 176.35, 179.10, 179.26
];

const timeSeries = [
  [new Date("2018-01-02"), 170.160004],
  [new Date("2018-01-03"), 172.529999],
  [new Date("2018-01-04"), 172.539993],
  [new Date("2018-01-05"), 173.440002],
  [new Date("2018-01-08"), 174.350006],
  [new Date("2018-01-09"), 174.550003],
  [new Date("2018-01-10"), 173.160004],
  [new Date("2018-01-11"), 174.589996],
  [new Date("2018-01-12"), 176.179993],
  [new Date("2018-01-16"), 177.899994],
  [new Date("2018-01-17"), 176.149994],
  [new Date("2018-01-18"), 179.369995],
  [new Date("2018-01-19"), 178.610001],
  [new Date("2018-01-22"), 177.300003],
  [new Date("2018-01-23"), 177.300003],
  [new Date("2018-01-24"), 177.250000],
  [new Date("2018-01-25"), 174.509995],
  [new Date("2018-01-26"), 172.000000],
  [new Date("2018-01-29"), 170.160004],
  [new Date("2018-01-30"), 165.529999],
  [new Date("2018-01-31"), 166.869995],
  [new Date("2018-02-01"), 167.169998],
  [new Date("2018-02-02"), 166.000000],
  [new Date("2018-02-05"), 159.100006],
  [new Date("2018-02-06"), 154.830002],
  [new Date("2018-02-07"), 163.089996],
  [new Date("2018-02-08"), 160.289993],
  [new Date("2018-02-09"), 157.070007],
  [new Date("2018-02-12"), 158.500000],
  [new Date("2018-02-13"), 161.949997],
  [new Date("2018-02-14"), 163.039993],
  [new Date("2018-02-15"), 169.789993],
  [new Date("2018-02-16"), 172.360001],
  [new Date("2018-02-20"), 172.050003],
  [new Date("2018-02-21"), 172.830002],
  [new Date("2018-02-22"), 171.800003],
  [new Date("2018-02-23"), 173.669998],
  [new Date("2018-02-26"), 176.350006],
  [new Date("2018-02-27"), 179.100006],
  [new Date("2018-02-28"), 179.259995]
];

const matrix = [
  ["Jacob", "Olivia"],
  ["Mia", "Noah"],
  ["Noah", "Ava"],
  ["Ava", "Mason"],
  ["Olivia", "Noah"],
  ["Jacob", "Emma"],
  ["Ava", "Noah"],
  ["Noah", "Jacob"],
  ["Olivia", "Ava"],
  ["Mason", "Emma"],
  ["Jacob", "Mia"],
  ["Mia", "Jacob"],
  ["Emma", "Jacob"]
];

const gene = "AAAAGAGTGAAGATGCTGGAGACGAGTGAAGCATTCACTTTAGGGAAAGCGAGGCAAGAGCGTTTCAGAAGACGAAACCTGGTAGGTGCACTCACCACAG";

</script>

# Shorthand

The most concise form of Plot is its **shorthand** syntax where no options are specified—only data. To use this shorthand, the data must have a specific structure: either a one-dimensional array of values [*v₀*, *v₁*, *v₂*, …] or a two-dimensional array of tuples [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …].

While none of these charts are particularly groundbreaking, we hope you find this shorthand convenient the next time you want a quick look at some data. And if the shorthand view is useful, you can then enhance it by adding options!

## One dimension

Let’s start with the one-dimensional form: an array of numbers.

```js
numbers = [
  170.16, 172.53, 172.54, 173.44, 174.35, 174.55, 173.16, 174.59, 176.18, 177.90,
  176.15, 179.37, 178.61, 177.30, 177.30, 177.25, 174.51, 172.00, 170.16, 165.53,
  166.87, 167.17, 166.00, 159.10, 154.83, 163.09, 160.29, 157.07, 158.50, 161.95,
  163.04, 169.79, 172.36, 172.05, 172.83, 171.80, 173.67, 176.35, 179.10, 179.26
]
```

These numbers represent the daily opening price of Apple stock starting on January 1, 2018. For a simple line chart, we can pass the data to [Plot.lineY](../marks/line.md) to construct a line mark, and then call *line*.plot.

:::plot https://observablehq.com/@observablehq/plot-shorthand-one-dimensional-line
```js
Plot.lineY(numbers).plot()
```
:::

The *y*-axis above represents price in U.S. dollars. The *x*-axis represents the index of the data: the first value {{numbers[0]}} is shown at *x* = 0, the second value {{numbers[1]}} at *x* = 1, and so on. In other words, *x* represents the number of (trading) days since January 1, 2018. It’d be nicer to have an *x*-axis that shows dates here, but it’s still convenient to see the trend in stock price quickly.

If we pass the numbers to [Plot.areaY](../marks/area.md) instead, we’ll get a simple area chart with a baseline implicitly at *y* = 0.

:::plot https://observablehq.com/@observablehq/plot-shorthand-one-dimensional-area
```js
Plot.areaY(numbers).plot()
```
:::

Similarly if we use [Plot.rectY](../marks/rect.md), we’ll get a series of vertical bars. This implicitly uses the [interval transform](../transforms/interval.md) such that the first rect spans from *x* = 0 to *x* = 1, the second from *x* = 1 to *x* = 2, and so on, with a horizontal inset to separate adjacent rects.

:::plot https://observablehq.com/@observablehq/plot-shorthand-one-dimensional-rect
```js
Plot.rectY(numbers).plot()
```
:::

[Plot.barY](../marks/bar.md) produces a visually similar result but with different semantics: *x* is now ordinal (a *band* scale) rather than quantitative (*linear*). An ordinal axis labels every tick, which appear at the middle of each bar rather than between rects.

:::plot https://observablehq.com/@observablehq/plot-shorthand-one-dimensional-bar
```js
Plot.barY(numbers).plot()
```
:::

Like Plot.barY, [Plot.cellX](../marks/cell.md) implies that *x* is ordinal. But now instead of a *y* channel the numeric value is encoded as the *fill* color. The default quantitative color scheme is *turbo*; higher values are reddish, and lower values blueish.

:::plot https://observablehq.com/@observablehq/plot-shorthand-one-dimensional-cell
```js
Plot.cellX(numbers).plot()
```
:::

If we don’t care about the order of our data and we instead just want to look at the one-dimensional distribution of values, we can use [Plot.dotX](../marks/dot.md).

:::plot https://observablehq.com/@observablehq/plot-shorthand-one-dimensional-dot
```js
Plot.dotX(numbers).plot()
```
:::

Alternatively, we can use [Plot.ruleX](../marks/rule.md) to draw a vertical rule at each value. In this case, Plot.ruleX behaves identically to [Plot.tickX](../marks/tick.md). (If there *were* a *y* channel, then Plot.tickX would imply that *y* is ordinal whereas Plot.ruleX would imply that *y* is quantitative.) It is common to use the rule shorthand to annotate special *x* or *y* values in plots, such as *y* = 0, in conjunction with other marks.

:::plot https://observablehq.com/@observablehq/plot-shorthand-one-dimensional-rule
```js
Plot.ruleX(numbers).plot()
```
:::

:::plot https://observablehq.com/@observablehq/plot-shorthand-one-dimensional-tick
```js
Plot.tickX(numbers).plot()
```
:::

We could even use [Plot.vectorX](../marks/vector.md) here to draw little up-pointing arrows. (Typically the vector mark is used in conjunction with the *rotate* and *length* options to control the direction and magnitude of each vector.)

:::plot https://observablehq.com/@observablehq/plot-shorthand-one-dimensional-vector
```js
Plot.vectorX(numbers).plot()
```
:::

While not particularly readable due to occlusion, we can use [Plot.textX](../marks/text.md) to draw a label at each value, too.

:::plot https://observablehq.com/@observablehq/plot-shorthand-one-dimensional-text
```js
Plot.textX(numbers).plot()
```
:::

For a more formal method of summarizing a one-dimensional distribution, we can use [Plot.boxX](../marks/box.md) to create a horizontal boxplot. The gray band represents the interquartile range; the black whiskers show the extrema (not including outliers); and the thick black stroke represents the median; any outliers (none in this dataset) are drawn as dots.

:::plot https://observablehq.com/@observablehq/plot-shorthand-box
```js
Plot.boxX(numbers).plot()
```
:::

Some of Plot’s transforms support shorthand syntax, too. For example, we can use Plot.rectY with [Plot.binX](../transforms/bin.md) to generate a histogram—another common way to visualize a one-dimensional distribution.

:::plot https://observablehq.com/@observablehq/plot-shorthand-histogram
```js
Plot.rectY(numbers, Plot.binX()).plot()
```
:::

Similarly [Plot.groupX](../transforms/group.md) can be used to group and count ordinal data, such as the frequency of bases in a random DNA sequence.

```js
gene = "AAAAGAGTGAAGATGCTGGAGACGAGTGAAGCATTCACTTTAGGGAAAGCGAGGCAAGAGCGTTTCAGAAGACGAAACCTGGTAGGTGCACTCACCACAG"
```

:::plot https://observablehq.com/@observablehq/plot-shorthand-group
```js
Plot.barY(gene, Plot.groupX()).plot()
```
:::

And here’s the [dodge transform](../transforms/dodge.md) for a beeswarm plot:

:::plot https://observablehq.com/@observablehq/plot-shorthand-dodge
```js
Plot.dotX(numbers, Plot.dodgeY()).plot()
```
:::

## Two dimensions

Now let’s switch to a two-dimensional array of tuples [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …]. The *x*-values here are times (Date instances at UTC midnight); the *y*-values again are the daily opening price of Apple stock.

```js
timeSeries = [
  [new Date("2018-01-02"), 170.160004],
  [new Date("2018-01-03"), 172.529999],
  [new Date("2018-01-04"), 172.539993],
  [new Date("2018-01-05"), 173.440002],
  [new Date("2018-01-08"), 174.350006],
  [new Date("2018-01-09"), 174.550003],
  [new Date("2018-01-10"), 173.160004],
  [new Date("2018-01-11"), 174.589996],
  [new Date("2018-01-12"), 176.179993],
  [new Date("2018-01-16"), 177.899994],
  [new Date("2018-01-17"), 176.149994],
  [new Date("2018-01-18"), 179.369995],
  [new Date("2018-01-19"), 178.610001],
  [new Date("2018-01-22"), 177.300003],
  [new Date("2018-01-23"), 177.300003],
  [new Date("2018-01-24"), 177.250000],
  [new Date("2018-01-25"), 174.509995],
  [new Date("2018-01-26"), 172.000000],
  [new Date("2018-01-29"), 170.160004],
  [new Date("2018-01-30"), 165.529999],
  [new Date("2018-01-31"), 166.869995],
  [new Date("2018-02-01"), 167.169998],
  [new Date("2018-02-02"), 166.000000],
  [new Date("2018-02-05"), 159.100006],
  [new Date("2018-02-06"), 154.830002],
  [new Date("2018-02-07"), 163.089996],
  [new Date("2018-02-08"), 160.289993],
  [new Date("2018-02-09"), 157.070007],
  [new Date("2018-02-12"), 158.500000],
  [new Date("2018-02-13"), 161.949997],
  [new Date("2018-02-14"), 163.039993],
  [new Date("2018-02-15"), 169.789993],
  [new Date("2018-02-16"), 172.360001],
  [new Date("2018-02-20"), 172.050003],
  [new Date("2018-02-21"), 172.830002],
  [new Date("2018-02-22"), 171.800003],
  [new Date("2018-02-23"), 173.669998],
  [new Date("2018-02-26"), 176.350006],
  [new Date("2018-02-27"), 179.100006],
  [new Date("2018-02-28"), 179.259995]
]
```

If we pass this to Plot.line (*not* Plot.lineY as before), we’ll get another line chart, but now the *x*-axis shows the date rather than the zero-based index. Also, the *x*-values are no longer uniformly spaced, as there are gaps on the weekends and holidays when the markets are closed.

:::plot https://observablehq.com/@observablehq/plot-shorthand-temporal-line
```js
Plot.line(timeSeries).plot()
```
:::

Similarly Plot.area will produce the equivalent area chart, again with an implicit baseline at *y* = 0.

:::plot https://observablehq.com/@observablehq/plot-shorthand-temporal-area
```js
Plot.area(timeSeries).plot()
```
:::

There’s currently no two-dimensional shorthand for rect or bar, though you can use these marks to display time series data with options.

Plot.dot will produce a scatterplot…

:::plot https://observablehq.com/@observablehq/plot-shorthand-temporal-dot
```js
Plot.dot(timeSeries).plot()
```
:::

As will Plot.vector…

:::plot https://observablehq.com/@observablehq/plot-shorthand-temporal-vector
```js
Plot.vector(timeSeries).plot()
```
:::

Plot.text also produces a scatterplot with labels showing the zero-based index of the data. Perhaps not very useful, but it at least shows the data’s order.

:::plot https://observablehq.com/@observablehq/plot-shorthand-temporal-text
```js
Plot.text(timeSeries).plot()
```
:::

Plot.cell also supports two-dimensional shorthand. As we saw above, Plot.cell implies that *x* and *y* are ordinal, so we shouldn’t pass temporal (dates) and quantitative (numbers) data; here’s a matrix diagram that shows which pairs exist in the dataset. You might use this, for example, to visualize who reviewed whose code.

```js
matrix = [
  ["Jacob", "Olivia"],
  ["Mia", "Noah"],
  ["Noah", "Ava"],
  ["Ava", "Mason"],
  ["Olivia", "Noah"],
  ["Jacob", "Emma"],
  ["Ava", "Noah"],
  ["Noah", "Jacob"],
  ["Olivia", "Ava"],
  ["Mason", "Emma"],
  ["Jacob", "Mia"],
  ["Mia", "Jacob"],
  ["Emma", "Jacob"]
]
```

:::plot https://observablehq.com/@observablehq/plot-shorthand-cell
```js
Plot.cell(matrix).plot()
```
:::

## Caveats

Plot has a few marks that don’t currently provide meaningful shorthand. The [arrow](../marks/arrow.md) and [link](../marks/link.md) marks both require a start (*x1*, *y1*) and end (*x2*, *y2*) point; and the [image](../marks/image.md) mark requires a source URL (*src*).
