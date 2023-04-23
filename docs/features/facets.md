<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import anscombe from "../data/anscombe.ts";
import barley from "../data/barley.ts";
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

:::danger TODO
This guide is still under construction. 🚧 Please come back when it’s finished.
:::

Faceting produces [small multiples](https://en.wikipedia.org/wiki/Small_multiple) by partitioning data and repeating a plot for each partition, allowing comparison. Faceting is typically enabled by declaring the horizontal↔︎ facet channel **fx**, the vertical↕︎ facet channel **fy**, or both for two-dimensional faceting.

For example, using the dot’s **fy** channel to declare vertical↕︎ facets, below we recreate the Trellis display (“reminiscent of garden trelliswork”) of [Becker *et al.*](https://hci.stanford.edu/courses/cs448b/papers/becker-trellis-jcgs.pdf), showing the yields of several varieties of barley across several sites for the years <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[0]}`}">1931</span> and <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[1]}`}">1932</span>.

:::plot
```js
Plot.plot({
  height: 800,
  marginLeft: 110,
  grid: true,
  x: {nice: true},
  y: {inset: 5},
  color: {type: "categorical"},
  facet: {marginRight: 90},
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

For the Morris site, the years are likely reversed due to a data collection error: it is the only site where the yields for <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[1]}`}">1932</span> were all higher than for <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[0]}`}">1931</span>. The anomalous behavior of the Morris site is more apparent if we use directed arrows to show the year-over-year change in yield. The [group transform](../transforms/group.md) groups the observations by site and variety to compute the change.

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

Faceting requires ordinal or categorical data because there are always a discrete number of facets; the associated *fx* and *fy* scales are [band scales](./scales.md#discrete-position).

TODO Quantitative data must be manually discretized for faceting, say by rounding or binning. Quantitative data must be discretized for faceting, say by rounding or binning. This can be done through the *scale*.**transform** option on the relevant facet scale. The example below shows a box plot of athlete’s weights, faceted by height—with classes created by binning heights every 10cm.

:::plot defer
```js
Plot.plot({
  y: {
    grid: true,
    tickFormat: ".1f",
    interval: 0.1,
    reverse: true
  },
  marks: [
    Plot.boxX(olympians.filter((d) => d.height), {x: "weight", y: "height"})
  ]
})
```
:::

:::plot defer
```js
Plot.plot({
  // height: 400,
  // marginTop: 0,
  // marginLeft: 60,
  // x: {inset: 10, grid: true, label: "weight (kg) →"},
  // y: {axis: null, inset: 2},
  // color: {legend: true},
  fy: {
    transform: (d) => d ? Math.floor(d * 10) / 10 : NaN,
    // tickFormat: (d) => d.toFixed(1),
    // label: "height (m) →",
    // reverse: true
  },
  facet: {
    // data: olympians,
    // y: "height",
    // marginLeft: 60
  },
  marks: [
    Plot.frame({stroke: "#aaa", strokeWidth: 0.5}),
    Plot.boxX(olympians, {x: "weight", y: "sex", fy: "height", stroke: "sex", r: 1})
  ]
})
```
:::

:::tip
If you are interested in faceting for quantitative data, please upvote [#14](https://github.com/observablehq/plot/issues/14).
:::

TODO Two-dimensional faceting.

TODO Simulating facet wrap with a row number facet.

TODO Per-facet marks, say for annotations. You can also mix datasets with different structures, for example to add an annotation on a specific facet.

:::plot
```js
Plot.plot({
  marginLeft: 75,
  marginRight: 70,
  x: {insetRight: 10},
  y: {grid: true},
  facet: {marginRight: 70},
  marks: [
    Plot.frame(),
    Plot.barX(penguins, Plot.groupY({x: "count"}, {fy: "island", y: "species", fill: "sex"})),
    Plot.text([`Did you know? The Adelie species is the only one on Torgersen Island.`], {
      fy: ["Torgersen"],
      frameAnchor: "right",
      lineWidth: 16,
      dx: -4
    })
  ]
})
```
:::

## Mark facet options

When specified at the mark level, facets can be defined for each mark via the *mark*.**fx** or *mark*.**fy** channel options.

(See the *mark*.**facet** option below for more).

And here is the equivalent mark-level faceting:

```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "sex", fy: "island"})
  ]
})
```

When mark-level faceting is used, the *fx* and *fy* channels are computed prior to the [mark’s transform](./transforms.md), if any (*i.e.*, facet channels are not transformed).

Faceting can be explicitly enabled or disabled on a mark with the *mark*.**facet** option, which accepts the following values:

* *auto* (default) - automatically determine if this mark should be faceted
* *include* (or true) - draw the subset of the mark’s data in the current facet
* *exclude* - draw the subset of the mark’s data *not* in the current facet
* *super* - draw this mark in a single frame that covers all facets
* null (or false) - repeat this mark’s data across all facets (*i.e.*, no faceting)

When a mark uses *super* faceting, it is not allowed to use position scales (*x*, *y*, *fx*, or *fy*); *super* faceting is intended for decorations, such as labels and legends.

When mark-level faceting is used, the default *auto* setting is equivalent to *include*: the mark will be faceted if either the *mark*.**fx** or *mark*.**fy** channel option (or both) is specified. The null or false option will disable faceting, while *exclude* draws the subset of the mark’s data *not* in the current facet.

The **facetAnchor** option controls the placement of the mark with respect to the facets. It supports the following settings:

* null - display the mark on each non-empty facet (default for all marks, with the exception of axis marks)
* *top*, *right*, *bottom*, or *left* - display the mark on facets on the specified side
* *top-empty*, *right-empty*, *bottom-empty*, or *left-empty* - display the mark on facets that have an empty space on the specified side (the empty space being either the margin, or an empty facet); this is the default for axis marks
* *empty* - display the mark on empty facets only

When using top-level faceting, if your data is parallel to the facet data (*i.e.*, the same length and order) but not strictly equal (`===`), you can enable faceting by specifying the *mark*.**facet** option to *include* (or equivalently true). Likewise you can disable faceting by setting the *mark*.**facet** option to null or false. Finally, the mark.**facet** option supports the _exclude_ option to select all data points that are _not_ part of the current facet, allowing “background” marks for context.

When top-level faceting is used, the default *auto* setting is equivalent to *include* when the mark data is strictly equal to the top-level facet data; otherwise it is equivalent to null. When the *include* or *exclude* facet mode is chosen, the mark data must be parallel to the top-level facet data: the data must have the same length and order. If the data are not parallel, then the wrong data may be shown in each facet. The default *auto* therefore requires strict equality (`===`) for safety, and using the facet data as mark data is recommended when using the *exclude* facet mode. (To construct parallel data safely, consider using [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) on the facet data.)

:::plot
```js
Plot.plot({
  height: 600,
  grid: true,
  facet: {
    data: penguins,
    x: "sex",
    y: "species",
    marginRight: 80
  },
  marks: [
    Plot.frame(),
    Plot.dot(penguins, {
      x: "culmen_depth_mm",
      y: "culmen_length_mm",
      r: 1.5,
      fill: "#ccc",
      facet: "exclude"
    }),
    Plot.dot(penguins, {
      x: "culmen_depth_mm",
      y: "culmen_length_mm"
    })
  ]
})
```
:::

## Plot facet options

The top-level **facet** option is an alternative to the mark **fx** and **fy** option and is useful when multiple marks share the same data; the facet.**x** and facet.**y** channels are then shared by all marks that use the facet data. (Other marks will be repeated across facets.)

For example, we can visualize the famous [Anscombe’s quartet](https://en.wikipedia.org/wiki/Anscombe's_quartet) as a scatterplot with horizontal facets.

:::plot
```js
Plot.plot({
  grid: true,
  inset: 10,
  width: 928,
  height: 240,
  facet: {
    data: anscombe,
    x: "series"
  },
  marks: [
    Plot.frame(),
    Plot.line(anscombe, {x: "x", y: "y", stroke: "#ccc"}),
    Plot.dot(anscombe, {x: "x", y: "y", stroke: "currentColor", fill: "white"})
  ]
})
```
:::

Here is an example of top-level faceting:

```js
Plot.plot({
  facet: {
    data: penguins,
    x: "sex",
    y: "island"
  },
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```

When specified at the top level, the following options indicate which data should be faceted, and how:

* facet.**data** - the data to be faceted
* facet.**x** - the horizontal position; bound to the *fx* scale, which must be *band*
* facet.**y** - the vertical position; bound to the *fy* scale, which must be *band*

With top-level faceting, any mark that uses the specified facet data will be faceted by default, whereas marks that use different data will be repeated across all facets.

To make room for the facet axes, you may need to specify the facet.**marginTop**, facet.**marginRight**, facet.**marginBottom**, or facet.**marginLeft** option.

The following top-level facet constant options are also supported:

* facet.**marginTop** - the top margin
* facet.**marginRight** - the right margin
* facet.**marginBottom** - the bottom margin
* facet.**marginLeft** - the left margin
* facet.**margin** - shorthand for the four margins
* facet.**grid** - if true, draw grid lines for each facet
* facet.**label** - if null, disable default facet axis labels

## Facet scales

When faceting, two additional band scales may be configured:

* *fx* - the horizontal position, a *band* scale
* *fy* - the vertical position, a *band* scale

When faceting, two additional band scales may be configured: _fx_ and _fy_. These are driven by the facet.**x** and facet.**y** channels, respectively, which must be supplied strictly ordinal (*i.e.*, discrete) values; each distinct value defines a facet.
