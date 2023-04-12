# Box mark

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

## Box options

Draws either horizontal boxplots where *x* is quantitative and *y* is ordinal (if present) or vertical boxplots where *y* is quantitative and *x* is ordinal (if present). Boxplots are often used to visualize one-dimensional distributions as an alternative to a histogram. (See also the [bin transform](#bin).)

The box mark is a composite mark consisting of four marks:

* a [rule](#rule) representing the extreme values (not including outliers)
* a [bar](#bar) representing the interquartile range (trimmed to the data)
* a [tick](#tick) representing the median value, and
* a [dot](#dot) representing outliers, if any

The given *options* are passed through to these underlying marks, with the exception of the following options:

* **fill** - the fill color of the bar; defaults to gray
* **fillOpacity** - the fill opacity of the bar; defaults to 1
* **stroke** - the stroke color of the rule, tick, and dot; defaults to *currentColor*
* **strokeOpacity** - the stroke opacity of the rule, tick, and dot; defaults to 1
* **strokeWidth** - the stroke width of the tick; defaults to 1

## boxX(*data*, *options*)

```js
Plot.boxX(simpsons.map(d => d.imdb_rating))
```

Returns a horizontal boxplot mark. If the **x** option is not specified, it defaults to the identity function, as when *data* is an array of numbers. If the **y** option is not specified, it defaults to null; if the **y** option is specified, it should represent an ordinal (discrete) value.

## boxY(*data*, *options*)

```js
Plot.boxY(simpsons.map(d => d.imdb_rating))
```

Returns a vertical boxplot mark. If the **y** option is not specified, it defaults to the identity function, as when *data* is an array of numbers. If the **x** option is not specified, it defaults to null; if the **x** option is specified, it should represent an ordinal (discrete) value.
