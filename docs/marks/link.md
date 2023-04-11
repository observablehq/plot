# Link mark

The **link** mark draws a straight line between two points in *x* and *y*. For example, below we show the rising inequality (and population) in various U.S. cities from 1980 to 2015. Each link represents two observations of a city: the city’s population (*x*) and inequality (*y*) in 1980, and the same in 2015. The link’s color redundantly encodes the change in inequality: red indicates rising inequality, while blue (there are only four) indicates declining inequality.

```js
Plot.plot({
  grid: true,
  inset: 10,
  x: {
    type: "log",
    label: "Population →",
    tickFormat: "~s"
  },
  y: {
    label: "↑ Inequality"
  },
  color: {
    type: "diverging",
    reverse: true
  },
  marks: [
    Plot.link(metros, {
      x1: "POP_1980",
      y1: "R90_10_1980",
      x2: "POP_2015",
      y2: "R90_10_2015",
      stroke: d => d.R90_10_2015 - d.R90_10_1980,
      markerEnd: "arrow"
    }),
    Plot.text(metros, {
      x: "POP_2015",
      y: "R90_10_2015",
      filter: "highlight",
      text: "nyt_display",
      fill: "currentColor",
      stroke: "white",
      dy: -8
    })
  ]
})
```

Like a [rule](./rule.md), a link can also serve as annotation to support interpretation. Whereas a rule is strictly horizontal or vertical, however, a link can generate [diagonal lines](http://kelsocartography.com/blog/?p=2074). The following chart depicts the gender gap in wages, segmented by education and age, in the U.S..

<!-- incdomain = d3.extent(income.flatMap(d => [d.m, d.f])) -->

```js
Plot.plot({
  height: 600,
  marginRight: 40,
  x: {
    label: "Median annual income (men, thousands) →",
    tickFormat: d => d / 1000
  },
  y: {
    label: "↑ Median annual income (women, thousands)",
    tickFormat: d => d / 1000
  },
  marks: [
    Plot.link([1], {
      x1: () => incdomain[0],
      y1: () => incdomain[0],
      x2: () => incdomain[1],
      y2: () => incdomain[1]
    }),
    Plot.link([0.6, 0.7, 0.8, 0.9], {
      x1: () => incdomain[0],
      y1: k => incdomain[0] * k,
      x2: () => incdomain[1],
      y2: k => incdomain[1] * k,
      strokeOpacity: 0.2
    }),
    Plot.text([0.6, 0.7, 0.8, 0.9, 1.0], {
      x: () => incdomain[1],
      y: k => incdomain[1] * k,
      text: d => d === 1 ? "Equal" : d3.format("+.0%")(d - 1),
      textAnchor: "start",
      dx: 6
    }),
    Plot.dot(income, {x: "m", y: "f", title: d => `${d.type}, ${d.age}`})
  ]
})
```

By contrast, a regular grid would make the gender disparity much less clear, even with the domains explicitly set to be equal.

```js
Plot.plot({
  height: 600,
  marginRight: 40,
  grid: true,
  x: {
    label: "Median annual income (men, thousands) →",
    tickFormat: d => d / 1000,
    domain: incdomain
  },
  y: {
    label: "↑ Median annual income (women, thousands)",
    tickFormat: d => d / 1000,
    domain: incdomain
  },
  marks: [
    Plot.dot(income, {x: "m", y: "f", title: d => `${d.type}, ${d.age}`})
  ]
})
```
