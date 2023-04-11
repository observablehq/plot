# Arrow mark

The **arrow** mark represents data as directional arrows between two points in *x* and *y* quantitative dimensions. It is similar to the [link mark](./link.md), except it draws an arrowhead and is suitable for directed edges. With the *bend* option, it can also be made swoopy. For example, below we show the rising inequality (and population) in various U.S. cities from 1980 to 2015. Each arrow represents two observations of a city: the city’s population (*x*) and inequality (*y*) in 1980, and the same in 2015. The arrow’s color redundantly encodes the change in inequality: red indicates rising inequality, while blue (there are only four) indicates declining inequality.

```js
Plot.plot({
  width,
  height: Math.min(600, width),
  grid: true,
  inset: 10,
  x: {
    type: "log",
    label: "Population →"
  },
  y: {
    label: "↑ Inequality",
    ticks: 4
  },
  color: {
    type: "diverging",
    scheme: "burd",
    label: "Change in inequality from 1980 to 2015",
    legend: true,
    ticks: 6,
    tickFormat: "+f"
  },
  marks: [
    Plot.arrow(metros, {
      x1: "POP_1980",
      y1: "R90_10_1980",
      x2: "POP_2015",
      y2: "R90_10_2015",
      bend: true,
      stroke: d => d.R90_10_2015 - d.R90_10_1980
    }),
    Plot.text(metros, {
      x: "POP_2015",
      y: "R90_10_2015",
      filter: "highlight",
      text: "nyt_display",
      fill: "currentColor",
      stroke: "white",
      dy: -6
    })
  ]
})
```
