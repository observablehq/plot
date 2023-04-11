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
