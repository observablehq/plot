# Observable Plot

**Observable Plot** is a JavaScript library for exploratory data visualization.

## Principles

Plot tries to be **concise and memorable** for common tasks. This makes Plot easier to learn, easier to remember, and faster for exploring data. For example, given a tabular dataset *AAPL* loaded from a CSV file with columns *Date* and *Close*, here’s a line chart:

```js
Plot.Line(AAPL, "Date", "Close")
```
<img src="https://raw.githubusercontent.com/@observablehq/plot/master/img/aapl.png" width="640" height="240" alt="A line chart of the daily closing price of Apple stock, 2013–2018">

A chart created by Plot is simply a DOM element that you can put anywhere on the page.

With Plot, **all charts are interactive inputs**. A Plot chart element exposes a *value* property that represents the currently-selected data, and emits an *input* even whenever the selection changes in response to user interaction. This makes it easy to pipe the selection from one chart into another chart (or table) for coordinated views, and it works beautifully with [Observable’s reactive views](https://observablehq.com/@observablehq/introduction-to-views).

```js
const chart = Plot.Line(AAPL, "Date", "Close");
chart.oninput = () => console.log(chart.value);
```

Data in the wild (especially in JavaScript) comes in all shapes, so Plot uses a **flexible data representation**. Data can be an array of objects with named properties (as above), parallel “flat” arrays (or iterables) of values (*i.e.*, columnar data), or even values that you compute on-the-fly.

```js
Plot.Line(AAPL, d => d.Date, d => d.Close); // accessor functions
Plot.Line(null, AAPL.map(d => d.Date), AAPL.map(d => d.Close)); // columns
```

For example, here’s a line chart of random *y*-values:

```js
Plot.Line({length: 500}, Math.random)
```

And here’s a line chart with a random walk using [d3.cumsum](https://github.com/d3/d3-array/blob/master/README.md#cumsum) and [d3.randomNormal](https://github.com/d3/d3-random/blob/master/README.md#randomNormal):

```js
Plot.Line(d3.cumsum({length: 500}, d3.randomNormal()))
```

Plot provides **an extensible foundation** for visualization. While Plot includes a variety of standard chart types out of the box, it also includes lower-level APIs: Plot.Frame and Plot.Plot. These can be used directly to create one-off custom charts, or to implement new reusable mark and chart types. Plot can be extended over time by the community to make a wide variety of visualization techniques more accessible.
