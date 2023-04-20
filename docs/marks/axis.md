<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref} from "vue";
import aapl from "../data/aapl.ts";
import alphabet from "../data/alphabet.ts";
import penguins from "../data/penguins.ts";

const anchor = ref("bottom");
const facetAnchor = ref("auto");

const responses = [
  {name: "Family in feud with Zucker­bergs", value: 0.17},
  {name: "Committed 671 birthdays to memory", value: 0.19},
  {name: "Ex is doing too well", value: 0.10},
  {name: "High school friends all dead now", value: 0.15},
  {name: "Discovered how to “like” things mentally", value: 0.27},
  {name: "Not enough politics", value: 0.12}
];

</script>

# Axis mark

The **axis mark** conveys the meaning of a position [scale](../features/scales.md): _x_ or _y_, and _fx_ or _fy_ when [faceting](../features/facets.md). Plot automatically adds default axis marks as needed, but you can customize the appearance of axes either through scale options or by explicitly declaring an axis mark.

For example, the **axis** scale option specifies the side of the frame to draw the axis. Setting it to *both* will repeat the axis on both sides.

:::plot https://observablehq.com/@observablehq/plot-axis-both
```js
Plot.plot({
  x: {percent: true, grid: true, axis: "both"},
  marks: [
    Plot.barX(alphabet, {x: "frequency", y: "letter"}),
    Plot.ruleX([0])
  ]
})
```
:::

The above is equivalent to declaring two explicit axis marks, one with the *top* **anchor** and the other with the *bottom* **anchor**, and one explicit [grid mark](./grid.md). A benefit of declaring explicit axes is that you can draw them atop other marks.

:::plot https://observablehq.com/@observablehq/plot-axis-both
```js
Plot.plot({
  x: {percent: true},
  marks: [
    Plot.axisX({anchor: "top"}),
    Plot.axisX({anchor: "bottom", label: null}),
    Plot.barX(alphabet, {x: "frequency", y: "letter"}),
    Plot.gridX({interval: 1, stroke: "var(--vp-c-bg)", strokeOpacity: 0.5}),
    Plot.ruleX([0])
  ]
})
```
:::

:::info
The **interval** option above instructs the grid lines to be drawn at unit intervals, _i.e._ whole percentages. As an alternative, you can use the **ticks** option to specify the desired number of ticks or the **tickSpacing** option to specify the desired separation between adjacent ticks in pixels.
:::

If you don’t declare an axis mark for a position scale, Plot will implicitly add one for you below (before) all other marks. To disable an implicit axis, set the _scale_.**axis** option to null for the corresponding scale; or, set the top-level **axis** option to null to disable all implicit axes.

Plot’s axis mark is a composite mark comprised of:

* a [vector](./vector.md) for ticks
* a [text](./text.md) for tick labels
* a [text](./text.md) for an axis label

As such, you can take advantage of the full capabilities of these marks. For example, you can use the text mark’s **lineWidth** option to wrap long tick labels (and even soft hyphens). Note this option is expressed in ems, not pixels, and you may have to reserve additional **marginBottom** to make room for multiple lines.

:::plot https://observablehq.com/@observablehq/plot-wrap-tick-labels
```js
Plot.plot({
  y: {percent: true},
  marks: [
    Plot.axisX({label: null, lineWidth: 8, marginBottom: 40}),
    Plot.axisY({label: "↑ Responses (%)"}),
    Plot.barY(responses, {x: "name", y: "value"}),
    Plot.ruleY([0])
  ]
})
```
:::

Or, you can use the **textAnchor** option to extend the *y*-axis tick labels to the right and into the frame, and the **fill** option to specify the color of the text.

:::plot https://observablehq.com/@observablehq/plot-anchor-tick-labels
```js
Plot.plot({
  marginTop: 0,
  marginLeft: 4,
  x: {ticks: 4, label: "Yield (kg) →"},
  marks: [
    Plot.barX([42, 17, 32], {y: ["🍌 banana", "🍎 apple", "🍐 pear"]}),
    Plot.axisY({textAnchor: "start", fill: "var(--vp-c-bg)", dx: 14})
  ]
})
```
:::

Layering several marks makes it possible to create [ggplot2-style axes](https://ggplot2.tidyverse.org/reference/guide_axis.html) with a filled [frame](./frame.md) and white grid lines.

:::plot https://observablehq.com/@observablehq/plot-ggplot2-style-axes
```js
Plot.plot({
  inset: 10,
  marks: [
    Plot.frame({fill: "#eaeaea"}),
    Plot.gridY({stroke: "white", strokeOpacity: 1}),
    Plot.gridX({stroke: "white", strokeOpacity: 1}),
    Plot.line(aapl, {x: "Date", y: "Close", stroke: "black"})
  ]
})
```
:::

Or you could emulate the style of *The New York Times*, with tick labels above dashed grid lines, and a custom tick format to show units (here dollars) on the first tick.

:::plot https://observablehq.com/@observablehq/plot-nyt-style-axes
```js
Plot.plot({
  round: true,
  marginLeft: 0, // don’t need left-margin since labels are inset
  x: {label: null, insetLeft: 36}, // reserve space for inset labels
  marks: [
    Plot.gridY({
      strokeDasharray: "0.75,2", // dashed
      strokeOpacity: 1 // opaque
    }),
    Plot.axisY({
      tickSize: 0, // don’t draw ticks
      dx: 38, // offset right
      dy: -6, // offset up
      lineAnchor: "bottom", // draw labels above grid lines
      tickFormat: (d, i, _) => (i === _.length - 1 ? `$${d}` : d)
    }),
    Plot.ruleY([0]),
    Plot.line(aapl, {x: "Date", y: "Close", markerEnd: "dot"})
  ]
})
```
:::

You can emulate [Datawrapper’s time axes](https://blog.datawrapper.de/new-axis-ticks/) using `\n` (the line feed character) for multi-line tick labels, plus a bit of date math to detect the first month of each year.

:::plot https://observablehq.com/@observablehq/plot-datawrapper-style-date-axis
```js
Plot.plot({
  marks: [
    Plot.ruleY([0]),
    Plot.line(aapl, {x: "Date", y: "Close"}),
    Plot.gridX(),
    Plot.axisX({
      ticks: 20,
      tickFormat: (
        (formatYear, formatMonth) => (x) =>
          x.getUTCMonth() === 0
            ? `${formatMonth(x)}\n${formatYear(x)}`
            : formatMonth(x)
      )(d3.utcFormat("%Y"), d3.utcFormat("%b"))
    })
  ]
})
```
:::

:::tip
In the future, Plot may generate multi-line time axis labels by default. If you’re interested in this feature, please upvote [#1285](https://github.com/observablehq/plot/issues/1285).
:::

Alternatively, you can add multiple axes with options for hierarchical time intervals, here showing weeks, months, and years.

:::plot https://observablehq.com/@observablehq/plot-multiscale-date-axis
```js
Plot.plot({
  x: {round: true, nice: d3.utcWeek},
  y: {inset: 6},
  marks: [
    Plot.frame({fill: "currentColor", fillOpacity: 0.1}),
    Plot.frame({anchor: "bottom"}),
    Plot.axisX({ticks: "year", tickSize: 28, tickPadding: -11, tickFormat: "  %Y", textAnchor: "start"}),
    Plot.axisX({ticks: "month", tickSize: 16, tickPadding: -11, tickFormat: "  %b", textAnchor: "start"}),
    Plot.gridX({ticks: "week", stroke: "var(--vp-c-bg)", strokeOpacity: 1, insetBottom: -0.5}),
    Plot.line(aapl.slice(-340, -10), {x: "Date", y: "Close", curve: "step"})
  ]
})
```
:::

You can even style an axis dynamically based on data! The data associated with an axis or grid mark are the tick values sampled from the associated scale’s domain. If you don’t specify the data explicitly, the ticks will be chosen through a combination of the **ticks**, **tickSpacing**, and **interval** options.

:::plot https://observablehq.com/@observablehq/plot-data-based-axis
```js
Plot.plot({
  marginRight: 0,
  marks: [
    Plot.ruleY([0]),
    Plot.line(aapl, {x: "Date", y: "Close"}),
    Plot.gridY({x: (y) => aapl.find((d) => d.Close >= y)?.Date, insetLeft: -6}),
    Plot.axisY({x: (y) => aapl.find((d) => d.Close >= y)?.Date, insetLeft: -6, textStroke: "var(--vp-c-bg)"})
  ]
})
```
:::

The color of an axis can be controlled with the **color**, **stroke**, and **fill** options, which affect the axis’ component marks differently. The **stroke** option affects the tick vector; the **fill** option affects the label texts. The **color** option is shorthand for setting both **fill** and **stroke**. While these options are typically set to constant colors (such as _red_ or the default _currentColor_), they can be specified as channels to assign colors dynamically based on the associated tick value.

:::plot https://observablehq.com/@observablehq/plot-colored-axes
```js
Plot.axisX(d3.ticks(0, 1, 10), {color: "red"}).plot() // text fill and tick stroke
```
:::

:::plot https://observablehq.com/@observablehq/plot-colored-axes
```js
Plot.axisX(d3.ticks(0, 1, 10), {stroke: Plot.identity, strokeWidth: 3, tickSize: 10}).plot() // tick stroke
```
:::

:::plot https://observablehq.com/@observablehq/plot-colored-axes
```js
Plot.axisX(d3.ticks(0, 1, 10), {fill: "red"}).plot() // text fill
```
:::

To draw an outline around the tick labels, say to improve legibility when drawing an axes atop other marks, use the **textStroke** (default _none_), **textStrokeWidth** (default 3), and **textStrokeOpacity**  (default 1) options.

:::plot https://observablehq.com/@observablehq/plot-colored-axes
```js
Plot.plot({
  height: 40,
  style: "background: #777;",
  x: {domain: [0, 100]},
  marks: [
    Plot.axisX({
      fill: "black",
      stroke: "white",
      textStroke: "white",
      textStrokeWidth: 3,
      textStrokeOpacity: 0.6
    })
  ]
})
```
:::

When faceting, the *x*- and *y*-axes are typically repeated across facets. A *bottom*-anchored *x*-axis is by default drawn on any facet _with empty space below it_; conversely, a *top*-anchored *x*-axis is drawn on any facet _with empty space above it_. Similarly, a *left*-anchored *y*-axis is drawn on facets with empty space to the left, and a *right*-anchored *y*-axis is drawn on facets with empty space to the right.

If the default behavior isn’t what you want, use the *mark*.**facetAnchor** option to control which facets show an axis. (This option applies not just to Plot’s axis and grid mark, but any mark; for example, you can use it to place a text mark at the bottom of each facet column.) The supported values for this option are:

* _top_ - show only on the top facets
* _right_ - show only on the right facets
* _bottom_ - show only on the bottom facets
* _left_ - show only on the left facets
* _top-empty_ - show on any facet with space above (a superset of _top_)
* _right-empty_ - show on any facet with space to the right (a superset of _right_)
* _bottom-empty_ - show on any facet with space to below (a superset of _below_)
* _left-empty_ - show on any facet with space to the left (a superset of _left_)
* null - show on every facet

The interactive chart below shows the different possibilities. Note that we place the facet *fx*-axis (in <span style="border-bottom: solid 2px var(--vp-c-green);">green</span>) opposite the *x*-axis (in <span style="border-bottom: solid 2px var(--vp-c-red);">red</span>).

<p>
  <label class="label-input">
    anchor:
    <select v-model="anchor">
      <option>bottom</option>
      <option>top</option>
    </select>
  </label>
  <label class="label-input">
    facetAnchor:
    <select v-model="facetAnchor">
      <option>auto</option>
      <option>bottom-empty</option>
      <option>bottom</option>
      <option>top-empty</option>
      <option>top</option>
      <option>null</option>
    </select>
  </label>
</p>

:::plot https://observablehq.com/@observablehq/plot-facetanchor
```js
Plot.plot({
  facet: {marginRight: 80},
  grid: true,
  marks: [
    Plot.frame(),
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "sex", fy: "species"}),
    Plot.axisX({color: "red", anchor, facetAnchor: facetAnchor === "auto" ? undefined : facetAnchor}),
    Plot.axisFx({color: "green", anchor: anchor === "top" ? "bottom" : "top"}) // place fx axis opposite x
  ]
})
```
:::

The **labelAnchor** option controls the position of the axis label. For the *x* or *fx* axis, the label anchor may be *left*, *center*, or *right*. It defaults to *center* for ordinal scales and *right* for quantitative scales.

:::plot https://observablehq.com/@observablehq/plot-labelanchor
```js
Plot.plot({
  height: 80,
  grid: true,
  x: {type: "linear"},
  marks: [
    Plot.axisX({anchor: "top", label: "top-left", labelAnchor: "left"}),
    Plot.axisX({anchor: "top", label: "top-center", labelAnchor: "center", ticks: []}),
    Plot.axisX({anchor: "top", label: "top-right", labelAnchor: "right", ticks: []}),
    Plot.axisX({anchor: "bottom", label: "bottom-left", labelAnchor: "left"}),
    Plot.axisX({anchor: "bottom", label: "bottom-center", labelAnchor: "center", ticks: []}),
    Plot.axisX({anchor: "bottom", label: "bottom-right", labelAnchor: "right", ticks: []})
  ]
})
```
:::

For the *y* and *fy* axis, the label anchor may be *top*, *center*, or *bottom*. It defaults to *center* for ordinal scales and *top* for quantitative scales. When the label anchor is *center*, the label is rotated by 90° to fit, though you may need to adjust the margins to avoid overlap between the tick labels and the axis label.

:::plot https://observablehq.com/@observablehq/plot-labelanchor
```js
Plot.plot({
  grid: true,
  y: {type: "linear"},
  marks: [
    Plot.axisY({anchor: "left", label: "left-top", labelAnchor: "top"}),
    Plot.axisY({anchor: "left", label: "left-center", labelAnchor: "center", ticks: []}),
    Plot.axisY({anchor: "left", label: "left-bottom", labelAnchor: "bottom", ticks: []}),
    Plot.axisY({anchor: "right", label: "right-top", labelAnchor: "top"}),
    Plot.axisY({anchor: "right", label: "right-center", labelAnchor: "center", ticks: []}),
    Plot.axisY({anchor: "right", label: "right-bottom", labelAnchor: "bottom", ticks: []})
  ]
})
```
:::

## Axis options

By default, the *data* for an axis mark are tick values sampled from the associated scale’s domain. If desired, you can specify the *data* explicitly (_e.g._ as an array of numbers), or use one of the following options:

* **ticks** - the approximate number of ticks to generate, or interval, or array of values
* **tickSpacing** - the approximate number of pixels between ticks (if **ticks** is not specified)
* **interval** - an interval or time interval

Note that when an axis mark is declared explicitly (via the [**marks** plot option](../features/plots.md#marks), as opposed to an implicit axis), the corresponding scale’s *scale*.ticks and *scale*.tickSpacing options are not automatically inherited by the axis mark; however, the *scale*.interval option *is* inherited, as is the *scale*.label option. You can declare multiple axis marks for the same scale with different ticks, and styles, as desired.

In addition to the [standard mark options](../features/marks.md), the axis mark supports the following options:

* **anchor** - the orientation: *top*, *bottom* (*x* or *fx*); *left*, *right* (*y* or *fy*); *both*; null to suppress
* **tickSize** - the length of the tick vector (in pixels; default 6 for *x* or *y*, or 0 for *fx* or *fy*)
* **tickPadding** - the separation between the tick vector and its label (in pixels; default 3)
* **tickFormat** - either a function or specifier string to format tick values; see [Formats](../features/formats.md)
* **tickRotate** - whether to rotate tick labels (an angle in degrees clockwise; default 0)
* **fontVariant** - the font-variant attribute for ticks; defaults to tabular-nums for quantitative axes
* **label** - a string to label the axis; defaults to the scale’s label, perhaps with an arrow
* **labelAnchor** - the label anchor: *top*, *right*, *bottom*, *left*, or *center*
* **labelOffset** - the label position offset (in pixels; default depends on margins and orientation)
* **color** - the color of the ticks and labels (defaults to *currentColor*)
* **textStroke** - the color of the stroke around tick labels (defaults to *none*)
* **textStrokeOpacity** - the opacity of the stroke around tick labels
* **textStrokeWidth** - the thickness of the stroke around tick labels (in pixels)

As a composite mark, the **stroke** option affects the color of the tick vector, while the **fill** option affects the color the text labels; both default to the **color** option, which defaults to *currentColor*. The **x** and **y** channels, if specified, position the ticks; if not specified, the tick positions depend on the axis **anchor**. The orientation of the tick labels likewise depends on the **anchor**. See the [text mark](./text.md) for details on available options for the tick and axis labels.

The axis mark’s [**facetAnchor**](../features/facets.md) option defaults to *top-empty* if anchor is *top*, *right-empty* if anchor is *right*, *bottom-empty* if anchor is *bottom*, and *left-empty* if anchor is *left*. This ensures the proper positioning of the axes with respect to empty facets.

The axis mark’s default margins depend on its orientation (**anchor**) as follows, in order of **marginTop**, **marginRight**, **marginBottom**, and **marginLeft**, in pixels:

* *top* - 30, 20, 0, 20
* *right* - 20, 40, 20, 0
* *bottom* - 0, 20, 30, 20
* *left* - 20, 0, 20, 40

For simplicity’s sake and for consistent layout across plots, axis margins are not automatically sized to make room for tick labels; instead, shorten your tick labels (for example using the *k* SI-prefix tick format, or setting a *scale*.transform to show thousands or millions, or setting the **textOverflow** option to *ellipsis* and the **lineWidth** option to clip long labels) or increase the margins as needed.

## axisX(*data*, *options*)

```js
Plot.axisX({anchor: "bottom", tickSpacing: 80})
```

Returns a new *x* axis with the given *options*.

## axisY(*data*, *options*)

```js
Plot.axisY({anchor: "left", tickSpacing: 35})
```

Returns a new *y* axis with the given *options*.

## axisFx(*data*, *options*)

```js
Plot.axisFx({anchor: "top", label: null})
```

Returns a new *fx* axis with the given *options*.

## axisFy(*data*, *options*)

```js
Plot.axisFy({anchor: "right", label: null})
```

Returns a new *fy* axis with the given *options*.
