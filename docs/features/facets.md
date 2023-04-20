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

Faceting produces horizontal and/or vertical [small multiples](https://en.wikipedia.org/wiki/Small_multiple) by partitioning data into discrete sets and repeating the plot for each set, allowing comparison.

Faceting may either be specified at the top level of the plot or on individual marks. The mark-level **fx** and **fy** options allow marks to define facet channels. For example, we can recreate the “trellis” plot of Barley yields constructed by [Becker *et al.*](https://hci.stanford.edu/courses/cs448b/papers/becker-trellis-jcgs.pdf)

:::plot
```js
Plot.plot({
  height: 800,
  marginLeft: 110,
  grid: true,
  x: {nice: true},
  y: {inset: 5},
  color: {type: "categorical"},
  facet: {data: barley, y: "site", marginRight: 90},
  marks: [
    Plot.frame(),
    Plot.dot(barley, {
      x: "yield",
      y: "variety",
      stroke: "year",
      sort: {
        y: {value: "x", reduce: "median", reverse: true},
        fy: {value: "x", reduce: "median", reverse: true}
      }
    })
  ]
})
```
:::

The plot above uses the mark **sort** option to order the points within each subplot (the *y* domain) and likewise to order the facets (the *fy* domain). In both cases the domains are ordered by descending median yield (the *x* value). As with all ordinal scales in Plot, if the domain is not specified explicitly, it defaults to the union of values in natural order—merging mark-level and top-level facet channels.

The top-level **facet** option is an alternative to the mark **fx** and **fy** option and is useful when multiple marks share the same data; the facet.**x** and facet.**y** channels are then shared by all marks that use the facet data. (Other marks will be repeated across facets.) For example, we can visualize the famous [Anscombe’s quartet](https://en.wikipedia.org/wiki/Anscombe's_quartet) as a scatterplot with horizontal facets.

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

You can also mix datasets with different structures, for example to add an annotation on a specific facet.

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

To make room for the facet axes, you may need to specify the facet.**marginTop**, facet.**marginRight**, facet.**marginBottom**, or facet.**marginLeft** option.

When faceting, two additional band scales may be configured: _fx_ and _fy_. These are driven by the facet.**x** and facet.**y** channels, respectively, which must be supplied strictly ordinal (*i.e.*, discrete) values; each distinct value defines a facet. Quantitative data must be discretized for faceting, say by rounding or binning. This can be done through the *scale*.**transform** option on the relevant facet scale. The example below shows a box plot of athlete’s weights, faceted by height—with classes created by binning heights every 10cm.

:::plot defer
```js
Plot.plot({
  height: 400,
  marginTop: 0,
  marginLeft: 50,
  x: {inset: 10, grid: true, label: "weight (kg) →"},
  y: {axis: null, inset: 2},
  color: {legend: true},
  fy: {
    transform: (d) => d ? Math.floor(d * 10) / 10 : "",
    tickFormat: (d) => d ? d.toFixed(1) : "N/A",
    label: "height (m) →",
    reverse: true
  },
  facet: {
    data: olympians,
    y: "height",
    marginLeft: 50
  },
  marks: [
    Plot.frame({stroke: "#aaa", strokeWidth: 0.5}),
    Plot.boxX(olympians, {x: "weight", y: "sex", stroke: "sex", r: 1})
  ]
})
```
:::

When using top-level faceting, if your data is parallel to the facet data (*i.e.*, the same length and order) but not strictly equal (`===`), you can enable faceting by specifying the *mark*.**facet** option to *include* (or equivalently true). Likewise you can disable faceting by setting the *mark*.**facet** option to null or false. Finally, the mark.**facet** option supports the _exclude_ option to select all data points that are _not_ part of the current facet, allowing “background” marks for context.

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

Note that empty facets are not rendered.

## Facet options

Plot’s [faceting system](https://observablehq.com/@observablehq/plot-facets) produces small multiples by partitioning data in discrete sets and repeating the plot for each set. When faceting, two additional band scales may be configured:

* *fx* - the horizontal position, a *band* scale
* *fy* - the vertical position, a *band* scale

Faceting may either be specified at the top level of the plot or on individual marks. When specified at the top level, the following options indicate which data should be faceted, and how:

* facet.**data** - the data to be faceted
* facet.**x** - the horizontal position; bound to the *fx* scale, which must be *band*
* facet.**y** - the vertical position; bound to the *fy* scale, which must be *band*

With top-level faceting, any mark that uses the specified facet data will be faceted by default, whereas marks that use different data will be repeated across all facets. (See the *mark*.**facet** option below for more). When specified at the mark level, facets can be defined for each mark via the *mark*.**fx** or *mark*.**fy** channel options.

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

And here is the equivalent mark-level faceting:

```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "sex", fy: "island"})
  ]
})
```

Regardless of whether top- or mark-level faceting is used, the *fx* and *fy* channels are strictly ordinal or categorical (*i.e.*, discrete); each distinct channel value defines a facet. Quantitative data must be manually discretized for faceting, say by rounding or binning. (Automatic binning for quantitative data may be added in the future; see [#14](https://github.com/observablehq/plot/issues/14).) When mark-level faceting is used, the *fx* and *fy* channels are computed prior to the [mark’s transform](./transforms.md), if any (*i.e.*, facet channels are not transformed).

The following top-level facet constant options are also supported:

* facet.**marginTop** - the top margin
* facet.**marginRight** - the right margin
* facet.**marginBottom** - the bottom margin
* facet.**marginLeft** - the left margin
* facet.**margin** - shorthand for the four margins
* facet.**grid** - if true, draw grid lines for each facet
* facet.**label** - if null, disable default facet axis labels

Faceting can be explicitly enabled or disabled on a mark with the *mark*.**facet** option, which accepts the following values:

* *auto* (default) - automatically determine if this mark should be faceted
* *include* (or true) - draw the subset of the mark’s data in the current facet
* *exclude* - draw the subset of the mark’s data *not* in the current facet
* *super* - draw this mark in a single frame that covers all facets
* null (or false) - repeat this mark’s data across all facets (*i.e.*, no faceting)

When a mark uses *super* faceting, it is not allowed to use position scales (*x*, *y*, *fx*, or *fy*); *super* faceting is intended for decorations, such as labels and legends.

When top-level faceting is used, the default *auto* setting is equivalent to *include* when the mark data is strictly equal to the top-level facet data; otherwise it is equivalent to null. When the *include* or *exclude* facet mode is chosen, the mark data must be parallel to the top-level facet data: the data must have the same length and order. If the data are not parallel, then the wrong data may be shown in each facet. The default *auto* therefore requires strict equality (`===`) for safety, and using the facet data as mark data is recommended when using the *exclude* facet mode. (To construct parallel data safely, consider using [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) on the facet data.)

When mark-level faceting is used, the default *auto* setting is equivalent to *include*: the mark will be faceted if either the *mark*.**fx** or *mark*.**fy** channel option (or both) is specified. The null or false option will disable faceting, while *exclude* draws the subset of the mark’s data *not* in the current facet.

The <a name="facetanchor">*mark*.**facetAnchor**</a> option controls the placement of the mark with respect to the facets. It supports the following settings:

* null - display the mark on each non-empty facet (default for all marks, with the exception of axis marks)
* *top*, *right*, *bottom*, or *left* - display the mark on facets on the specified side
* *top-empty*, *right-empty*, *bottom-empty*, or *left-empty* - display the mark on facets that have an empty space on the specified side (the empty space being either the margin, or an empty facet); this is the default for axis marks
* *empty* - display the mark on empty facets only
