<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const sales = [
  {units: 10, fruit: "peach"},
  {units: 20, fruit: "pear"},
  {units: 40, fruit: "plum"},
  {units: 30, fruit: "plum"}
];

const linedata = [
  {hour: 0, value: 8, sensor: "A"},
  {hour: 0, value: 6, sensor: "B"},
  {hour: 1, value: 7, sensor: "A"},
  {hour: 1, value: 5, sensor: "B"},
  {hour: 2, value: 3, sensor: "A"},
  {hour: 2, value: 0, sensor: "B"},
  {hour: 3, value: 9, sensor: "A"},
  {hour: 3, value: 2, sensor: "B"}
];

const timeseries = [
  {year: 2014, population: 7295.290765},
  {year: 2015, population: 7379.797139},
  {year: 2016, population: 7464.022049},
  {year: 2017, population: 7547.858925},
  // {year: 2018, population: 7631.091040},
  {year: 2019, population: 7713.468100},
  {year: 2020, population: 7794.798739}
];

</script>

# Marks

Plot doesn’t have chart types. Instead, it adopts a layered *grammar of graphics* in the tradition of [Jacques Bertin](https://www.esri.com/en-us/esri-press/browse/semiology-of-graphics-diagrams-networks-maps), [Leland Wilkinson](https://link.springer.com/book/10.1007/0-387-28695-0), [Hadley Wickham](https://vita.had.co.nz/papers/layered-grammar.html), and others. Here’s a crash course on Plot’s grammar of graphics.

:::tip
If you aren’t yet up-and-running with Plot, read our [quickstart guide](./getting-started.md) or try these examples [on Observable](https://observablehq.com). Tinkering with the code below will give a better sense of how Plot works.
:::

## Marks are geometric shapes

Plot provides a variety of mark types, such as [bar](./marks/bar.md), [dot](./marks/dot.md), and [line](./marks/line.md). Think of marks as the “visual vocabulary”—the painter’s palette 🎨, but of shapes instead of colors—that you pull from when composing a chart. Each mark type produces a certain type of geometric shape. For example, the dot mark draws stroked circles by default.

:::plot
```js
Plot.dotX([8, 6, 7, 5, 3, 0, 9]).plot()
```
:::

:::info
This example uses a one-dimensional dataset—an array of values—rather than the more common array-of-objects form of tabular data. By default with dotX, data is encoded via the **x** [channel](#marks-have-channels).
:::

The line mark draws connected line segments (also known as a *polyline* or *polygonal chain*).

:::plot
```js
Plot.lineY([8, 6, 7, 5, 3, 0, 9]).plot()
```
:::

:::info
Here lineY encodes data via the **y** channel, while the **x** values are implicitly 0, 1, 2, …
:::

And the bar mark draws rectangular bars in either a horizontal (barX→) or vertical (barY↑) orientation.

:::plot
```js
Plot.barX([8, 6, 7, 5, 3, 0, 9]).plot()
```
:::

So instead of looking for a chart type, consider the shape of the primary graphical elements in your chart, and look for the corresponding mark type. If a chart has only a single mark, the mark type *is* effectively the chart type: the bar mark is used to make a bar chart, the area mark is used to make an area chart, and so on.

## Marks are layered

The big advantage of mark types over chart types is that you can compose multiple marks of different types into a single chart. For example, below an area, line, and dot are used to plot the same sequence of values, while a rule emphasizes *y* = 0.

:::plot
```js
Plot.plot({
  marks: [
    Plot.ruleY([0]),
    Plot.areaY([8, 6, 7, 5, 3, 0, 9], {fillOpacity: 0.2}),
    Plot.lineY([8, 6, 7, 5, 3, 0, 9]),
    Plot.dotY([8, 6, 7, 5, 3, 0, 9], {x: (d, i) => i})
  ]
})
```
:::

Each mark supplies its own data; a quick way to combine multiple datasets into a chart is to declare a separate mark for each.

:::plot
```js
Plot.plot({
  marks: [
    Plot.ruleY([0]),
    Plot.lineY([5, 5, 5, 2, 3, 6, 8], {stroke: "red"}),
    Plot.lineY([8, 6, 7, 5, 3, 0, 9])
  ]
})
```
:::

You can even use [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) to create multiple marks from nested data.

:::plot
```js
Plot.plot({
  marks: [
    Plot.ruleY([0]),
    [
      [5, 5, 5, 2, 3, 6, 8],
      [8, 6, 7, 5, 3, 0, 9]
    ].map((numbers) => Plot.lineY(numbers))
  ]
})
```
:::

Marks are drawn in the given order, with the last mark on top.

## Marks use scales

Marks are (typically) not positioned in literal pixels, or colored in literal colors, as in a conventional graphics system. Instead you provide abstract values such as time and temperature—marks are drawn “in data space”—and [scales](./scales.md) encode these into visual values such as position and color. And best of all, Plot automatically creates axes and legends to document the scales’ encodings.

Data is passed through scales automatically during rendering; the mark controls which scales are used. The **x** and **y** options are typically bound to the *x* and *y* scales, respectively, while the **fill** and **stroke** options are typically bound to the *color* scale. Changing a scale’s definition, say by overriding its **domain** (the extent of abstract input values) or **type**, affects the appearance of all marks that use the scale.

:::plot
```js {2-6}
Plot.plot({
  y: {
    type: "sqrt",
    domain: [0, 10],
    grid: true
  },
  marks: [
    Plot.ruleY([0]),
    Plot.lineY([8, 6, 7, 5, 3, 0, 9])
  ]
})
```
:::

## Marks have tidy data

A single mark can draw multiple shapes. A mark generally produces a shape—such as a rectangle or circle—for each element in the data. So this array of seven [*x*, *y*] tuples will produce seven stroked circles when passed to Plot.dot:

:::plot
```js
Plot.dot([[0, 8], [1, 6], [2, 7], [3, 5], [4, 3], [5, 0], [6, 9]]).plot()
```
:::

It’s more complicated than that, though, since some marks produce shapes that incorporate *multiple* data points. Pass the same data to Plot.line and you’ll get a single polyline.

:::plot
```js
Plot.line([[0, 8], [1, 6], [2, 7], [3, 5], [4, 3], [5, 0], [6, 9]]).plot()
```
:::

And a line mark isn’t even guaranteed to produce a single polyline—there can be multiple polylines, as in a line chart with multiple series.

:::plot
```js
Plot.line({length: 8}, {
  x: [0, 0, 1, 1, 2, 2, 3, 3],
  y: [8, 6, 7, 5, 3, 0, 9, 2],
  stroke: ["A", "B", "A", "B", "A", "B", "A", "B"]
}).plot()
```
:::

:::info
The line mark here partitions the data into two series (*A* and *B*) because of the **stroke** channel. The first data point is *x* = 0, *y* = 8, *stroke* = *A*; the second data point is *x* = 0, *y* = 6, *stroke* = *B*; and so on.
:::

As shown above, you can pass parallel arrays of values directly to options. More commonly, you’ll use [tidy data](http://vita.had.co.nz/papers/tidy-data.html) represented as an array of objects, where each object represents an observation (a row), and each object property represents an observed value; all objects in the array should have the same property names (the columns).

For example, say the line chart above represents hourly readings from two sensors *A* and *B*. You can represent the sensor log as an array of objects like so:

```js
linedata = [
  {hour: 0, value: 8, sensor: "A"},
  {hour: 0, value: 6, sensor: "B"},
  {hour: 1, value: 7, sensor: "A"},
  {hour: 1, value: 5, sensor: "B"},
  {hour: 2, value: 3, sensor: "A"},
  {hour: 2, value: 0, sensor: "B"},
  {hour: 3, value: 9, sensor: "A"},
  {hour: 3, value: 2, sensor: "B"}
]
```

Then you can pass the data to the line mark, and extract named columns from the data for the desired options:

:::plot
```js
Plot.line(linedata, {x: "hour", y: "value", stroke: "sensor"}).plot()
```
:::

Another common way to extract a column from tabular data is an accessor function. This function is invoked for each element in the data (each row), and returns the corresponding observed value, as with [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

:::plot
```js
Plot.line(linedata, {
  x: (d) => d.hour,
  y: (d) => d.value,
  stroke: (d) => d.sensor
}).plot()
```
:::

:::tip
Note that when accessor functions are used instead of field names, the automatic axis labels (*hour* and *value*) are lost. These can be restored using the **label** option on the *x* and *y* scales.
:::

## Marks imply data types

Date comes in different types: quantitative (or temporal) values can be subtracted, ordinal values can be ordered, and nominal (or categorical) values can only be the same or different.

:::info
Because nominal values often need some arbitrary order for display purposes—often alphabetical—Plot uses the term *ordinal* to refer to both ordinal and nominal data.
:::

Some marks work with any type of data, while other marks have certain requirements or assumptions of data. For example, a line should only be used when both *x* and *y* are quantitative or temporal, and when the data is in a meaningful order (such as chronological). This is because the line mark will interpolate between adjacent points to draw line segments. If *x* or *y* is nominal—say the names of countries—it doesn’t make sense to use a line because there is no half-way point between two nominal values.

:::plot
```js
Plot.lineY(["please", "don’t", "do", "this"]).plot() // 🌶️
```
:::

:::warning
While Plot aspires to give good defaults and helpful warnings, Plot won’t prevent you from creating a meaningless chart. *Only you* can prevent bogus charts!
:::

In particular, beware the simple “bar”! A bar mark is used for a bar chart, but a rect mark is needed for a histogram. Plot has four different mark types for drawing rectangles:

- use [rect](./marks/rect.md) when both *x* and *y* are quantitative
- use [barX](./marks/bar.md) when *x* is ordinal and *y* is quantitative
- use [barY](./marks/bar.md) when *x* is quantitative and *y* is ordinal
- use [cell](./marks/cell.md) when both *x* and *y* are ordinal

Plot encourages you to think about data types as you visualize because data types often imply semantics. For example, do you notice anything strange about the bar chart below?

:::plot
```js
Plot
  .barY(timeseries, {x: "year", y: "population"}) // 🌶️
  .plot({x: {tickFormat: ""}})
```
:::

Here’s the underlying data:

```js
timeseries = [
  {year: 2014, population: 7295.290765},
  {year: 2015, population: 7379.797139},
  {year: 2016, population: 7464.022049},
  {year: 2017, population: 7547.858925},
  {year: 2019, population: 7713.468100},
  {year: 2020, population: 7794.798739}
]
```

The data is missing the population for the year 2018! Because the barY mark implies an ordinal *x* scale, the gap is hidden. Switching to the rectY mark (with the **interval** option to indicate that these are annual observations) reveals the missing data.

:::plot
```js
Plot
  .rectY(timeseries, {x: "year", y: "population", interval: 1})
  .plot({x: {tickFormat: ""}})
```
:::

Alternatively, you can keep the barY mark and apply the **interval** option to the *x* scale.

:::plot
```js
Plot
  .barY(timeseries, {x: "year", y: "population"})
  .plot({x: {tickFormat: "", interval: 1}})
```
:::

## Marks have options

When constructing a mark, you can specify options to change the mark’s appearance. These options are passed as a second argument to the mark constructor. (The first argument is the required data.) For example, if you want filled dots instead of stroked ones, pass the desired color to the **fill** option:

:::plot
```js
Plot.dotX([8, 6, 7, 5, 3, 0, 9], {fill: "red"}).plot()
```
:::

As the name suggests, options are generally optional; Plot tries to provide good defaults for whatever you don’t specify. The dotX constructor, for example, defaults **x** to the identity function. Here’s a more explicit equivalent:

:::plot
```js
Plot.dot([8, 6, 7, 5, 3, 0, 9], {x: (d) => d}).plot()
```
:::

And when you specify the **x** option for barX as shown above, you’re effectively specifying **x2** (the bar’s topline, or upper bound in *x*). The **x1** option (the bar’s baseline, or lower bound in *x*) then implicitly defaults to zero. So this…

:::plot
```js
Plot.barX({length: 7}, {
  x: [8, 6, 7, 5, 3, 0, 9],
  y: [0, 1, 2, 3, 4, 5, 6]
}).plot()
```
:::

:::info
This example uses parallel arrays, an alternative method of specifying [channels](#marks-have-channels). There are seven (7) bars in total. The first element in each array gives the **x** and **y** values for the first bar (4 and 0); the second element gives the values for the second bar (3 and 1); and so on. This is convenient here for supplying hard-coded values, but more commonly channel values are derived from data.
:::

…produces the same result as this…

:::plot
```js
Plot.barX({length: 7}, {
  y: [0, 1, 2, 3, 4, 5, 6],
  x1: [0, 0, 0, 0, 0, 0, 0],
  x2: [8, 6, 7, 5, 3, 0, 9]
}).plot()
```
:::

And as you might now imagine, you can provide a non-zero baseline for the bars as in a Gantt chart by supplying non-zero values for **x1**.

:::plot
```js
Plot.barX({length: 7}, {
  y: [0, 1, 2, 3, 4, 5, 6],
  x1: [4, 3, 4, 3, 1, 0, 4],
  x2: [8, 6, 7, 5, 3, 0, 9]
}).plot()
```
:::

:::tip
Because Plot strives to be concise, there are many default behaviors, some of which can be subtle. If Plot isn’t doing what you expect, try disabling the defaults by specifying options explicitly.
:::

Some marks even provide default [transforms](./transforms.md), say for [stacking](./transforms/stack.md)!

In addition to the standard options such as **fill** and **stroke** that are supported by all mark types, each mark type can support options unique to that type. For example, the dot mark takes a **symbol** option so you can draw things other than circles.

:::plot
```js
Plot.dotX([8, 6, 7, 5, 3, 0, 9], {symbol: "triangle"}).plot()
```
:::

:::plot
```js
Plot.dotX([8, 6, 7, 5, 3, 0, 9], {symbol: "plus"}).plot()
```
:::

See the documentation for each mark type to see what it supports.

## Marks have channels

Channels are mark options that can be used to encode data. These options allow the value to vary with the data, such as a different position or color for each dot. To use a channel, supply it with a column of data, typically as:

* a field (column) name,
* an accessor function, or
* an array of values of the same length and order as the data.

Not all mark options can be expressed as channels. For example, **stroke** can be a channel but **strokeDasharray** cannot. This is mostly a pragmatic limitation—it would be harder to implement Plot if every option were expressible as a channel—but it also serves to guide you towards options that are intended for encoding data.

:::tip
To vary the definition of a constant option with data, create multiple marks with your different constant options, and then filter the data for each mark to achieve the desired result.
:::

Some options can be either a channel or a constant depending on the provided value. For example, if you set the **fill** option to *steelblue*, Plot interprets it as a literal color.

:::plot
```js
Plot
  .barX(timeseries, {x: "population", y: "year", fill: "steelblue"})
  .plot({y: {label: null, tickFormat: ""}})
```
:::

Whereas if the **fill** option is a string but *not* a valid CSS color, Plot assumes you mean the corresponding column of the data and interprets it as a channel.

:::plot
```js
Plot
  .barX(timeseries, {x: "population", y: "year", fill: "year"})
  .plot({y: {label: null, tickFormat: ""}})
```
:::

If the **fill** option is a function, it is interpreted as a channel.

:::plot
```js
Plot
  .barX(timeseries, {x: "population", y: "year", fill: (d) => d.year})
  .plot({y: {label: null, tickFormat: ""}})
```
:::

Lastly, note that while channels are normally bound to a [scale](#marks-use-scales), you can bypass the *color* scale here by supplying literal color values to the **fill** channel.

:::plot
```js
Plot
  .barX(timeseries, {x: "population", y: "year", fill: (d) => d.year & 1 ? "red" : "currentColor"})
  .plot({y: {label: null, tickFormat: ""}})
```
:::

But rather than supplying literal values, it is more semantic to provide abstract values and use scales. In addition to centralizing the encoding definition (if used by multiple marks), it allows Plot to generate a legend.

:::plot
```js
Plot
  .barX(timeseries, {x: "population", y: "year", fill: (d) => d.year & 1 ? "odd" : "even"})
  .plot({y: {label: null, tickFormat: ""}, color: {legend: true}})
```
:::

You can then specify the *color* scale’s **domain** and **range** to control the encoding.
