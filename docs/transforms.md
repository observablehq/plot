<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import PlotRender from "./components/PlotRender.js";
import alphabet from "./data/alphabet.ts";
import metros from "./data/metros.ts";
import bls from "./data/bls.ts";

</script>

# Transforms

Transforms provide a convenient mechanism for deriving data while plotting. All marks support the following basic transforms:

* **filter** - filters data according to the specified accessor or values
* **sort** - sorts data according to the specified comparator, accessor, or values
* **reverse** - reverses the sorted (or if not sorted, the input) data order

For example, to take the toy bar chart of English letter frequency and only draw bars for letters that commonly form vowels:

:::plot
```js{4}
Plot.plot({
  marks: [
    Plot.barY(alphabet, {
      filter: (d) => /[aeiou]/i.test(d.letter),
      x: "letter",
      y: "frequency"
    })
  ]
})
```
:::

The **filter** transform is similar to filtering the data with [*array*.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), except that it will preserve [faceting](/facets) and will not affect inferred [scale domains](/scales); domains are inferred from the unfiltered channel values.

:::plot
```js{4}
Plot.plot({
  marks: [
    Plot.barY(
      alphabet.filter((d) => /[aeiou]/i.test(d.letter)),
      {x: "letter", y: "frequency"}
    )
  ]
})
```
:::

Here’s another example using a filter transform to control which text labels are displayed in a dense scatterplot.

:::plot
```js{10}
Plot.plot({
  grid: true,
  x: {type: "log"},
  marks: [
    Plot.dot(metros, {
      x: "POP_2015",
      y: "R90_10_2015"
    }),
    Plot.text(metros, {
      filter: "highlight",
      x: "POP_2015",
      y: "R90_10_2015",
      text: "nyt_display",
      frameAnchor: "bottom",
      dy: -6
    })
  ]
})
```
:::

Together the **sort** and **reverse** transforms allow control over *z*-order, which can be important when addressing overplotting. If the sort option is a function but does not take exactly one argument, it is assumed to be a [comparator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description); otherwise, the sort option is interpreted as a channel value definition and thus may be either a column name, accessor function, or array of values.

:::plot
```js
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
      sort: (d) => /, MI /.test(d.division),
      stroke: (d) => /, MI /.test(d.division)
    })
  ]
})
```
:::

The basic transforms are composable: the *filter* transform is applied first, then *sort*, *reverse*, and lastly the custom *transform*, if any.

For greater control, you can also implement a custom **transform** function. This function takes *data* and *facets* as arguments and returns the same, where *data* is the associated mark’s data and *facets* is an array of indexes into that data. If the mark is not faceted, then *facets* will contain a single facet representing the entire data: [0, 1, … *data*.length - 1].

```js
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
      transform: customTransform
    })
  ]
})
```

```js
function customTransform(data, facets) {
  return {
    data,
    facets: facets.map(facet => {
      return facet.filter(i => {
        return /, MI /.test(data[i].division);
      });
    })
  };
}
```

Plot’s option transforms, listed below, do more than populate the **transform** function: they derive new mark options and channels. These transforms take a mark’s *options* object (and possibly transform-specific options as the first argument) and return a new, transformed, *options*. Option transforms are composable: you can pass an *options* objects through more than one transform before passing it to a mark. You can also reuse the same transformed *options* on multiple marks.

Plot’s built-in options transforms are:

* [group](/@observablehq/plot-group?collection=@observablehq/plot) - group ordinal data and derive summary statistics, *e.g.* counts
* [bin](/@observablehq/plot-bin?collection=@observablehq/plot) - bin quantitative data and derive summary statistics, *e.g.* counts
* [stack](/@observablehq/plot-stack?collection=@observablehq/plot) - stack series, *e.g.* convert *y* to *y1* and *y2*
* [map](/@observablehq/plot-map?collection=@observablehq/plot) - map values per series, *e.g.* for a cumulative sum
* [window](/@observablehq/plot-window?collection=@observablehq/plot) - map values per windowed series, *e.g.* for a rolling average
* [select](/@observablehq/plot-select?collection=@observablehq/plot) - extract a value per series, *e.g.* the last value
* [interval](/@observablehq/plot-interval?collection=@observablehq/plot) - convert a single value to an interval [start, stop]
* [dodge](/@observablehq/plot-dodge?collection=@observablehq/plot) - lift points from a one-dimensional layout to prevent occlusion
* [hexbin](/@observablehq/plot-hexbin?collection=@observablehq/plot) - aggregate two-dimensional points into discrete hexagonal bins

When working with custom transforms, keep in mind that every transform needs to be compatible with the faceting system, which partitions the original dataset into discrete subsets.
