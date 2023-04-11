# Cell mark

The **cell** mark is positioned in *x*, *y*, or both, where *x* and *y* are ordinal (or categorical) rather than quantitative. Hence, the plot’s *x* and *y* scales are [band scales](../scales.md). Cells typically also have a *fill* color encoding. For example, the heatmap below shows the decline of *The Simpsons* after Season 9: high ratings are dark green, while low ratings are dark pink. (The worst episode ever — cue Comic Book Guy — is season 23’s [“Lisa Goes Gaga”](https://en.wikipedia.org/wiki/Lisa_Goes_Gaga) featuring Lady Gaga.)

```js
Plot.plot({
  height: 640,
  padding: 0.05,
  grid: true,
  x: {
    axis: "top",
    label: "Season"
  },
  y: {
    label: "Episode"
  },
  color: {
    type: "linear",
    scheme: "PiYG"
  },
  marks: [
    Plot.cell(simpsons, {
      x: "season",
      y: "number_in_season",
      fill: "imdb_rating",
      // rx: 20 // uncomment for circles
    }),
    Plot.text(simpsons, {
      x: "season",
      y: "number_in_season",
      text: d => d.imdb_rating?.toFixed(1),
      title: "title"
    })
  ]
})
```

With [faceting](../facets.md), we can produce a calendar of multiple years, where *x* represents weeks and *y* represents days. Below shows almost twenty years of daily changes of the Dow Jones Industrial Average.

```js
Plot.plot({
  height: 1400,
  x: {
    axis: null,
    padding: 0,
  },
  y: {
    padding: 0,
    tickFormat: Plot.formatWeekday("en", "narrow"),
    tickSize: 0
  },
  fy: {
    reverse: true
  },
  color: {
    type: "diverging",
    scheme: "PiYG"
  },
  marks: [
    Plot.cell(DJI, {
      x: d => d3.utcWeek.count(d3.utcYear(d.Date), d.Date),
      y: d => d.Date.getUTCDay(),
      fy: d => d.Date.getUTCFullYear(),
      fill: (d, i) => i > 0 ? (d.Close - DJI[i - 1].Close) / DJI[i - 1].Close : NaN,
      title: (d, i) => i > 0 ? ((d.Close - DJI[i - 1].Close) / DJI[i - 1].Close * 100).toFixed(1) : NaN,
      inset: 0.5
    })
  ]
})
```

The cell mark can be combined with the [group transform](../transforms/group.md), which groups data by ordinal value. (The [bin transform](../transforms/bin.md), on the other hand, is intended for use with the [rect mark](./rect.md).) The heatmap below shows the maximum observed temperature by month (*y*) and date (*x*) in Seattle from 2012 through 2015.

```js
Plot.plot({
  height: 300,
  padding: 0,
  y: {
    tickFormat: Plot.formatMonth("en", "short")
  },
  marks: [
    Plot.cell(seattle, Plot.group({fill: "max"}, {
      x: d => d.date.getUTCDate(),
      y: d => d.date.getUTCMonth(),
      fill: "temp_max",
      inset: 0.5
    }))
  ]
})
```

A one-dimensional cell is produced by specifying only *x* or only *y*. The plot below collapses the history of *The Simpsons* to a single line. Note that the *x*-ticks must be specified explicitly to avoid occlusion: by default, every cell would have its own tick.

```js
Plot.plot({
  x: {
    round: false,
    ticks: simpsons.filter(d => d.number_in_season === 1).map(d => d.id),
    tickFormat: i => simpsons.find(d => d.id === i).season,
    label: "Season →",
    labelAnchor: "right"
  },
  color: {
    type: "linear",
    scheme: "PiYG"
  },
  marks: [
    Plot.cell(simpsons, {x: "id", fill: "imdb_rating"})
  ]
})
```

One-dimensional cells can be a compact alternative to a bar chart, where the *fill* color of the cell replaces the length of the bar. However, position is a more salient encoding and should be preferred to color if space is available.

```js
Plot.plot({
  x: {
    label: null
  },
  color: {
    scheme: "YlGnBu"
  },
  marks: [
    Plot.cell(alphabet, {x: "letter", fill: "frequency"})
  ]
})
```

When a cell’s position represents a time period, such as a year, consider using a [bar](./bar.md) instead of a cell. A cell is used below, but we must be careful to specify the *x*-domain explicitly; otherwise we might not notice missing years as ordinal domains are inferred from the set of distinct input values. Bars also have the advantage of accurately representing time periods of varying length, such as months.

```js
hadcrut = (await FileAttachment("hadcrut-annual.txt").text())
  .trim().split(/\n/g) // split into lines
  .map(line => line.split(/\s+/g)) // split each line into fields
  .map(([year, anomaly]) => ({ // extract the year and median anomaly
    year: +year, // convert to number
    anomaly: +anomaly // convert to number
  }))
```

```js
Plot.plot({
  x: {
    round: false,
    ticks: d3.ticks(...d3.extent(hadcrut, d => d.year), 10),
    domain: d3.range(d3.min(hadcrut, d => d.year), d3.max(hadcrut, d => d.year) + 1),
    label: null
  },
  color: {
    type: "diverging",
    scheme: "BuRd"
  },
  marks: [
    Plot.cell(hadcrut, {x: "year", fill: "anomaly"})
  ]
})
```
