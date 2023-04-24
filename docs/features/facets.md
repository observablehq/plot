<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import anscombe from "../data/anscombe.ts";
import barley from "../data/barley.ts";
import industries from "../data/bls-industry-unemployment.ts";
import penguins from "../data/penguins.ts";

const olympians = shallowRef([
  {weight: 31, height: 1.21, sex: "female"},
  {weight: 170, height: 2.21, sex: "male"}
]);

onMounted(() => {
  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
});

</script>

# Facets

Faceting partitions data by ordinal or categorical value and then repeats a plot for each partition (each **facet**), producing [small multiples](https://en.wikipedia.org/wiki/Small_multiple) for comparison. Faceting is typically enabled by declaring the horizontal↔︎ facet channel **fx**, the vertical↕︎ facet channel **fy**, or both for two-dimensional faceting.

For example, below we recreate the Trellis display (“reminiscent of garden trelliswork”) of [Becker *et al.*](https://hci.stanford.edu/courses/cs448b/papers/becker-trellis-jcgs.pdf) using the dot’s **fy** channel to declare vertical↕︎ facets, showing the yields of several varieties of barley across several sites for the years <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[0]}`}">1931</span> and <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[1]}`}">1932</span>.

:::plot
```js
Plot.plot({
  height: 800,
  marginRight: 90,
  marginLeft: 110,
  grid: true,
  x: {nice: true},
  y: {inset: 5},
  color: {type: "categorical"},
  marks: [
    Plot.frame(),
    Plot.dot(barley, {
      x: "yield",
      y: "variety",
      fy: "site",
      stroke: "year",
      sort: {y: "x", fy: "x", reduce: "median", reverse: true}
    })
  ]
})
```
:::

:::tip
This plot uses the [**sort** mark option](./scales.md#sort-option) to order the *y* and *fy* scale domains by descending median yield (the associated *x* values). Without this option, the domains would be sorted alphabetically.
:::

:::tip
Use the [frame mark](../marks/frame.md) for stronger visual separation of facets.
:::

The chart above reveals a likely data collection error: the years appear to be reversed for the Morris site as it is the only site where the yields in <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[1]}`}">1932</span> were higher than in <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[0]}`}">1931</span>. The anomaly in Morris is more obvious if we use directed arrows to show the year-over-year change. The [group transform](../transforms/group.md) groups the observations by site and variety to compute the change.

:::plot defer
```js
Plot.plot({
  height: 800,
  marginLeft: 110,
  grid: true,
  x: {nice: true},
  y: {inset: 5},
  color: {scheme: "spectral", label: "Change in yield", tickFormat: "+f", legend: true},
  facet: {marginRight: 90},
  marks: [
    Plot.frame(),
    Plot.arrow(barley, Plot.groupY({
      x1: "first",
      x2: "last",
      stroke: ([x1, x2]) => x2 - x1 // year-over-year difference
    }, {
      x: "yield",
      y: "variety",
      fy: "site",
      stroke: "yield",
      strokeWidth: 2,
      sort: {y: "x1", fy: "x1", reduce: "median", reverse: true}
    }))
  ]
})
```
:::

:::info
Here the sort order has changed slightly: the *y* and *fy* domains are sorted by the median **x1** values, which are the yields for 1931.
:::

Faceting requires ordinal or categorical data because there are a discrete number of facets; the associated *fx* and *fy* scales are [band scales](./scales.md#discrete-position). Quantitative or temporal data can be made ordinal by binning, say using [Math.floor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor). Or, use the [**interval** scale option](../transforms/interval.md) on the *fx* or *fy* scale. Below, we produce a [box plot](../marks/box.md) of the weights (in kilograms) of Olympic athletes, faceted by height binned at a 10cm (0.1 meter) interval.

:::plot defer
```js
Plot.plot({
  fy: {
    grid: true,
    tickFormat: ".1f",
    interval: 0.1, // 10cm
    reverse: true
  },
  marks: [
    Plot.boxX(olympians.filter((d) => d.height), {x: "weight", fy: "height"})
  ]
})
```
:::

:::tip
If you are interested in automatic faceting for quantitative data, please upvote [#14](https://github.com/observablehq/plot/issues/14).
:::

When both **fx** and **fy** channels are specified, two-dimensional faceting results, as in the faceted scatterplot of penguin culmen measurements below. The horizontal↔︎ facet shows sex (with the rightmost column representing penguins whose *sex* field is null, indicating missing data), while the vertical↕︎ facet shows species.

:::plot defer
```js
Plot.plot({
  grid: true,
  marginRight: 60,
  facet: {label: null},
  marks: [
    Plot.frame(),
    Plot.dot(penguins, {
      x: "culmen_length_mm",
      y: "culmen_depth_mm",
      fx: "sex",
      fy: "species"
    })
  ]
})
```
:::

You can mix-and-match faceted and non-faceted marks within the same plot. The non-faceted marks will be repeated across all facets. This is useful for decoration marks, such as a [frame](../marks/frame.md), and also for context: below, the entire population of penguins is repeated in each facet as small gray dots, making it easier to see how each facet compares to the whole.

:::plot defer
```js
Plot.plot({
  grid: true,
  marginRight: 60,
  facet: {label: null},
  marks: [
    Plot.frame(),
    Plot.dot(penguins, {
      x: "culmen_length_mm",
      y: "culmen_depth_mm",
      fill: "#aaa",
      r: 1
    }),
    Plot.dot(penguins, {
      x: "culmen_length_mm",
      y: "culmen_depth_mm",
      fx: "sex",
      fy: "species"
    })
  ]
})
```
:::

:::tip
Set the [**facet** mark option](#mark-facet-options) to *exclude* to draw only the dots *not* in the current facet.
:::

When there are many facets, facets may be small and hard to read; you may need to increase the plot’s **width** or **height**. Alternatively, you can wrap facets by computing a row and column number as **fy** and **fx**. Below, small multiples of varying unemployment counts across industries are shown in a three-column display.

:::plot defer https://observablehq.com/@observablehq/plot-facet-wrap
```js
Plot.plot((() => {
  const n = 3; // number of facet columns
  const keys = Array.from(d3.union(industries.map((d) => d.industry)));
  const index = new Map(keys.map((key, i) => [key, i]));
  const fx = (key) => index.get(key) % n;
  const fy = (key) => Math.floor(index.get(key) / n);
  return {
    height: 300,
    axis: null,
    y: {insetTop: 10},
    fx: {padding: 0.03},
    marks: [
      Plot.areaY(industries, Plot.normalizeY("extent", {
        x: "date",
        y: "unemployed",
        fx: (d) => fx(d.industry),
        fy: (d) => fy(d.industry)
      })),
      Plot.text(keys, {fx, fy, frameAnchor: "top-left", dx: 6, dy: 6}),
      Plot.frame()
    ]
  };
})())
```
:::

:::tip
If you are interested in automatic facet wrapping, please upvote [#277](https://github.com/observablehq/plot/issues/277).
:::

:::info
This example uses an [immediately-invoked function expression (IIFE)](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) to declare local variables.
:::

The above chart also demonstrates faceted annotations, using a [text mark](../marks/text.md) to label the facet in lieu of facet axes. Below, we apply a single text annotation to the *Adelie* facet by setting the **fy** channel to a single-element array parallel to the data.

:::plot defer
```js
Plot.plot({
  marginLeft: 60,
  marginRight: 60,
  grid: true,
  y: {label: null},
  fy: {label: null},
  color: {legend: true},
  marks: [
    Plot.barX(penguins, Plot.groupY({x: "count"}, {fy: "species", y: "island", fill: "sex"})),
    Plot.text([`While Chinstrap and Gentoo penguins were each observed on only one island, Adelie penguins were observed on all three islands.`], {
      fy: ["Adelie"],
      frameAnchor: "top-right",
      lineWidth: 18,
      dx: -6,
      dy: 6
    }),
    Plot.frame()
  ]
})
```
:::

## Mark facet options

Facets can be defined for each mark via the **fx** or **fy** channels. The **fx** and **fy** channels are computed prior to the [mark’s transform](./transforms.md), if any (*i.e.*, facet channels are not transformed). Alternatively, the [**facet** plot option](#plot-facet-options) allows top-level faceting based on data.

Faceting can be explicitly enabled or disabled on a mark with the **facet** option, which accepts the following values:

* *auto* (default) - automatically determine if this mark should be faceted
* *include* (or true) - draw the subset of the mark’s data in the current facet
* *exclude* - draw the subset of the mark’s data *not* in the current facet
* *super* - draw this mark in a single frame that covers all facets
* null (or false) - repeat this mark’s data across all facets (*i.e.*, no faceting)

When mark-level faceting is used, the default *auto* setting is equivalent to *include*: the mark will be faceted if either the **fx** or **fy** channel option (or both) is specified. The null or false option will disable faceting, while *exclude* draws the subset of the mark’s data *not* in the current facet. When a mark uses *super* faceting, it is not allowed to use position scales (*x*, *y*, *fx*, or *fy*); *super* faceting is intended for decorations, such as labels and legends.


The **facetAnchor** option controls the placement of the mark with respect to the facets. Based on the value, the mark will be displayed on:

* null - non-empty facets
* *top*, *right*, *bottom*, or *left* - the given side
* *top-empty*, *right-empty*, *bottom-empty*, or *left-empty* - adjacent empty facet or side
* *empty* - empty facets

The **facetAnchor** option defaults to null for all marks except axis marks, whose default depends on the axis orientation and associated scale.

When using top-level faceting, if the mark data is parallel to the facet data (*i.e.*, it has the same length and order), but is not strictly equal (`===`), you can enable faceting by specifying the **facet** option to *include* (or equivalently true). Likewise you can disable faceting by setting the **facet** option to null or false. Finally, the **facet** option supports the _exclude_ option to select all data points that are _not_ part of the current facet, allowing “background” marks for context.

When top-level faceting is used, the default *auto* setting is equivalent to *include* when the mark data is strictly equal to the top-level facet data; otherwise it is equivalent to null. When the *include* or *exclude* facet mode is chosen, the mark data must be parallel to the top-level facet data: the data must have the same length and order. If the data are not parallel, then the wrong data may be shown in each facet. The default *auto* therefore requires strict equality (`===`) for safety, and using the facet data as mark data is recommended when using the *exclude* facet mode. (To construct parallel data safely, consider using [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) on the facet data.)

## Plot facet options

The **facet** plot option provides addition control over facet position scales and axes:

* **marginTop** - the top margin
* **marginRight** - the right margin
* **marginBottom** - the bottom margin
* **marginLeft** - the left margin
* **margin** - shorthand for the four margins
* **grid** - if true, draw grid lines for each facet
* **label** - if null, disable default facet axis labels

The **facet** margin options behave largely the same as the margin [plot options](./plots.md); the only difference is the positioning of the associated scale label for the *x* and *y* scales. Likewise, the **grid** and **label** options have the same meaning as the plot options, except the facet options only apply to the *fx* and *fy* scales.

The **facet** plot option is also an alternative to the **fx** and **fy** mark options. It is useful when multiple marks share the same data; the **x** and **y** facet channels are then shared by all marks that use the facet data. (Other marks will be repeated across facets.) For example, we can visualize the famous [Anscombe’s quartet](https://en.wikipedia.org/wiki/Anscombe's_quartet) as a scatterplot with horizontal facets.

:::plot
```js
Plot.plot({
  grid: true,
  aspectRatio: 0.5,
  facet: {data: anscombe, x: "series"},
  marks: [
    Plot.frame(),
    Plot.line(anscombe, {x: "x", y: "y"}),
    Plot.dot(anscombe, {x: "x", y: "y"})
  ]
})
```
:::

For top-level faceting, these **facet** options determine the facets:

* **data** - the data to be faceted
* **x** - the horizontal↔︎ position; bound to the *fx* scale
* **y** - the vertical↕︎ position; bound to the *fy* scale

With top-level faceting, any mark that uses the specified facet data will be faceted by default, whereas marks that use different data will be repeated across all facets. Use the mark **facet** option to change the behavior.

## Facet scales

When faceting, two additional [band scales](./scales.md#discrete-position) may be configured:

* *fx* - the horizontal↔︎ position, a *band* scale
* *fy* - the vertical↕︎ position, a *band* scale

You can adjust the space between facets using the **padding**, **round**, and **align** scale options.
