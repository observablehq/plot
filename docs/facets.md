<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import anscombe from "./data/anscombe.ts";
import barley from "./data/barley.ts";
import penguins from "./data/penguins.ts";

</script>

# Facets

Faceting produces horizontal and/or vertical [small multiples](https://en.wikipedia.org/wiki/Small_multiple) by partitioning data into discrete sets and repeating the plot for each set, allowing comparison.

Faceting may either be specified at the top level of the plot or on individual marks. The mark-level **fx** and **fy** options allow marks to define facet channels. For example, we can recreate the “trellis” plot of Barley yields constructed by [Becker *et al.*](https://hci.stanford.edu/courses/cs448b/papers/becker-trellis-jcgs.pdf)

```js
barley = FileAttachment("barley.csv").csv({typed: true})
```

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

```js
anscombe = FileAttachment("anscombe.csv").csv({typed: true})
```

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
    Plot.ruleX([0]),
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

:::plot
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

```js
penguins = FileAttachment("penguins.csv").csv({typed: true})
```

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