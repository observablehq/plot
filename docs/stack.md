# Stack

The **stackY** transform replaces the *y* channel with *y1* and *y2* channels to form vertical “stacks” grouped on *x*. (There’s also a **stackX** transform that replaces *x* with *x1* and *x2* for horizontal stacking grouped on *y*.) For example, consider this [line](/@observablehq/plot-line?collection=@observablehq/plot) chart of Florence Nightingale’s data on deaths in the Crimean War.

```js
Plot.plot({
  y: {
    grid: true
  },
  color: {
    legend: true
  },
  marks: [
    Plot.lineY(crimea, {x: "date", y: "deaths", stroke: "cause", marker: "circle"}),
    Plot.ruleY([0])
  ]
})
```

If we visualized this data with non-stacked [areas](/@observablehq/plot-area?collection=@observablehq/plot), using the _y2_ channel instead of _y_, the areas would overlap and be hard to read even with multiply blending.

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.areaY(crimea, {x: "date", y2: "deaths", fill: "cause", mixBlendMode: "multiply"}),
    Plot.ruleY([0])
  ]
})
```

The stackY transform replaces the *y* channel with *y1* and *y2* channels such that the area series are stacked from the *y* = 0 baseline. This makes the total deaths over time easier to read, while still showing the individual causes. The stackY transform is implicitly specified if you use the areaY *y* channel.

```js
Plot.plot({
  y: {
    grid: true
  },
  marks: [
    Plot.areaY(crimea, {x: "date", y: "deaths", fill: "cause"}),
    Plot.ruleY([0])
  ]
})
```

The stack transform works with [bars](/@observablehq/plot-bar?collection=@observablehq/plot), too. (With an ordinal *x*-axis of dates, we must format the ticks manually; Plot might get smarter in the future.)

```js
Plot.plot({
  x: {
    type: "band",
    tickFormat: d => d.toLocaleString("en", {month: "narrow"}),
    label: null
  },
  marks: [
    Plot.barY(crimea, {x: "date", y: "deaths", fill: "cause"}),
    Plot.ruleY([0])
  ]
})
```

As another example, here’s a stacked area chart of unemployment by month and industry from the Bureau of Labor Statistics. (This chart has more than ten series, and hence colors are recycled; it would be better to aggregate the smaller industries into the “Other” series.)

```js
stacked.legend("color", {columns: "155px"})
```

```js
stacked = Plot.plot({
  y: {
    grid: true,
    label: "↑ Unemployed (thousands)"
  },
  marks: [
    Plot.areaY(unemployment, Plot.stackY({x: "date", y: "unemployed", fill: "industry", title: "industry"})),
    Plot.ruleY([0])
  ]
})
```

The stack transform stacks from a zero baseline by default, but this can be changed with the *offset* option. Four offset methods are supported:

* *center* - as proposed by [Havre *et al.*](https://innovis.cpsc.ucalgary.ca/innovis/uploads/Courses/InformationVisualizationDetails2009/Havre2000.pdf)
* *wiggle* - minimizing movement, as proposed by [Byron & Wattenberg](http://leebyron.com/streamgraph/stackedgraphs_byron_wattenberg.pdf)
* *normalize* - normalized to proportions in [0, 1]
* null - a zero baseline

The first two offsets are also called “streamgraphs” for their fluid appearance.

```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Unemployed (thousands)"
  },
  marks: [
    Plot.areaY(unemployment, Plot.stackY({offset: "center", x: "date", y: "unemployed", fill: "industry"}))
  ]
})
```

The stack transform provides an *order* option for reordering series. The default respects the input order. The supported orders are:

* *sum* - order series by ascending total value
* *appearance* - order series by the index of their greatest value
* *inside-out* - order series as proposed by Byron & Wattenberg
* *z* - order series naturally by key (the *z*, *fill*, or *stroke* channel)
* *value* - order values in ascending order (*y* for stackY, *x* for stackX)
* some other string - order values according to the specified field
* a function - order values according to the specified function of data
* an array - order series by key in the specified order
* null - respect input order

The *reverse* option reverses any of the above orders. The default order is input order (null), unless the *wiggle* offset is used, in which case the default order is *inside-out* to minimize movement.

```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Unemployed (thousands)"
  },
  marks: [
    Plot.areaY(unemployment, Plot.stackY({offset: "wiggle", x: "date", y: "unemployed", fill: "industry"}))
  ]
})
```

While series are often ordered consistently, as above, that isn’t a requirement: the order of series can vary across stacks! This is most apparent with the *value* order, which places the largest value on the top similar to a “ribbon” chart. (See this technique in Nadja Popovich’s [“How Does Your State Make Electricity?”](https://www.nytimes.com/interactive/2018/12/24/climate/how-electricity-generation-changed-in-your-state.html) from 2018.)

```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Unemployed (thousands)"
  },
  marks: [
    Plot.areaY(unemployment, Plot.stackY({
      x: "date",
      y: "unemployed",
      curve: "catmull-rom",
      fill: "industry",
      order: "value"
    })),
    Plot.ruleY([0])
  ]
})
```

The *appearance* order excels when each series has a prominent peak, such as the chart below of the RIAA’s U.S. revenue broken down by format. CD sales started declining well before the rise of digital, suggesting that the music industry was slow to provide a convenient digital product and hence lost substantial revenue to piracy. This chart also demonstrates how to share options across marks (the *xy* variable). The **stackY1** transform outputs the stacked *y1* channel as the *y* channel so that the baseline of each series can be stroked with white. (There are similar **stackY2**, **stackX1**, and **stackX2** transforms.)

```js
{
  const xy = {x: "year", y: "revenue", z: "format", order: "appearance", reverse: true};
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Annual revenue (billions, adj.)",
      transform: d => d / 1000
    },
    marks: [
      Plot.areaY(riaa, Plot.stackY({...xy, fill: "group", title: d => `${d.format}\n${d.group}`})),
      Plot.lineY(riaa, Plot.stackY1({...xy, stroke: "white", strokeWidth: 1})),
      Plot.ruleY([0])
    ],
    color: {legend: true}
  });
}
```

With the *expand* offset, the stack transform will compute the proportion of each series, such that each stack spans the interval [0, 1]. The *percent* scale option then multiplies these proportions by 100 to show percentages. Very little music is actually purchased these days — nearly everything is rented by way of streaming services.

```js
{
  const xy = {x: "year", y: "revenue", z: "format", order: "appearance", offset: "expand", reverse: true};
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Revenue (%)",
      percent: true
    },
    marks: [
      Plot.areaY(riaa, Plot.stackY({...xy, fill: "group", title: d => `${d.format}\n${d.group}`})),
      Plot.lineY(riaa, Plot.stackY2({...xy, stroke: "white", strokeWidth: 1})),
      Plot.ruleY([0, 1])
    ]
  });
}
```

If the null offset is used for a zero baseline, then negative values will be stacked downwards from the baseline, producing a diverging stacked chart. This is especially useful for splitting series into two categories, such as in the chart of the gender and age of U.S. congress members below. This chart uses the stackY2 transform to position [dots](/@observablehq/plot-dot?collection=@observablehq/plot).

```js
Plot.plot({
  height: 300,
  x: {
    label: "Age →",
    nice: true
  },
  y: {
    grid: true,
    label: "← Women · Men →",
    labelAnchor: "center",
    tickFormat: Math.abs
  },
  marks: [
    Plot.dot(congress, Plot.stackY2({
      x: d => 2021 - d.birth,
      y: d => d.gender === "M" ? 1 : d.gender === "F" ? -1 : 0,
      fill: "gender"
    })),
    Plot.ruleY([0])
  ]
})
```

Here is another view of the same data, faceted by every ten years of age, showing how the youngest members of congress are slightly increasing gender diversity, but with a long way still to go. (The tendency of women to live longer than men may also have an effect on the older brackets, though 90+ is a clear outlier.) The **stackX** transform also generates an *x* channel that is the midpoint of the *x1* and *x2* channels for centered labels; similarly **stackY** generates a transform for *y*, too.

```js
Plot.plot({
  height: 280,
  x: {
    percent: true
  },
  facet: {
    data: congress,
    y: d => Math.floor((2021 - d.birth) / 10) * 10
  },
  marks: [
    Plot.barX(congress, Plot.stackX(Plot.groupZ({x: "proportion-facet"}, {fill: "gender"}))),
    Plot.text(congress, Plot.stackX(Plot.groupZ({x: "proportion-facet", text: "first"}, {z: "gender", text: d => d.gender === "F" ? "Women" : d.gender === "M" ? "Men" : null}))),
    Plot.ruleX([0, 1])
  ]
})
```

One last example, perhaps slightly more upbeat, is this stacked area chart showing the rise of renewable energy generation in Iowa paired with the decline of coal.

```js
energy.legend("color")
```

```js
energy = Plot.plot({
  y: {
    grid: true,
    label: "↑ Net generation (million MWh)",
    transform: d => d / 1000
  },
  marks: [
    Plot.areaY(iowa, Plot.stackY({x: "year", y: "net_generation", fill: "source", title: "source"})),
    Plot.ruleY([0])
  ]
})
```
