<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const gods = [
  "Chaos/Gaia/Mountains",
  "Chaos/Gaia/Pontus",
  "Chaos/Gaia/Uranus",
  "Chaos/Eros",
  "Chaos/Erebus",
  "Chaos/Tartarus"
];

const energy = `/Total
/Total/Fossil Fuels
/Total/Fossil Fuels/Coal
/Total/Fossil Fuels/Natural Gas
/Total/Fossil Fuels/Crude Oil
/Total/Nuclear
/Total/Renewable
/Total/Renewable/Biomass
/Total/Renewable/Geothermal
/Total/Renewable/Hydroelectric
/Total/Renewable/Solar
/Total/Renewable/Wind`;

function indent() {
  return (root) => {
    root.eachBefore((node, i) => {
      node.y = node.depth;
      node.x = i;
    });
  };
}

</script>

# Tree transform

The **tree transform** is rarely used directly; the two variants, [treeNode](#treenode-options) and [treeLink](#treelink-options), are typically used internally by the composite [tree mark](../marks/tree.md). The tree transform arranges a tabular dataset into a hierarchy according to the given **path** channel, which is typically a slash-separated string; it then executes a tree layout algorithm to compute **x** and **y**; these channels can then be used to construct a node-link diagram.

As a contrived example, we can construct the equivalent of the tree mark using a [link](../marks/link.md), [dot](../marks/dot.md), and [text](../marks/text.md), and the corresponding tree transforms.

:::plot
```js
Plot.plot({
  axis: null,
  height: 100,
  margin: 20,
  marginRight: 120,
  marks: [
    Plot.link(gods, Plot.treeLink()),
    Plot.dot(gods, Plot.treeNode()),
    Plot.text(gods, Plot.treeNode({text: "node:name", dx: 6}))
  ]
})
```
:::

Here `gods` is an array of slash-separated paths, similar to paths in a file system. Each path represents the hierarchical position of a node in the tree.

```js-vue
gods = {{JSON.stringify(gods, null, 2)}}
```

:::tip
Given a text file, you can use `text.split("\n")` to split the contents into multiple lines.
:::

## Tree options

The following options control how the tabular data is organized into a hierarchy:

* **path** - a column specifying each node’s hierarchy location; defaults to identity
* **delimiter** - the path separator; defaults to forward slash (/)

The **path** column is typically slash-separated, as with UNIX-based file systems or URLs.

The following options control how the node-link diagram is laid out:

* **treeLayout** - a tree layout algorithm; defaults to [d3.tree](https://github.com/d3/d3-hierarchy/blob/main/README.md#tree)
* **treeAnchor** - a tree layout orientation, either *left* or *right*; defaults to *left*
* **treeSort** - a node comparator, or null to preserve input order
* **treeSeparation** - a node separation function, or null for uniform separation

The default **treeLayout** implements the Reingold–Tilford “tidy” algorithm based on Buchheim _et al._’s linear time approach. Use [d3.cluster](https://github.com/d3/d3-hierarchy/blob/main/README.md#cluster) instead to align leaf nodes; see also the [cluster mark](../marks/tree.md#cluster-data-options).

If **treeAnchor** is *left*, the root of the tree will be aligned with the left side of the frame; if **treeAnchor** is *right*, the root of the tree will be aligned with the right side of the frame; use the **insetLeft** and **insetRight** [scale options](../features/scales.md) if horizontal padding is desired, say to make room for labels.

If the **treeSort** option is not null, it is typically a function that is passed two nodes in the hierarchy and compares them, similar to [_array_.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort); see [d3-hierarchy’s _node_.sort](https://github.com/d3/d3-hierarchy/blob/main/README.md#node_sort) for more. The **treeSort** option can also be specified as a string, in which case it refers either to a named column in data, or if it starts with “node:”, a node value.

If the **treeSeparation** is not null, it is a function that is passed two nodes in the hierarchy and returns the desired (relative) amount of separation; see [d3-hierarchy’s _tree_.separation](https://github.com/d3/d3-hierarchy/blob/main/README.md#tree_separation) for more. By default, non-siblings are at least twice as far apart as siblings.

## treeNode(*options*)

Populates **x** and **y** with the positions for each node in the tree. The default **frameAnchor** inherits the **treeAnchor**. This transform is often used with the [dot](../marks/dot.md) or [text](../marks/text.md) mark.

The treeNode transform will derive output columns for any *options* that have one of the following named node values:

* *node:name* - the node’s name (the last part of its path)
* *node:path* - the node’s full, normalized, slash-separated path
* *node:internal* - true if the node is internal, or false for leaves
* *node:depth* - the distance from the node to the root
* *node:height* - the distance from the node to its deepest descendant

In addition, if any option value is specified as an object with a **node** method, a derived output column will be generated by invoking the **node** method for each node in the tree.

## treeLink(*options*)

Populates **x1**, **y1**, **x2**, and **y2** with the positions for each link in the tree, where **x1** & **y1** represents the position of the parent node and **x2** & **y2** the position of the child node. The default **curve** is *bump-x*, the default **stroke** is #555, the default **strokeWidth** is 1.5, and the default **strokeOpacity** is 0.5. This transform is often used with the [link](../marks/link.md) or [arrow](../marks/arrow.md) mark.

The treeLink transform will likewise derive output columns for any *options* that have one of the following named link values:

* *node:name* - the child node’s name (the last part of its path)
* *node:path* - the child node’s full, normalized, slash-separated path
* *node:internal* - true if the child node is internal, or false for leaves
* *node:depth* - the distance from the child node to the root
* *node:height* - the distance from the child node to its deepest descendant
* *parent:name* - the parent node’s name (the last part of its path)
* *parent:path* - the parent node’s full, normalized, slash-separated path
* *parent:depth* - the distance from the parent node to the root
* *parent:height* - the distance from the parent node to its deepest descendant

In addition, if any option value is specified as an object with a **node** method, a derived output column will be generated by invoking the **node** method for each child node in the tree; likewise if any option value is specified as an object with a **link** method, a derived output column will be generated by invoking the **link** method for each link in the tree, being passed two node arguments, the child and the parent.
