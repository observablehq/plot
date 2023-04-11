# Interval transform

The interval transform turns a discrete *value* into an interval [*start*, *stop*]. For example, if *value* is an instant in time, the interval transform could return a *start* of UTC midnight and a *stop* of the UTC midnight the following day. The interval transform is most commonly used for “bar” charts of temporal data, where you in fact want [rects](../marks/rect.md) rather than [bars](../marks/bar.md) because time is continuous, not discrete.

Consider for example the bar chart below of the trade volume of Apple stock. Because bars are used, *x* is ordinal. And because the regularity of ordinal values is not specified (*i.e.*, because Plot has no way of knowing that this is daily data), every distinct value must have its own label, leading to crowding. If a day were missing data, it would be difficult to spot.

```js
Plot.plot({
  marginBottom: 80,
  x: {
    tickRotate: -90,
    label: null
  },
  y: {
    grid: true,
    transform: d => d / 1e6,
    label: "↑ Daily trade volume (millions)"
  },
  marks: [
    Plot.barY(aapl, {x: "Date", y: "Volume"}),
    Plot.ruleY([0])
  ]
})
```

In contrast, a rect with the interval transform and the [d3.utcDay time interval](https://github.com/d3/d3-time) produces a temporal *x*. This allows Plot to compute ticks at meaningful intervals (here weekly boundaries, UTC midnight on Sundays). Furthermore, we can see that this isn’t truly daily data—it’s missing weekends and holidays when the stock market was closed.

```js
Plot.plot({
  y: {
    grid: true,
    transform: d => d / 1e6,
    label: "↑ Daily trade volume (millions)"
  },
  marks: [
    Plot.rectY(aapl, {x: "Date", interval: d3.utcDay, y: "Volume"}),
    Plot.ruleY([0])
  ]
})
```

While the interval transform is used most commonly with a D3 time interval, any object that implements a floor and offset method will work. For example, below is a custom interval that extends Friday through the weekend. An interval can also be specified as a number *n*, in which case *x1* and *x2* are taken as the two consecutive multiples of *n* that bracket *x*.

<!-- customInterval = d3.utcDay.filter(d => d.getUTCDay() !== 0 && d.getUTCDay() !== 6) -->

<!-- value = new Date -->

<!-- interval = [
  customInterval.floor(value), // start
  customInterval.offset(customInterval.floor(value)) // stop
] -->

```js
Plot.plot({
  y: {
    grid: true,
    transform: d => d / 1e6,
    label: "↑ Daily trade volume (millions)"
  },
  marks: [
    Plot.rectY(aapl, {x: "Date", interval: customInterval, y: "Volume"}),
    Plot.ruleY([0])
  ]
})
```

While rare, the interval transform can also be used with barY to convert a discrete *y* value into an interval [*y1*, *y2*], and similarly with barX to convert *x* to [*x1*, *x2*].

```js
Plot.plot({
  marginBottom: 80,
  x: {
    tickRotate: -90,
    label: null
  },
  y: {
    grid: true,
    transform: d => d / 1e6,
    label: "↑ Daily trade volume (millions)"
  },
  marks: [
    Plot.barY(aapl, {x: "Date", y: "Volume", interval: 1e7}),
    Plot.ruleY([0])
  ]
})
```

The interval transform is not a standalone transform, but a builtin option with the [rect](../marks/rect.md), [bar](../marks/bar.md), and [rule](../marks/rule.md) marks.
