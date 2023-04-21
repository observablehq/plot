<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";

const flare = shallowRef([{name: "empty"}]);

const gods = [
  "Chaos/Gaia/Mountains",
  "Chaos/Gaia/Pontus",
  "Chaos/Gaia/Uranus",
  "Chaos/Eros",
  "Chaos/Erebus",
  "Chaos/Tartarus"
];

onMounted(() => {
  d3.csv("../data/flare.csv", d3.autoType).then((data) => (flare.value = data));
});

function indent() {
  return (root) => {
    root.eachBefore((node, i) => {
      node.y = node.depth;
      node.x = i;
    });
  };
}

</script>

# Tree mark

The **tree mark** produces tree diagrams using the [tree transform](../transforms/tree.md). It is a [composite mark](../features/marks.md#marks-marks), consisting of a [link](./link.md) to render links from parent to child, an optional [dot](./dot.md) for nodes, and a [text](./text.md) for node labels. The link mark uses the [treeLink transform](../transforms/tree.md#treelink-options), while the dot and text marks use the [treeNode transform](../transforms/tree.md#treenode-options).

For example, here is a little family tree of Greek gods.

:::plot https://observablehq.com/@observablehq/plot-tree-and-link
```js
Plot.plot({
  axis: null,
  height: 100,
  margin: 20,
  marginRight: 120,
  marks: [
    Plot.tree(gods, {textStroke: "var(--vp-c-bg)"})
  ]
})
```
:::

Here `gods` is an array of slash-separated paths, similar to paths in a file system. Each path represents the hierarchical position of a node in the tree.

```js-vue
gods = {{JSON.stringify(gods, null, 2)}}
```

As a more complete example, here is a visualization of a software package hierarchy.

:::plot defer https://observablehq.com/@observablehq/plot-tree-flare
```js
Plot.plot({
  axis: null,
  margin: 10,
  marginRight: 160,
  width: 688,
  height: 1800,
  marks: [
    Plot.tree(flare, {path: "name", delimiter: ".", textStroke: "var(--vp-c-bg)"})
  ]
})
```
:::

The **treeLayout** option specifies the layout algorithm. The tree mark uses the Reingold–Tilford “tidy” tree algorithm, [d3.tree](https://github.com/d3/d3-hierarchy/blob/main/README.md#tree), by default. The [cluster](#cluster-data-options) convenience method sets **treeLayout** to [d3.cluster](https://github.com/d3/d3-hierarchy/blob/main/README.md#cluster), aligning the leaf nodes.

:::plot https://observablehq.com/@observablehq/plot-cluster-flare
```js
Plot.plot({
  axis: null,
  margin: 10,
  marginRight: 160,
  width: 688,
  height: 2400,
  marks: [
    Plot.cluster(flare, {path: "name", treeSort: "node:height", delimiter: ".", textStroke: "var(--vp-c-bg)"})
  ]
})
```
:::

Here is an example of a custom **treeLayout** implementation, assigning *node*.x and *node*.y.

```js
function indent() {
  return (root) => {
    root.eachBefore((node, i) => {
      node.y = node.depth;
      node.x = i;
    });
  };
}
```

This produces an indented tree layout.

:::plot defer https://observablehq.com/@observablehq/plot-custom-tree-layout
```js
Plot.plot({
  axis: null,
  inset: 10,
  insetRight: 120,
  round: true,
  width: 200,
  height: 3600,
  marks: Plot.tree(flare, {
    path: "name",
    delimiter: ".",
    treeLayout: indent,
    strokeWidth: 1,
    curve: "step-before",
    textStroke: "none"
  })
})
```
:::

The tree mark currently does not inform the default layout; you may find it necessary to set the **height** and **margin** [layout options](../features/plots.md#layout) for readability.

## Tree options

The following options are supported:

* **fill** - the dot and text fill color; defaults to *node:internal*
* **stroke** - the link stroke color; inherits **fill** by default
* **strokeWidth** - the link stroke width
* **strokeOpacity** - the link stroke opacity
* **strokeLinejoin** - the link stroke linejoin
* **strokeLinecap** - the link stroke linecap
* **strokeMiterlimit** - the link stroke miter limit
* **strokeDasharray** - the link stroke dash array
* **strokeDashoffset** - the link stroke dash offset
* **marker** - the link start and end marker
* **markerStart** - the link start marker
* **markerEnd** - the link end marker
* **dot** - if true, whether to render a dot; defaults to false if no link marker
* **title** - the text and dot title; defaults to *node:path*
* **text** - the text label; defaults to *node:name*
* **textStroke** - the text stroke; defaults to *white*
* **dx** - the text horizontal offset; defaults to 6 if left-anchored, or -6 if right-anchored
* **dy** - the text vertical offset; defaults to 0

Any additional *options* are passed through to the constituent link, dot, and text marks and their corresponding treeLink or treeNode transform.

## tree(*data*, *options*)

```js
Plot.tree(flare, {path: "name", delimiter: "."})
```

Returns a new tree mark with the given *data* and *options*.

## cluster(*data*, *options*)

```js
Plot.cluster(flare, {path: "name", delimiter: "."})
```

Like [tree](#tree-data-options), except sets the **treeLayout** option to [d3.cluster](https://github.com/d3/d3-hierarchy/blob/main/README.md#cluster), aligning leaf nodes.
