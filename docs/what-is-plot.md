<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";

const olympians = shallowRef([
  {weight: 31, height: 1.21, sex: "female"},
  {weight: 170, height: 2.21, sex: "male"}
]);

onMounted(() => {
  d3.csv("./data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
});

</script>

# What is Plot?

**Observable Plot** is a free, open-source, vanilla JavaScript library for visualizing tabular data, focused on accelerating exploratory data analysis. It has a concise, memorable, yet expressive API, featuring [scales](./features/scales.md) and [layered marks](./features/marks.md) in the grammar of graphics style. And there are [plenty of examples](https://observablehq.com/@observablehq/plot-gallery) to learn from and copy-paste.

In the spirit of *show don’t tell*, here’s a scatterplot of body measurements of athletes from the [2016 Summer Olympics](https://flother.is/2017/olympic-games-data/).

:::plot defer
```js
Plot
  .dot(olympians, {x: "weight", y: "height", stroke: "sex"})
  .plot({color: {legend: true}})
```
:::

A plot specification assigns columns of data (*weight*, *height*, and *sex*) to visual properties of marks (**x**, **y**, and **stroke**). Plot does the rest! You can configure much more, if needed, but Plot’s goal is to help you get a meaningful visualization quickly to accelerate analysis.

This scatterplot suffers from overplotting: many dots are drawn in the same spot, so it’s hard to perceive density. We can fix this by applying a [bin transform](./transforms/bin.md) to group athletes of similar height and weight (and sex), and then use opacity to encode the number of athletes in the bin.

:::plot defer
```js
Plot.rect(olympians, Plot.bin({fillOpacity: "count"}, {x: "weight", y: "height", fill: "sex", inset: 0})).plot()
```
:::

Or we could try the [density mark](./marks/density.md).

:::plot defer
```js
Plot.density(olympians, {x: "weight", y: "height", stroke: "sex"}).plot()
```
:::

A simpler take on this data is to focus on one dimension: weight. We can use the bin transform again to make a histogram with weight on the *x*-axis and frequency on the *y*-axis. This plot uses a [rect mark](./marks/rect.md) and an implicit [stack transform](./transforms/stack.md).

:::plot defer
```js
Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", fill: "sex"})).plot()
```
:::

Or if we’d prefer to show the two distributions separately as small multiples, we can [facet](./features/facets.md) the data along *y* (keeping the *fill* encoding for consistency, and adding grid lines and a rule at *y* = 0 to improve readability).

:::plot defer
```js
Plot.plot({
  grid: true,
  marks: [
    Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", fill: "sex", fy: "sex"})),
    Plot.ruleY([0])
  ]
})
```
:::
