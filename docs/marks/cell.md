<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import alphabet from "../data/alphabet.ts";
import hadcrut from "../data/hadcrut.ts";

const dji = shallowRef([]);
const seattle = shallowRef([]);
const simpsons = shallowRef(d3.cross(d3.range(1, 29), d3.range(1, 26), (x, y) => ({season: x, number_in_season: y})));

onMounted(() => {
  d3.csv("../data/dji.csv", d3.autoType).then((data) => (dji.value = data));
  d3.csv("../data/seattle-weather.csv", d3.autoType).then((data) => (seattle.value = data));
  d3.csv("../data/simpsons.csv", d3.autoType).then((data) => (simpsons.value = data));
});

</script>

# Cell mark

:::tip
The cell mark is one of several marks in Plot for drawing rectangles; it should be used when both dimensions are ordinal. See also [bar](./bar.md) and [rect](./rect.md).
:::

The **cell mark** draws rectangles positioned in two ordinal dimensions. Hence, the plot’s *x* and *y* scales are [band scales](../features/scales.md). Cells typically also have a **fill** color encoding.

For example, the heatmap below shows the decline of *The Simpsons* after Season 9: high IMDb ratings are dark green, while low ratings are dark pink. (The worst episode ever—cue Comic Book Guy—is season 23’s [“Lisa Goes Gaga”](https://en.wikipedia.org/wiki/Lisa_Goes_Gaga).)

:::plot defer https://observablehq.com/@observablehq/plot-simpsons-ratings
```js
Plot.plot({
  padding: 0,
  grid: true,
  x: {axis: "top", label: "Season"},
  y: {label: "Episode"},
  color: {type: "linear", scheme: "PiYG"},
  marks: [
    Plot.cell(simpsons, {x: "season", y: "number_in_season", fill: "imdb_rating", inset: 0.5}),
    Plot.text(simpsons, {x: "season", y: "number_in_season", text: (d) => d.imdb_rating?.toFixed(1), fill: "black", title: "title"})
  ]
})
```
:::

With [faceting](../features/facets.md), we can produce a calendar of multiple years, where **x** represents week-of-year and **y** represents day-of-week. Below shows almost twenty years of daily changes of the Dow Jones Industrial Average.

:::plot defer https://observablehq.com/@observablehq/plot-dow-jones-calendar
```js
Plot.plot({
  padding: 0,
  x: {axis: null},
  y: {tickFormat: Plot.formatWeekday("en", "narrow"), tickSize: 0},
  fy: {tickFormat: ""},
  color: {scheme: "PiYG"},
  marks: [
    Plot.cell(dji, {
      x: (d) => d3.utcWeek.count(d3.utcYear(d.Date), d.Date),
      y: (d) => d.Date.getUTCDay(),
      fy: (d) => d.Date.getUTCFullYear(),
      fill: (d, i) => i > 0 ? (d.Close - dji[i - 1].Close) / dji[i - 1].Close : NaN,
      title: (d, i) => i > 0 ? ((d.Close - dji[i - 1].Close) / dji[i - 1].Close * 100).toFixed(1) : NaN,
      inset: 0.5
    })
  ]
})
```
:::

The cell mark can be combined with the [group transform](../transforms/group.md), which groups data by ordinal value. (The [bin transform](../transforms/bin.md), on the other hand, is intended for quantitative data and is typically paired with the [rect mark](./rect.md).) The heatmap below shows the maximum observed temperature by month (**y**) and date (**x**) in Seattle from 2012 through 2015.

:::plot defer https://observablehq.com/@observablehq/plot-seattle-temperature-heatmap
```js
Plot.plot({
  height: 300,
  padding: 0,
  y: {tickFormat: Plot.formatMonth("en", "short")},
  marks: [
    Plot.cell(seattle, Plot.group({fill: "max"}, {
      x: (d) => d.date.getUTCDate(),
      y: (d) => d.date.getUTCMonth(),
      fill: "temp_max",
      inset: 0.5
    }))
  ]
})
```
:::

A one-dimensional cell is produced by specifying only **x** or only **y**. The plot below collapses the history of *The Simpsons* to a single line.

:::plot defer https://observablehq.com/@observablehq/plot-simpsons-barcode
```js
Plot.plot({
  x: {
    ticks: simpsons.filter((d) => d.number_in_season === 1).map((d) => d.id),
    tickFormat: (x) => simpsons.find((d) => d.id === x).season,
    label: "Season →",
    labelAnchor: "right"
  },
  color: {
    type: "linear",
    scheme: "PiYG"
  },
  marks: [
    Plot.cell(simpsons, {x: "id", fill: "imdb_rating"})
  ]
})
```
:::

:::info
Here the *x*-scale domain contains the *id* of every episode. An ordinal scale by default draws a tick for every domain value; setting **ticks** to just the first episode of each season prevents overlapping labels. The **tickFormat** function finds the row corresponding to the episode id and returns the corresponding *season* number.
:::

One-dimensional cells can be a compact alternative to a bar chart, where the *fill* color of the cell replaces the length of the bar. However, position is a more salient encoding and should be preferred to color if space is available.

:::plot https://observablehq.com/@observablehq/plot-colored-cells
```js
Plot.cell(alphabet, {x: "letter", fill: "frequency"}).plot()
```
:::

When ordinal data is regular, such as the yearly observations of the warming stripes below, use the **interval** scale option to enforce uniformity and show gaps for missing data. It can be set to a named interval such as *hour* or *day*, a number for numeric intervals, a [d3-time interval](https://github.com/d3/d3-time/blob/main/README.md#api-reference), or a custom implementation.

:::plot https://observablehq.com/@observablehq/plot-ordinal-scale-interval-2
```js{5}
Plot.plot({
  x: {
    ticks: d3.ticks(...d3.extent(hadcrut, (d) => d.year), 10),
    tickFormat: "d",
    interval: 1, // recommended in case of missing data
    label: null
  },
  color: {
    scheme: "BuRd"
  },
  marks: [
    Plot.cell(hadcrut, {x: "year", fill: "anomaly"})
  ]
})
```
:::

:::tip
When an ordinal scale domain has high cardinality, the **ticks** scale option can be used to specify which ticks to label. Alternatively, consider using a quantitative or temporal scale instead, as by switching to a [bar mark](./bar.md).
:::

## Cell options

In addition to the [standard mark options](../features/marks.md#mark-options), including insets and rounded corners, the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale, which must be *band*
* **y** - the vertical position; bound to the *y* scale, which must be *band*

If **x** is not specified, the cell will span the full horizontal extent of the plot (or facet). Likewise if **y** is not specified, the cell will span the full vertical extent of the plot (or facet). Typically either **x**, **y**, or both are specified; use a [frame mark](./frame.md) to decorate the plot’s frame.

The **stroke** defaults to *none*. The **fill** defaults to *currentColor* if the stroke is *none*, and to *none* otherwise.

## cell(*data*, *options*)

```js
Plot.cell(simpsons, {x: "number_in_season", y: "season", fill: "imdb_rating"})
```

Returns a new cell with the given *data* and *options*. If neither the **x** nor **y** options are specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

## cellX(*data*, *options*)

```js
Plot.cellX(simpsons.map((d) => d.imdb_rating))
```

Equivalent to [cell](#cell-data-options), except that if the **x** option is not specified, it defaults to [0, 1, 2, …], and if the **fill** option is not specified and **stroke** is not a channel, the fill defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …].

## cellY(*data*, *options*)

```js
Plot.cellY(simpsons.map((d) => d.imdb_rating))
```

Equivalent to [cell](#cell-data-options), except that if the **y** option is not specified, it defaults to [0, 1, 2, …], and if the **fill** option is not specified and **stroke** is not a channel, the fill defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …].
