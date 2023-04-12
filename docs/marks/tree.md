# Tree mark

A quick demo of Plot.tree, added in [Plot 0.4.3](https://github.com/observablehq/plot/blob/main/CHANGELOG.md#043).

```js
Plot.plot({
  axis: null,
  inset: 10,
  insetLeft: 10,
  insetRight: 160,
  width: 1152,
  height: 1800,
  marks: [
    Plot.tree(flare, {path: "name", delimiter: "."})
  ]
})
```

```js
Plot.plot({
  axis: null,
  inset: 10,
  insetLeft: 10,
  insetRight: 160,
  width: 1152,
  height: 1300,
  facet: {
    data: flare,
    x: d => d.value >= 5000
  },
  marks: [
    Plot.tree(flare, {path: "name", treeSort: "node:name", delimiter: "."})
  ]
})
```

```js
Plot.plot({
  axis: null,
  inset: 10,
  insetLeft: 10,
  insetRight: 160,
  width: 1152,
  height: 2400,
  marks: [
    Plot.cluster(flare, {path: "name", treeSort: "node:height", delimiter: "."})
  ]
})
```

## Tree options

## tree(*data*, *options*)

A convenience compound mark for rendering a tree diagram, including a [link](#link) to render links from parent to child, an optional [dot](#dot) for nodes, and a [text](#text) for node labels. The link mark uses the [treeLink transform](#plottreelinkoptions), while the dot and text marks use the [treeNode transform](#plottreenodeoptions). The following options are supported:

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

## cluster(*data*, *options*)

Like [Plot.tree](#plottreedata-options), except sets the **treeLayout** option to D3’s cluster (dendrogram) algorithm, which aligns leaf nodes.
