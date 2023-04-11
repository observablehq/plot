# Box

The box mark creates a horizontal or vertical boxplot, a type of visual summary for one-dimensional distributions. The box mark is implemented as a composite mark: it is an array of marks consisting of a [rule](./rule.md) to represent the extreme values (not including outliers), a [bar](./bar.md) to represent the interquartile range (trimmed to the data), a [tick](./tick.md) to represent the median value, and a [dot](./dot.md) to represent outliers, if any. The box mark uses the [group transform](../transforms/group.md) to group and aggregate data.

```js
Plot.plot({
  y: {
    grid: true,
    inset: 6
  },
  marks: [
    Plot.boxY(morley, {x: "Expt", y: "Speed"})
  ]
})
```

```js
Plot.plot({
  x: {
    grid: true,
    inset: 6
  },
  marks: [
    Plot.boxX(morley, {x: "Speed", y: "Expt"})
  ]
})
```

Plot.boxY groups by *x*, if present, while Plot.boxX groups by *y*, if present. If not present, a single box is generated. As [shorthand](../shorthand.md), you can pass an array of numbers to Plot.boxX or Plot.boxY.

```js
Plot.boxX([0, 3, 4.4, 4.5, 4.6, 5, 7]).plot()
```
