<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import bls from "./data/bls.ts";

</script>

# Transforms

Transforms provide a convenient mechanism for deriving data while plotting. All marks support the following basic transforms:

* [filter](./transforms/filter.md)
* [sort](./transforms/sort.md)
* [reverse](./transforms/sort.md#plotreverseoptions)

The basic transforms are composable: the *filter* transform is applied first, then *sort*, *reverse*, and lastly the custom *transform*, if any.

For greater control, you can also implement a custom **transform** function. This function takes *data* and *facets* as arguments and returns the same, where *data* is the associated mark’s data and *facets* is an array of indexes into that data. If the mark is not faceted, then *facets* will contain a single facet representing the entire data: [0, 1, … *data*.length - 1].

:::plot
```js{16-23}
Plot.plot({
  y: {
    grid: true,
    label: "↑ Unemployment (%)"
  },
  color: {
    domain: [false, true],
    range: ["#ccc", "red"]
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(bls, {
      x: "date",
      y: "unemployment",
      z: "division",
      transform: (data, facets) => ({
        data,
        facets: facets.map((facet) => {
          return facet.filter((i) => {
            return /, MI /.test(data[i].division);
          });
        })
      })
    })
  ]
})
```
:::

Plot’s option transforms, listed below, do more than populate the **transform** function: they derive new mark options and channels. These transforms take a mark’s *options* object (and possibly transform-specific options as the first argument) and return a new, transformed, *options*. Option transforms are composable: you can pass an *options* objects through more than one transform before passing it to a mark. You can also reuse the same transformed *options* on multiple marks.

Plot’s built-in options transforms are:

* [group](./transforms/group.md) - group ordinal data and derive summary statistics, *e.g.* counts
* [bin](./transforms/bin.md) - bin quantitative data and derive summary statistics, *e.g.* counts
* [stack](./transforms/stack.md) - stack series, *e.g.* convert *y* to *y1* and *y2*
* [map](./transforms/map.md) - map values per series, *e.g.* for a cumulative sum
* [window](./transforms/window.md) - map values per windowed series, *e.g.* for a rolling average
* [select](./transforms/select.md) - extract a value per series, *e.g.* the last value
* [interval](./transforms/interval.md) - convert a single value to an interval [start, stop]
* [dodge](./transforms/dodge.md) - lift points from a one-dimensional layout to prevent occlusion
* [hexbin](./transforms/hexbin.md) - aggregate two-dimensional points into discrete hexagonal bins

When working with custom transforms, keep in mind that every transform needs to be compatible with the faceting system, which partitions the original dataset into discrete subsets.
