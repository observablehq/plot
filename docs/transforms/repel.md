<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref} from "vue";
import cancer from "../data/cancer.ts";

const minDistance = ref(11);

const points = (() => {
  const random = d3.randomLcg(42);
  const data = [];
  const points = [];
  let step;
  for (step = 0; step < 31; ++step) {
    data.push(random());
    points.push(...data.map((y, node) => ({step, y, node})));
  }
  points.push(...data.map((y, node) => ({step, y, node})));
  return points;
})();
</script>

# Repel transform <VersionBadge pr="1957" />

Given a position dimension (either **x** or **y**), the **repel** transform rearranges the values along that dimension in such a way that the distance between nodes is greater than or equal to the minimum distance, and their visual order preserved. The [repelX transform](#repelX) rearranges the **x** (horizontal) position of each series of nodes sharing a common **y** (vertical) position; likewise the [repelY transform](#repelY) rearranges nodes vertically.

The repel transform is commonly used to prevent superposition of labels on line charts. The example below, per [Edward Tufte](https://www.edwardtufte.com/bboard/q-and-a-fetch-msg?msg_id=0003nk), represents estimates of survival rates per type of cancer after 5, 10, 15 and 20 years. Each data point is labelled with its actual value (rounded to the unit). Labels in the last column indicate the type.

:::plot
```js
Plot.plot({
  width: 400,
  height: 600,
  marginRight: 60,
  marginBottom: 20,
  x: {
    axis: "top",
    domain: ["5 Year", "10 Year", "15 Year", "20 Year"],
    label: null,
    padding: 0
  },
  y: { axis: null, insetTop: 20 },
  marks: [
    Plot.line(cancer, {x: "year", y: "survival", z: "name", strokeWidth: 1}),
    Plot.text(cancer, Plot.repelY(
      Plot.group({
        text:"first"
      }, {
        text: "survival",
        x: "year",
        y: "survival",
        textAnchor: "end",
        dx: 5,
        fontVariant: "tabular-nums",
        stroke: "var(--plot-background)",
        strokeWidth: 7,
        fill: "currentColor"
      })
    )),
    Plot.text(cancer, Plot.repelY({
      filter: d => d.year === "20 Year",
      text: "name",
      textAnchor: "start",
      frameAnchor: "right",
      dx: 10,
      y: "survival"
    }))
  ],
  caption: "Estimates of survival rate (%), per type of cancer"
})
```

Without this transform, some of these labels would otherwise be masking each other. (Note the use of the [group](group.md) transform so that, when several labels share an identical position and text contents, only the first one is retained—and the others filtered out; for example, value 62 in the first column.)

The **minDistance** option is a constant indicating the minimum distance between nodes, in pixels. It defaults to 11, about the height of a line of text with the default font size. (If zero, the transform is not applied.)

The chart below shows how the positions are transformed as we repeatedly inject nodes into a collection at a random vertical position, and apply the repelY transform at each step (horizontal axis). Adjust the range slider below to see how the positions change with the minimum distance option:

<p>
  <label class="label-input">
    minDistance:
    <input type="range" v-model.number="minDistance" min="0" max="30" step="0.1">
    <span style="font-variant-numeric: tabular-nums;">{{minDistance.toLocaleString("en-US")}}</span>
  </label>
</p>

:::plot
```js
Plot.plot({
  y: {axis: null, inset: 25},
  color: {type: "categorical"},
  marks: [
    Plot.line(points, Plot.repelY(minDistance, {
      x: "step",
      stroke: "node",
      y: "y",
      curve: "basis",
      strokeWidth: 1
    })),
    Plot.dot(points, Plot.repelY(minDistance, {
      x: "step",
      fill: "node",
      r: (d) => d.step === d.node,
      y: "y"
    })),
  ]
})
```
:::

The repel transform differs from the [dodge transform](./dodge.md) in that it only adjusts the nodes’ existing positions.

The repel transform can be used with any mark that supports **x** and **y** position.

## Repel options

The repel transforms accept the following option:

* **minDistance** — the number of pixels separating the nodes’ positions

## repelY(*repelOptions*, *options*) {#repelY}

```js
Plot.repelY(minDistance, {x: "date", y: "value"})
```

Given marks arranged along the *y* axis, the repelY transform adjusts their vertical positions in such a way that two nodes are separated by at least *minDistance* pixels, avoiding overlapping. The order of the nodes is preserved. The *x* position channel, if present, is used to determine series on which the transform is applied, and left unchanged.

## repelX(*repelOptions*, *options*) {#repelX}

```js
Plot.repelX({x: "value"})
```

Equivalent to Plot.repelY, but arranging the marks horizontally by returning an updated *x* position channel that avoids overlapping. The *y* position channel, if present, is used to determine series and left unchanged.
