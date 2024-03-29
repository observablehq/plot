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

# Tree mark <VersionBadge version="0.4.3" />

The **tree mark** produces tree diagrams using the [tree transform](../transforms/tree.md). It is a [composite mark](../features/marks.md#marks), consisting of a [link](./link.md) to render links from parent to child, an optional [dot](./dot.md) for nodes, and one or two [text](./text.md) for node labels. The link mark uses the [treeLink transform](../transforms/tree.md#treeLink), while the dot and text marks use the [treeNode transform](../transforms/tree.md#treeNode).

For example, here is a little family tree of Greek gods.

:::plot https://observablehq.com/@observablehq/plot-tree-and-link
```js
Plot.plot({
  axis: null,
  height: 100,
  margin: 10,
  marginLeft: 40,
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
  marginLeft: 30,
  marginRight: 160,
  width: 688,
  height: 1800,
  marks: [
    Plot.tree(flare, {path: "name", delimiter: ".", textStroke: "var(--vp-c-bg)"})
  ]
})
```
:::

The **treeLayout** option specifies the layout algorithm. The tree mark uses the Reingold–Tilford “tidy” tree algorithm, [d3.tree](https://d3js.org/d3-hierarchy/tree), by default. The [cluster](#cluster) convenience method sets **treeLayout** to [d3.cluster](https://d3js.org/d3-hierarchy/cluster), aligning the leaf nodes.

:::plot https://observablehq.com/@observablehq/plot-cluster-flare
```js
Plot.plot({
  axis: null,
  margin: 10,
  marginLeft: 30,
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

The tree mark currently does not inform the default layout; you may find it necessary to set the **height** and **margin** [layout options](../features/plots.md#layout-options) for readability.

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
* **textLayout** - the text anchoring layout
* **dx** - the text horizontal offset; defaults to 6
* **dy** - the text vertical offset; defaults to 0

Any additional *options* are passed through to the constituent link, dot, and text marks and their corresponding treeLink or treeNode transform.

The **textLayout** option <VersionBadge version="0.6.9" /> controls how text labels are anchored to the node. Two layouts are supported:

* *mirrored* - leaf-node labels are left-anchored, and non-leaf nodes right-anchored
* *normal* - all labels are left-anchored

If the **treeLayout** is d3.tree or d3.cluster, the **textLayout** defaults to *mirrored*; otherwise it defaults to *normal*.

## tree(*data*, *options*) {#tree}

```js
Plot.tree(flare, {path: "name", delimiter: "."})
```

Returns a new tree mark with the given *data* and *options*.

## cluster(*data*, *options*) {#cluster}

```js
Plot.cluster(flare, {path: "name", delimiter: "."})
```

Like [tree](#tree), except sets the **treeLayout** option to [d3.cluster](https://d3js.org/d3-hierarchy/cluster), aligning leaf nodes, and defaults the **textLayout** option to *mirrored*.
