# Observable Plot

**Observable Plot** is a JavaScript library for exploratory data visualization.

* [Introduction](https://observablehq.com/@data-workflows/plot)
* [Installing](#installing)
* [API Reference](#plotplotoptions)
* [Contributing](./CONTRIBUTING.md)

## Installing

For use with Webpack, Rollup, or other Node-based bundlers, Plot is typically installed via a package manager such as Yarn or npm.

```bash
yarn add @observablehq/plot
```

Plot can then be imported as a namespace:

```js
import * as Plot from "@observablehq/plot";
```

In an Observable notebook, Plot (and optionally D3) can be imported like so:

```js
import {Plot, d3} from "@observablehq/plot"
```

In vanilla HTML, Plot can be imported as an ES module, say from Skypack:

```html
<script type="module">

import * as Plot from "https://cdn.skypack.dev/@observablehq/plot@0.1";

document.body.appendChild(Plot.plot(options));

</script>
```

Plot is also available as a UMD bundle for legacy browsers.

```html
<script src="https://cdn.jsdelivr.net/npm/d3@6"></script>
<script src="https://cdn.jsdelivr.net/npm/@observablehq/plot@0.1"></script>
<script>

document.body.appendChild(Plot.plot(options));

</script>
```

## Plot.plot(*options*)

Renders a new plot given the specified *options* and returns the corresponding SVG or HTML figure element. All *options* are optional.

### Mark options

The **marks** option specifies an array of [marks](#marks) to render. Each mark has its own data and options; see the respective mark type (*e.g.*, [bar](#bar) or [dot](#dot)) for which mark options are supported. Each mark may be a nested array of marks, allowing composition. Marks are drawn in *z*-order, last on top. For example, here bars for the dataset *alphabet* are drawn on top of a single rule at *y* = 0.

```js
Plot.plot({
  marks: [
    Plot.ruleY([0]),
    Plot.barY(alphabet, {x: "letter", y: "frequency"})
  ]
})
```

When drawing a single mark, you can call *mark*.**plot**(*options*) as shorthand.

```js
Plot.barY(alphabet, {x: "letter", y: "frequency"}).plot()
```

### Layout options

These options determine the overall layout of the plot; all are specified as numbers in pixels:

* **marginTop** - the top margin
* **marginRight** - the right margin
* **marginBottom** - the bottom margin
* **marginLeft** - the left margin
* **width** - the outer width of the plot (including margins)
* **height** - the outer height of the plot (including margins)

The default **width** is 640. On Observable, the width can be set to the [standard width](https://github.com/observablehq/stdlib/blob/master/README.md#width) to make responsive plots. The default **height** is 396 if the plot has a *y* or *fy* scale; otherwise it is 90 if the plot has an *fx* scale, or 60 if it does not. (The default height will be getting smarter for ordinal domains; see [#337](https://github.com/observablehq/plot/pull/337).)

The default margins depend on the plot’s axes: for example, **marginTop** and **marginBottom** are at least 30 if there is a corresponding top or bottom *x* axis, and **marginLeft** and **marginRight** are at least 40 if there is a corresponding left or right *y* axis. For simplicity’s sake and for consistent layout across plots, margins are not automatically sized to make room for tick labels; instead, shorten your tick labels or increase the margins as needed. (In the future, margins may be specified indirectly via a scale property to make it easier to reorient axes without adjusting margins; see [#210](https://github.com/observablehq/plot/issues/210).)

The **style** option allows custom styles to override Plot’s defaults. It may be specified either as a string or an object of properties (*e.g.*, `"color: red;"` or `{color: "red"}`). By default, the returned plot has a white background, a max-width of 100%, and the system-ui font. Plot’s marks and axes default to [currentColor](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#currentcolor_keyword), meaning that they will inherit the surrounding content’s color. For example, a dark theme:

```js
Plot.plot({
  marks: …,
  style: {
    background: "black",
    color: "white"
  }
})
```

If a **caption** is specified, Plot.plot wraps the generated SVG element in an HTML figure element with a figcaption, returning the figure. To specify an HTML caption, consider using the [`html` tagged template literal](http://github.com/observablehq/htl); otherwise, the specified string represents text that will be escaped as needed.

```js
Plot.plot({
  marks: …,
  caption: html`Figure 1. This chart has a <i>fancy</i> caption.`
})
```

### Scale options

Plot passes data through [scales](https://observablehq.com/@data-workflows/plot-scales) as needed before rendering marks. A scale maps abstract values such as time or temperature to visual values such as position or color. Within a given plot, marks share scales. For example, if a plot has two Plot.line marks, both share the same *x* and *y* scales for a consistent representation of data. (Plot does not currently support dual-axis charts, which are [not advised](https://blog.datawrapper.de/dualaxis/).)

```js
Plot.plot({
  marks: [
    Plot.line(aapl, {x: "Date", y: "Close"}),
    Plot.line(goog, {x: "Date", y: "Close"})
  ]
})
```

Each scale’s options are specified as a nested options object with the corresponding scale name within the top-level plot *options*:

* **x** - horizontal position
* **y** - vertical position
* **r** - radius (size)
* **color** - fill or stroke
* **opacity** - fill or stroke opacity

For example, to set the domain for the *x* and *y* scales:

```js
Plot.plot({
  x: {
    domain: [new Date("1880-01-01"), new Date("2016-11-01")]
  },
  y: {
    domain: [-0.78, 1.35]
  }
})
```

Plot supports many scale types. Some scale types are for quantitative data — values that can be added or subtracted, such as temperature or time. Other scale types are for ordinal or categorical data — unquantifiable values that can only be ordered, such as t-shirt sizes, or values with no inherent order that can only be tested for equality, such as types of fruit. Some scale types are further intended for specific visual encodings — for example, as [position](#position-options) or [color](#color-options).

You can set the scale type explicitly via the *scale*.**type** option, but typically the scale type is inferred automatically from data: strings and booleans imply an ordinal scale; dates imply a UTC scale; anything else is linear. Unless they represent text, we recommend explicitly converting strings to more specific types when loading data (*e.g.*, with d3.autoType or Observable’s FileAttachment). For simplicity’s sake, Plot assumes that data is consistently typed; type inference is based solely on the first non-null, non-undefined value. Certain mark types also imply a scale type; for example, the [Plot.barY](#plotbarydata-options) mark implies that the *x* scale is a *band* scale.

For quantitative data (*i.e.* numbers), a mathematical transform may be applied to the data by changing the scale type:

* *linear* (default) - linear transform (translate and scale)
* *pow* - power (exponential) transform
* *sqrt* - square-root transform (*pow* transform with exponent = 0.5)
* *log* - logarithmic transform
* *symlog* - bi-symmetric logarithmic transform per [Webber *et al.*](https://www.researchgate.net/publication/233967063_A_bi-symmetric_log_transformation_for_wide-range_data)

The appropriate transform depends on the data’s distribution and what you wish to know. A *sqrt* transform exaggerates differences between small values at the expense of large values; it is a special case of the *pow* transform which has a configurable *scale*.**exponent** (0.5 for *sqrt*). A *log* transform is suitable for comparing orders of magnitude and can only be used when the domain does not include zero. The base defaults to 10 and can be specified with the *scale*.**base** option; note that this only affects the axis ticks and not the scale’s behavior. A *symlog* transform is more elaborate, but works well with wide-range values that include zero; it can be configured with the *scale*.**constant** option (default 1).

For temporal data (*i.e.* dates), two variants of a *linear* scale are also supported:

* *utc* (default, recommended) - UTC time
* *time* - local time

UTC is recommended over local time as charts in UTC time are guaranteed to appear consistently to all viewers whereas charts in local time will depend on the viewer’s time zone. Due to limitations in JavaScript’s Date class, Plot does not yet support an explicit time zone other than UTC.

For ordinal data (*e.g.*, strings), use the *ordinal* scale type or the *point* or *band* [position scale types](#position-options). The *categorical* scale type is also supported; it is equivalent to *ordinal* except as a [color scale](#color-options), where it provides a different default color scheme. (Since position is inherently ordinal or even quantitative, categorical data must be assigned an effective order when represented as position, and hence *categorical* and *ordinal* may be considered synonymous in context.)

You can opt-out of a scale using the *identity* scale type. This is useful if you wish to specify literal colors or pixel positions within a mark channel rather than relying on the scale to convert abstract values into visual values. For position scales (*x* and *y*), an *identity* scale is still quantitative and may produce an axis, yet unlike a *linear* scale the domain and range are fixed based on the plot layout.

A scale’s domain (the extent of its inputs, abstract values) and range (the extent of its outputs, visual values) are typically inferred automatically. You can set them explicitly using these options:

* *scale*.**domain** - typically [*min*, *max*], or an array of ordinal or categorical values
* *scale*.**range** - typically [*min*, *max*], or an array of ordinal or categorical values
* *scale*.**reverse** - reverses the domain, say to flip the chart along *x* or *y*

For most quantitative scales, the default domain is the [*min*, *max*] of all values associated with the scale. For the *radius* and *opacity* scales, the default domain is [0, *max*] to ensure a meaningful value encoding. For ordinal scales, the default domain is the set of all distinct values associated with the scale in natural ascending order; set the domain explicitly for a different order. If a scale is reversed, it is equivalent to setting the domain as [*max*, *min*] instead of [*min*, *max*].

The default range depends on the scale: for [position scales](#position-options) (*x*, *y*, *fx*, and *fy*), the default range depends on the plot’s [size and margins](#layout-options). For [color scales](#color-options), there are default color schemes for quantitative, ordinal, and categorical data. For opacity, the default range is [0, 1]. And for radius, the default range is designed to produce dots of “reasonable” size assuming a *sqrt* scale type for accurate area representation: zero maps to zero, the first quartile maps to a radius of three pixels, and other values are extrapolated. This convention for radius ensures that if the scale’s data values are all equal, dots have the default constant radius of three pixels, while if the data varies, dots will tend to be larger.

Quantitative scales can be further customized with additional options:

* *scale*.**clamp** - if true, clamp input values to the scale’s domain
* *scale*.**nice** - if true (or a tick count), extend the domain to nice round values
* *scale*.**zero** - if true, extend the domain to include zero if needed
* *scale*.**percent** - if true, transform proportions in [0, 1] to percentages in [0, 100]

Clamping is typically used in conjunction with setting an explicit domain since if the domain is inferred, no values will be outside the domain. Clamping is useful for focusing on a subset of the data while ensuring that extreme values remain visible, but use caution: clamped values may need an annotation to avoid misinterpretation. A top-level **nice** option is supported as shorthand for setting *scale*.nice on all scales.

The *scale*.**transform** option allows you to apply a function to all values before they are passed through the scale. This is convenient for transforming a scale’s data, say to convert to thousands or between temperature units.

```js
Plot.plot({
  y: {
    label: "↑ Temperature (°F)",
    transform: f => f * 9 / 5 + 32 // convert Celsius to Fahrenheit
  },
  marks: …
})
```

### Position options

The position scales (*x*, *y*, *fx*, and *fy*) support additional options:

* *scale*.**inset** - inset the default range by the specified amount in pixels
* *scale*.**round** - round the output value to the nearest integer (whole pixel)

The *scale*.inset option can provide “breathing room” to separate marks from axes or the plot’s edge. For example, in a scatterplot with a Plot.dot with the default 3-pixel radius and 1.5-pixel stroke width, an inset of 5 pixels prevents dots from overlapping with the axes. The *scale*.round option is useful for crisp edges by rounding to the nearest pixel boundary.

In addition to the generic *ordinal* scale type, which requires an explicit output range value for each input domain value, Plot supports special *point* and *band* scale types for encoding ordinal data as position. These scale types accept a [*min*, *max*] range similar to quantitiatve scales, and divide this continuous interval into discrete points or bands based on the number of distinct values in the domain (*i.e.*, the domain’s cardinality). If the associated marks have no effective width along the ordinal dimension — such as a dot, rule, or tick — then use a *point* scale; otherwise, say for a bar, use a *band* scale. In the image below, the top *x*-scale is a *point* scale while the bottom *x*-scale is a *band* scale; see [Plot: Scales](https://observablehq.com/@data-workflows/plot-scales) for an interactive version.

<img src="./img/point-band.png" width="640" height="144" alt="point and band scales">

Ordinal position scales support additional options, all specified as proportions in [0, 1]:

* *scale*.**padding** - how much of the range to reserve to inset first and last point or band
* *scale*.**align** - where to distribute points or bands (0 = at start, 0.5 = at middle, 1 = at end)

For a *band* scale, you can further fine-tune padding:

* *scale*.**paddingInner** - how much of the range to reserve to separate adjacent bands
* *scale*.**paddingOuter** - how much of the range to reserve to inset first and last band

Plot automatically generates axes for position scales. You can configure these axes with the following options:

* *scale*.**axis** - the orientation: *top* or *bottom* for *x*; *left* or *right* for *y*; null to suppress
* *scale*.**ticks** - the approximate number of ticks to generate
* *scale*.**tickSize** - the size of each tick (in pixels; default 6)
* *scale*.**tickPadding** - the separation between the tick and its label (in pixels; default 3)
* *scale*.**tickFormat** - how to format tick values as a string (a function or format specifier)
* *scale*.**tickRotate** - whether to rotate tick labels (an angle in degrees clockwise; default 0)
* *scale*.**grid** - if true, draw grid lines across the plot for each tick
* *scale*.**label** - a string to label the axis
* *scale*.**labelAnchor** - the label anchor: *top*, *right*, *bottom*, *left*, or *center*
* *scale*.**labelOffset** - the label position offset (in pixels; default 0, typically for facet axes)

Plot does not currently generate a legend for the *color*, *radius*, or *opacity* scales, but when it does, we expect that some of the above options will also be used to configure legends. Top-level options are also supported as shorthand: **grid** (for *x* and *y* only; see [facet.grid](#facet-options)), **inset**, **round**, **align**, and **padding**.

### Color options

The normal scale types — *linear*, *sqrt*, *pow*, *log*, *symlog*, and *ordinal* — can be used to encode color. In addition, Plot supports special scale types for color:

* *sequential* - equivalent to *linear*
* *cyclical* - equivalent to *linear*, but defaults to the *rainbow* scheme
* *diverging* - like *linear*, but with a pivot; defaults to the *rdbu* scheme
* *categorical* - equivalent to *ordinal*, but defaults to the *tableau10* scheme

Color scales support two additional options:

* *scale*.**scheme** - a named color scheme in lieu of a range, such as *reds*
* *scale*.**interpolate** - in conjunction with a range, how to interpolate colors

The following sequential scale schemes are supported for both quantitative and ordinal data:

* <sub><img src="./img/blues.png" width="32" height="16" alt="blues"></sub> *blues*
* <sub><img src="./img/greens.png" width="32" height="16" alt="greens"></sub> *greens*
* <sub><img src="./img/greys.png" width="32" height="16" alt="greys"></sub> *greys*
* <sub><img src="./img/oranges.png" width="32" height="16" alt="oranges"></sub> *oranges*
* <sub><img src="./img/purples.png" width="32" height="16" alt="purples"></sub> *purples*
* <sub><img src="./img/reds.png" width="32" height="16" alt="reds"></sub> *reds*
* <sub><img src="./img/bugn.png" width="32" height="16" alt="bugn"></sub> *bugn*
* <sub><img src="./img/bupu.png" width="32" height="16" alt="bupu"></sub> *bupu*
* <sub><img src="./img/gnbu.png" width="32" height="16" alt="gnbu"></sub> *gnbu*
* <sub><img src="./img/orrd.png" width="32" height="16" alt="orrd"></sub> *orrd*
* <sub><img src="./img/pubu.png" width="32" height="16" alt="pubu"></sub> *pubu*
* <sub><img src="./img/pubugn.png" width="32" height="16" alt="pubugn"></sub> *pubugn*
* <sub><img src="./img/purd.png" width="32" height="16" alt="purd"></sub> *purd*
* <sub><img src="./img/rdpu.png" width="32" height="16" alt="rdpu"></sub> *rdpu*
* <sub><img src="./img/ylgn.png" width="32" height="16" alt="ylgn"></sub> *ylgn*
* <sub><img src="./img/ylgnbu.png" width="32" height="16" alt="ylgnbu"></sub> *ylgnbu*
* <sub><img src="./img/ylorbr.png" width="32" height="16" alt="ylorbr"></sub> *ylorbr*
* <sub><img src="./img/ylorrd.png" width="32" height="16" alt="ylorrd"></sub> *ylorrd*
* <sub><img src="./img/cividis.png" width="32" height="16" alt="cividis"></sub> *cividis*
* <sub><img src="./img/inferno.png" width="32" height="16" alt="inferno"></sub> *inferno*
* <sub><img src="./img/magma.png" width="32" height="16" alt="magma"></sub> *magma*
* <sub><img src="./img/plasma.png" width="32" height="16" alt="plasma"></sub> *plasma*
* <sub><img src="./img/viridis.png" width="32" height="16" alt="viridis"></sub> *viridis*
* <sub><img src="./img/cubehelix.png" width="32" height="16" alt="cubehelix"></sub> *cubehelix*
* <sub><img src="./img/turbo.png" width="32" height="16" alt="turbo"></sub> *turbo*
* <sub><img src="./img/warm.png" width="32" height="16" alt="warm"></sub> *warm*
* <sub><img src="./img/cool.png" width="32" height="16" alt="cool"></sub> *cool*

The default color scheme, *turbo*, was chosen primarily to ensure high-contrast visibility; color schemes such as *blues* make low-value marks difficult to see against a white background, for better or for worse. If you wish to encode a quantitative value without hue, consider using *opacity* rather than *color* (e.g., use Plot.dot’s *strokeOpacity* instead of *stroke*).

The following diverging scale schemes are supported:

* <sub><img src="./img/brbg.png" width="32" height="16" alt="brbg"></sub> *brbg*
* <sub><img src="./img/prgn.png" width="32" height="16" alt="prgn"></sub> *prgn*
* <sub><img src="./img/piyg.png" width="32" height="16" alt="piyg"></sub> *piyg*
* <sub><img src="./img/puor.png" width="32" height="16" alt="puor"></sub> *puor*
* <sub><img src="./img/rdbu.png" width="32" height="16" alt="rdbu"></sub> *rdbu*
* <sub><img src="./img/rdgy.png" width="32" height="16" alt="rdgy"></sub> *rdgy*
* <sub><img src="./img/rdylbu.png" width="32" height="16" alt="rdylbu"></sub> *rdylbu*
* <sub><img src="./img/rdylgn.png" width="32" height="16" alt="rdylgn"></sub> *rdylgn*
* <sub><img src="./img/spectral.png" width="32" height="16" alt="spectral"></sub> *spectral*
* <sub><img src="./img/burd.png" width="32" height="16" alt="burd"></sub> *burd*
* <sub><img src="./img/buylrd.png" width="32" height="16" alt="buylrd"></sub> *buylrd*

Diverging color scales support a *scale*.**pivot** option, which defaults to zero. Values below the pivot will use the lower half of the color scheme (*e.g.*, reds for the *rdgy* scheme), while values above the pivot will use the upper half (grays for *rdgy*).

The following cylical color schemes are supported:

* <sub><img src="./img/rainbow.png" width="32" height="16" alt="rainbow"></sub> *rainbow*
* <sub><img src="./img/sinebow.png" width="32" height="16" alt="sinebow"></sub> *sinebow*

The following categorical color schemes are supported:

* <sub><img src="./img/accent.png" width="96" height="16" alt="accent"></sub> *accent* (8 colors)
* <sub><img src="./img/category10.png" width="120" height="16" alt="category10"></sub> *category10* (10 colors)
* <sub><img src="./img/dark2.png" width="96" height="16" alt="dark2"></sub> *dark2* (8 colors)
* <sub><img src="./img/paired.png" width="144" height="16" alt="paired"></sub> *paired* (12 colors)
* <sub><img src="./img/pastel1.png" width="108" height="16" alt="pastel1"></sub> *pastel1* (9 colors)
* <sub><img src="./img/pastel2.png" width="96" height="16" alt="pastel2"></sub> *pastel2* (8 colors)
* <sub><img src="./img/set1.png" width="108" height="16" alt="set1"></sub> *set1* (9 colors)
* <sub><img src="./img/set2.png" width="96" height="16" alt="set2"></sub> *set2* (8 colors)
* <sub><img src="./img/set3.png" width="144" height="16" alt="set3"></sub> *set3* (12 colors)
* <sub><img src="./img/tableau10.png" width="120" height="16" alt="tableau10"></sub> *tableau10* (10 colors)

The following color interpolators are supported:

* *rgb* - RGB (red, green, blue)
* *hsl* - HSL (hue, saturation, lightness)
* *lab* - CIELAB (*a.k.a.* “Lab”)
* *hcl* - CIELCh<sub>ab</sub> (*a.k.a.* “LCh” or “HCL”)

For example, to use CIELCh<sub>ab</sub>:

```js
Plot.plot({
  color: {
    range: ["red", "blue"],
    interpolate: "hcl"
  },
  marks: …
})
```

Or to use gamma-corrected RGB (via [d3-interpolate](https://github.com/d3/d3-interpolate)):

```js
Plot.plot({
  color: {
    range: ["red", "blue"],
    interpolate: d3.interpolateRgb.gamma(2.2)
  },
  marks: …
})
```

### Facet options

The *facet* option enables faceting. When faceting, two additional band scales may be configured:

* **fx** - horizontal position
* **fy** - vertical position

The following *facet* options are supported:

* facet.**data** -
* facet.**x** -
* facet.**y** -
* facet.**marginTop** -
* facet.**marginRight** -
* facet.**marginBottom** -
* facet.**marginLeft** -
* facet.**grid** -

TODO Describe how data is faceted according to strict equality (`===`): if a mark’s data is strictly equal to the facet data, the mark is faceted; otherwise, the mark is repeated for each facet. You can disable faceting for a specific mark by giving it a shallow copy of the data.

## Marks

Marks visualize data as geometric shapes such as bars, dots, and lines. An single mark can generate multiple shapes: for example, passing a [Plot.barY](#plotbarydata-options) to [Plot.plot](#plotplotoptions) will produce a bar for each element in the associated data. Multiple marks can be layered into plots.

Mark constructors take two arguments: **data** and **options**. Together, the *data* and *options* describe a tabular dataset and how to visualize it. Options that are shared by all of a mark’s generated shapes are known as *constants*, while options that vary with the mark’s data are known as *channels*. Channels are typically specified as abstract values such as time or temperature rather than visual values such as position or color because most channels are bound to [scales](#scale-options).

A mark’s *data* is most commonly an array of objects representing a tabular dataset, such as the result of loading a CSV file, while *options* binds mark channels (such as *x* and *y*) to named columns in the data (such as *units* and *fruit*).

```js
sales = [
  {units: 10, fruit: "fig"},
  {units: 20, fruit: "date"},
  {units: 40, fruit: "plum"},
  {units: 30, fruit: "plum"}
]
```
```js
Plot.dot(sales, {x: "units", y: "fruit"}).plot()
```

Channel values can also be specified as functions, affording greater flexibility if your data is not structured in a way that is readily visualized, or if you want to visualize computed values. Channel functions are invoked for each datum (*d*) in the data and return the corresponding channel value. (This is similar to how D3’s [*selection*.attr](https://github.com/d3/d3-selection/blob/master/README.md#selection_attr) accepts functions, though note that Plot channel functions should return abstract values, not visual values.)

```js
Plot.dot(sales, {x: d => d.units * 1000, y: d => d.fruit}).plot()
```

Channel values can be specified as numbers for constant values, say for a fixed baseline with an [area](#area).

```js
Plot.area(aapl, {x1: "Date", y1: 0, y2: "Close"}).plot()
```

Plot also supports columnar data for greater efficiency with bigger datasets; for example, data can be specified as any array of the appropriate length (or any iterable or value compatible with [Array.from](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)), and then separate arrays of values can be passed as *options*.

```js
index = [0, 1, 2, 3]
```
```js
units = [10, 20, 40, 30]
```
```js
fruits = ["fig", "date", "plum", "plum"]
```
```js
Plot.dot(index, {x: units, y: fruits}).plot()
```

TODO Describe how missing or invalid data is handled.

All marks support the following style options:

* **fill** - fill color
* **fillOpacity** - fill opacity (a number between 0 and 1)
* **stroke** - stroke color
* **strokeWidth** - stroke width (in pixels)
* **strokeOpacity** - stroke opacity (a number between 0 and 1)
* **strokeLinejoin** - how to join lines (*bevel*, *miter*, *miter-clip*, or *round*)
* **strokeLinecap** - how to cap lines (*butt*, *round*, or *square*)
* **strokeMiterlimit** - to limit the length of *miter* joins
* **strokeDasharray** - a comma-separated list of dash lengths (in pixels)
* **mixBlendMode** - the [blend mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode) (*e.g.*, *multiply*)

All marks support the following optional channels:

* **fill** - a fill color; bound to the *color* scale
* **fillOpacity** - a fill opacity; bound to the *opacity* scale
* **stroke** - a stroke color; bound to the *color* scale
* **strokeOpacity** - a stroke opacity; bound to the *opacity* scale
* **title** - a tooltip (a string of text, possibly with newlines)

The **fill**, **fillOpacity**, **stroke**, and **strokeOpacity** options can be specified as either channels or constants. When the fill or stroke is specified as a function or array, it is interpreted as a channel; when the fill or stroke is specified as a string, it is interpreted as a constant if a valid CSS color and otherwise it is interpreted as a column name for a channel. Similarly when the fill or stroke opacity is specified as a number, it is interpreted as a constant; otherwise it is interpeted as a channel. When the radius is specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel.

The rectangular marks ([bar](#bar), [cell](#cell), and [rect](#rect)) support insets and rounded corner constant options:

* **insetTop** - inset the top edge
* **insetRight** - inset the right edge
* **insetBottom** - inset the bottom edge
* **insetLeft** - inset the left edge
* **rx** - the [*x*-radius](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx) for rounded corners
* **ry** - the [*y*-radius](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/ry) for rounded corners

Insets are specified in pixels. Corner radii are specified in either pixels or percentages (strings). Both default to zero. Insets are typically used to ensure a one-pixel gap between adjacent bars; note that the [bin transform](#bin) provides default insets, and that the [band scale padding](#position-options) defaults to 0.1, which also provides separation.

### Area

[<img src="./img/area.png" width="320" height="198" alt="an area chart">](https://observablehq.com/@data-workflows/plot-area)

[Source](./src/marks/area.js) · [Examples](https://observablehq.com/@data-workflows/plot-area) · Draws regions formed by a baseline (*x1*, *y1*) and a topline (*x2*, *y2*), as in an area chart. Often the baseline represents *y* = 0. While not required, typically the *x* and *y* scales are both quantitative.

The following channels are required:

* **x1** - the horizontal position of the baseline; bound to the *x* scale
* **y1** - the vertical position of the baseline; bound to the *y* scale

In addition to the [standard mark options](#marks), the following optional channels are supported:

* **x2** - the horizontal position of the topline; bound to the *x* scale
* **y2** - the vertical position of the topline; bound to the *y* scale
* **z** - a categorical value to group data into series

If **x2** is not specified, it defaults to **x1**. If **y2** is not specified, it defaults to **y1**. If **z** is not specified, the data is assumed to represent a single series.

TODO Describe the defaults for fill, stroke, and z. Describe how varying color and opacity within a series is not recommended.

TODO Describe the importance of data order and the **sort** transform.

TODO Describe how missing or invalid data is handled (broken areas).

The area mark supports [curve options](#curves) to control interpolation between points.

#### Plot.area(*data*, *options*)

```js
Plot.area(aapl, {x1: "Date", y1: 0, y2: "Close"})
```

Returns a new area with the given *data* and *options*. Plot.area is rarely used directly; it is only needed when the baseline and topline have neither common *x* nor *y* values. [Plot.areaY](#plotareaydata-options) is used in the common horizontal orientation where the baseline and topline share *x* values, while [Plot.areaX](#plotareaxdata-options) is used in the vertical orientation where the baseline and topline share *y* values.

#### Plot.areaX(*data*, *options*)

```js
Plot.areaX(aapl, {y: "Date", x: "Close"})
```

Equivalent to [Plot.area](#plotareadata-options), except that the *y* option specifies the *y1* channel, and if the *x* option is specified, it corresponds to the *x2* channel while the *x1* channel defaults to zero. This constructor is typically used for vertically-oriented area charts (*e.g.*, when time goes up↑).

#### Plot.areaY(*data*, *options*)

```js
Plot.areaY(aapl, {x: "Date", y: "Close"})
```

Equivalent to [Plot.area](#plotareadata-options), except that the *x* option specifies the *x1* channel, and if the *y* option is specified, it corresponds to the *y2* channel while the *y1* channel defaults to zero. This constructor is typically used for horizontally-oriented area charts (*e.g.*, when time goes right→).

### Bar

[<img src="./img/bar.png" width="320" height="198" alt="a bar chart">](https://observablehq.com/@data-workflows/plot-bar)

[Source](./src/marks/bar.js) · [Examples](https://observablehq.com/@data-workflows/plot-bar) · Draws rectangles where *x* is ordinal and *y* is quantitative ([Plot.barY](#plotbarydata-options)) or *y* is ordinal and *x* is quantitative ([Plot.barX](#plotbarxdata-options)). There is usually one ordinal value associated with each bar, such as a name, and two quantitative values defining a lower and upper bound. The lower bound is often not specified explicitly because it defaults to zero as in a conventional bar chart.

For the required channels, see [Plot.barX](#plotbarxdata-options) and [Plot.barY](#plotbarydata-options). The bar mark supports the [standard mark options](#marks), including insets and rounded corners. TODO Describe the defaults for fill and stroke.

#### Plot.barX(*data*, *options*)

```js
Plot.barX(alphabet, {y: "letter", x: "frequency"})
```

Returns a new horizontal bar with the given *data* and *options*. The following channels are required:

* **x1** - the starting horizontal position; bound to the *x* scale
* **x2** - the ending horizontal position; bound to the *x* scale

In addition to the [standard bar channels](#bar), the following optional channels are supported:

* **y** - the vertical position; bound to the *y* scale, which must be a *band* scale

If an **x** option is specified, it is shorthand for the **x2** option with **x1** equal to zero; this is the typical configuration for a horizontal bar chart with bars aligned at *x* = 0. If the **y** channel is not specified, the bar will span the full vertical extent of the plot (or facet).

#### Plot.barY(*data*, *options*)

```js
Plot.barY(alphabet, {x: "letter", y: "frequency"})
```

Returns a new vertical bar with the given *data* and *options*. The following channels are required:

* **y1** - the starting vertical position; bound to the *y* scale
* **y2** - the ending vertical position; bound to the *y* scale

In addition to the [standard bar channels](#bar), the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale, which must be a *band* scale

If a **y** option is specified, it is shorthand for the **y2** option with **y1** equal to zero; this is the typical configuration for a vertical bar chart with bars aligned at *y* = 0. If the **x** channel is not specified, the bar will span the full horizontal extent of the plot (or facet).

### Cell

[<img src="./img/cell.png" width="320" height="320" alt="a heatmap">](https://observablehq.com/@data-workflows/plot-cell)

[Source](./src/marks/cell.js) · [Examples](https://observablehq.com/@data-workflows/plot-cell) · Draws rectangles where both *x* and *y* are ordinal, typically in conjunction with a *fill* channel to encode value.

In addition to the [standard mark options](#marks), including insets and rounded corners, the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale, which must be a *band* scale
* **y** - the vertical position; bound to the *y* scale, which must be a *band* scale

If the **x** channel is not specified, the cell will span the full horizontal extent of the plot (or facet). Likewise if the **y** channel is not specified, the cell will span the full vertical extent of the plot (or facet). (Typically either *x*, *y*, or both are specified; see [Plot.frame](#frame) if you want a simple frame decoration around the plot.)

TODO Describe the defaults for fill and stroke.

#### Plot.cell(*data*, *options*)

```js
Plot.cell(simpsons, {x: "number_in_season", y: "season", fill: "imdb_rating"})
```

Returns a new cell with the given *data* and *options*. If both the **x** and **y** options are not specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

#### Plot.cellX(*data*, *options*)

```js
Plot.cellX(simpsons.map(d => d.imdb_rating))
```

Equivalent to [Plot.cell](#plotcelldata-options), except that if the **x** option is not specified, it defaults to [0, 1, 2, …], and if the **fill** option is not specified and **stroke** is not a channel, the fill defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …].

#### Plot.cellY(*data*, *options*)

```js
Plot.cellY(simpsons.map(d => d.imdb_rating))
```

Equivalent to [Plot.cell](#plotcelldata-options), except that if the **y** option is not specified, it defaults to [0, 1, 2, …], and if the **fill** option is not specified and **stroke** is not a channel, the fill defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …].

### Dot

[<img src="./img/dot.png" width="320" height="198" alt="a scatterplot">](https://observablehq.com/@data-workflows/plot-dot)

[Source](./src/marks/dot.js) · [Examples](https://observablehq.com/@data-workflows/plot-dot) · Draws circles (and in the future, possibly other symbols) as in a scatterplot.

In addition to the [standard mark options](#marks), the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale
* **y** - the vertical position; bound to the *y* scale
* **r** - the radius (area); bound to the *radius* scale

If the **x** channel is not specified, the dot will be horizontally centered in the plot (or facet). Likewise if the **y** channel is not specified, the dot will vertically centered in the plot (or facet). (Typically either *x*, *y*, or both are specified.)

The **r** option can be specified as either a channel or constant. When the radius is specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel.

TODO Describe the defaults for fill and stroke.

TODO Dots with a nonpositive radius are not drawn.

#### Plot.dot(*data*, *options*)

```js
Plot.dot(sales, {x: "units", y: "fruit"})
```

Returns a new dot with the given *data* and *options*. If both the **x** and **y** options are not specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

#### Plot.dotX(*data*, *options*)

```js
Plot.dotX(cars.map(d => d["economy (mpg)"]))
```

Equivalent to [Plot.dot](#plotdotdata-options) except that if the **x** option is not specified, it defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …].

#### Plot.dotY(*data*, *options*)

```js
Plot.dotY(cars.map(d => d["economy (mpg)"]))
```

Equivalent to [Plot.dot](#plotdotdata-options) except that if the **y** option is not specified, it defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …].

### Line

[<img src="./img/line.png" width="320" height="198" alt="a line chart">](https://observablehq.com/@data-workflows/plot-line)

[Source](./src/marks/line.js) · [Examples](https://observablehq.com/@data-workflows/plot-line) · Draws two-dimensional lines as in a line chart.

The following channels are required:

* **x** - the horizontal position of the line; bound to the *x* scale
* **y** - the vertical position of the line; bound to the *y* scale

In addition to the [standard mark options](#marks), the following optional channels are supported:

* **z** - a categorical value to group data into series

TODO Describe the defaults for fill, stroke, and z. Describe how varying color and opacity within a series is not recommended.

TODO Describe the importance of data order and the **sort** transform.

TODO Describe how missing or invalid data is handled (broken lines).

The line mark supports [curve options](#curves) to control interpolation between points.

#### Plot.line(*data*, *options*)

```js
Plot.line(aapl, {x: "Date", y: "Close"})
```

Returns a new line with the given *data* and *options*. If both the **x** and **y** options are not specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

#### Plot.lineX(*data*, *options*)

```js
Plot.lineX(aapl.map(d => d.Close))
```

Equivalent to [Plot.line](#plotlinedata-options) except that if the **x** option is not specified, it defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …]. If the **y** option is not specified, it defaults to [0, 1, 2, …].

#### Plot.lineY(*data*, *options*)

```js
Plot.lineY(aapl.map(d => d.Close))
```

Equivalent to [Plot.line](#plotlinedata-options) except that if the **y** option is not specified, it defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …]. If the **x** option is not specified, it defaults to [0, 1, 2, …].

### Link

[<img src="./img/link.png" width="320" height="198" alt="a chart with links">](https://observablehq.com/@data-workflows/plot-link)

[Source](./src/marks/link.js) · [Examples](https://observablehq.com/@data-workflows/plot-link) · Draws line segments (or curves) connecting pairs of points.

The following channels are required:

* **x1** - the starting horizontal position; bound to the *x* scale
* **y1** - the starting vertical position; bound to the *y* scale
* **x2** - the ending horizontal position; bound to the *x* scale
* **y2** - the ending vertical position; bound to the *y* scale

The link mark supports the [standard mark options](#marks).

TODO Describe the defaults for stroke. A link never has a fill (although that might change if we support curved links).

The link mark supports [curve options](#curves) to control interpolation between points.

#### Plot.link(*data*, *options*)

```js
Plot.link(inequality, {x1: "POP_1980", y1: "R90_10_1980", x2: "POP_2015", y2: "R90_10_2015"})
```

Returns a new link with the given *data* and *options*.

### Rect

[<img src="./img/rect.png" width="320" height="198" alt="a histogram">](https://observablehq.com/@data-workflows/plot-rect)

[Source](./src/marks/rect.js) · [Examples](https://observablehq.com/@data-workflows/plot-rect) · Draws rectangles where both *x* and *y* are quantitative as in a histogram. Both pairs of quantitative values represent lower and upper bounds, and often one of the lower bounds is implicitly zero.

The following channels are required:

* **x1** - the starting horizontal position; bound to the *x* scale
* **y1** - the starting vertical position; bound to the *y* scale
* **x2** - the ending horizontal position; bound to the *x* scale
* **y2** - the ending vertical position; bound to the *y* scale

The rect mark supports the [standard mark options](#marks), including insets and rounded corners.

TODO Describe the defaults for fill and stroke.

TODO Mention that rect is often used in conjunction with the [bin transform](#bin).

#### Plot.rect(*data*, *options*)

```js
Plot.rect(athletes, Plot.bin({fill: "count"}, {x: "weight", y: "height"}))
```

Returns a new rect with the given *data* and *options*.

#### Plot.rectX(*data*, *options*)

```js
Plot.rectX(athletes, Plot.binY({x: "count"}, {y: "weight"}))
```

Equivalent to [Plot.rect](#plotrectdata-options), except that if the *x* option is specified, it corresponds to the *x2* channel while the *x1* channel defaults to zero. This constructor is typically used for vertically-oriented histograms (*e.g.*, where bins extend right→).

#### Plot.rectY(*data*, *options*)

```js
Plot.rectY(athletes, Plot.binX({y: "count"}, {x: "weight"}))
```

Equivalent to [Plot.rect](#plotrectdata-options), except that the *x* option specifies the *x1* channel, and if the *y* option is specified, it corresponds to the *y2* channel while the *y1* channel defaults to zero. This constructor is typically used for horizontally-oriented histograms (*e.g.*, where bins extend up↑).

### Rule

[<img src="./img/rule.png" width="320" height="198" alt="a line chart with a highlighted rule">](https://observablehq.com/@data-workflows/plot-rule)

[Source](./src/marks/rule.js) · [Examples](https://observablehq.com/@data-workflows/plot-rule) · Draws an orthogonal line at the given horizontal ([Plot.ruleX](#plotrulexdata-options)) or vertical ([Plot.ruleY](#plotruleydata-options)) position, either across the entire plot (or facet) or bounded in the opposite dimension. Rules are often used with hard-coded data to annotate special values such as *y* = 0, though they can also be used to visualize data as in a lollipop chart.

For the required channels, see [Plot.ruleX](#plotrulexdata-options) and [Plot.ruleY](#plotruleydata-options). The rule mark supports the [standard mark options](#marks), including insets along its secondary dimension. The **stroke** option defaults to currentColor.

#### Plot.ruleX(*data*, *options*)

```js
Plot.ruleX([0]) // as annotation
```
```js
Plot.ruleX(alphabet, {x: "letter", y: "frequency"}) // like barY
```

Returns a new vertical rule with the given *data* and *options*. In addition to the [standard mark options](#marks), the following channels are optional:

* **x** - the horizontal position; bound to the *x* scale
* **y1** - the starting vertical position; bound to the *y* scale
* **y2** - the ending vertical position; bound to the *y* scale

If the **x** option is not specified, it defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …]. If a **y** option is specified, it is shorthand for the **y2** option with **y1** equal to zero; this is the typical configuration for a vertical lollipop chart with rules aligned at *y* = 0. If the **y1** channel is not specified, the rule will start at the top of the plot (or facet). If the **y2** channel is not specified, the rule will end at the bottom of the plot (or facet).

#### Plot.ruleY(*data*, *options*)

```js
Plot.ruleY([0]) // as annotation
```
```js
Plot.ruleY(alphabet, {y: "letter", x: "frequency"}) // like barX
```

Returns a new horizontal rule with the given *data* and *options*. In addition to the [standard mark options](#marks), the following channels are optional:

* **y** - the vertical position; bound to the *y* scale
* **x1** - the starting horizontal position; bound to the *x* scale
* **x2** - the ending horizontal position; bound to the *x* scale

If the **y** option is not specified, it defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …]. If a **x** option is specified, it is shorthand for the **x2** option with **x1** equal to zero; this is the typical configuration for a horizontal lollipop chart with rules aligned at *x* = 0. If the **x1** channel is not specified, the rule will start at the left edge of the plot (or facet). If the **x2** channel is not specified, the rule will end at the right edge of the plot (or facet).

### Text

[<img src="./img/text.png" width="320" height="198" alt="a bar chart with text labels">](https://observablehq.com/@data-workflows/plot-text)

[Source](./src/marks/text.js) · [Examples](https://observablehq.com/@data-workflows/plot-text) · Draws a text label at the specified position.

The following channels are required:

* **text** - the text contents (a string)

If **text** is not specified, it defaults to [0, 1, 2, …] so that something is visible by default. Due to the design of SVG, each label is currently limited to one line; in the future we may support multiline text. [#327](https://github.com/observablehq/plot/pull/327) For embedding numbers and dates into text, consider [*number*.toLocaleString](https://observablehq.com/@mbostock/number-formatting), [*date*.toLocaleString](https://observablehq.com/@mbostock/date-formatting), [d3-format](https://github.com/d3/d3-format), or [d3-time-format](https://github.com/d3/d3-time-format).

In addition to the [standard mark options](#marks), the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale
* **y** - the vertical position; bound to the *y* scale
* **fontSize** - the font size in pixels
* **rotate** - the rotation in degrees clockwise

The following text-specific constant options are also supported:

* **fontFamily** - the font name; defaults to [system-ui](https://drafts.csswg.org/css-fonts-4/#valdef-font-family-system-ui)
* **fontSize** - the font size in pixels; defaults to 10
* **fontStyle** - the [font style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style); defaults to normal
* **fontVariant** - the [font variant](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant); defaults to normal
* **fontWeight** - the [font weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight); defaults to normal
* **dx** - the horizontal offset; defaults to 0
* **dy** - the vertical offset; defaults to 0
* **rotate** - the rotation in degrees clockwise; defaults to 0

The **dx** and **dy** options can be specified either as numbers representing pixels or as a string including units. For example, `"1em"` shifts the text by one [em](https://en.wikipedia.org/wiki/Em_(typography)), which is proportional to the **fontSize**.

The **fontSize** and **rotate** options can be specified as either channels or constants. When fontSize or rotate is specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel.

#### Plot.text(*data*, *options*)

Returns a new text mark with the given *data* and *options*. If both the **x** and **y** options are not specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

#### Plot.textX(*data*, *options*)

Equivalent to Plot.text, except **x** defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …].

#### Plot.textY(*data*, *options*)

Equivalent to Plot.text, except **y** defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …].

### Tick

[<img src="./img/tick.png" width="320" height="198" alt="a barcode plot">](https://observablehq.com/@data-workflows/plot-tick)

[Source](./src/marks/tick.js) · [Examples](https://observablehq.com/@data-workflows/plot-tick) · Draws an orthogonal line at the given horizontal ([Plot.tickX](#plottickxdata-options)) or vertical ([Plot.tickY](#plottickydata-options)) position, with an optional secondary position dimension along a band scale. (If the secondary dimension is quantitative instead of ordinal, use a [rule](#rule).) Ticks are often used to visualize distributions, as in a “barcode” plot.

For the required channels, see [Plot.tickX](#plottickxdata-options) and [Plot.tickY](#plottickydata-options). The tick mark supports the [standard mark options](#marks), including insets. The **stroke** option defaults to currentColor.

#### Plot.tickX(*data*, *options*)

```js
Plot.tickX(stateage, {x: "population", y: "age"})
```

Returns a new tick with the given *data* and *options*. The following channels are required:

* **x** - the horizontal position; bound to the *x* scale

The following optional channels are supported:

* **y** - the vertical position; bound to the *y* scale, which must be a *band* scale

If the **y** channel is not specified, the tick will span the full vertical extent of the plot (or facet).

#### Plot.tickY(*data*, *options*)

```js
Plot.tickY(stateage, {y: "population", x: "age"})
```

Returns a new tick with the given *data* and *options*. The following channels are required:

* **y** - the vertical position; bound to the *y* scale

The following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale, which must be a *band* scale

If the **x** channel is not specified, the tick will span the full vertical extent of the plot (or facet).

## Decorations

Decorations are static marks that do not represent data. Currently this includes only [Plot.frame](#frame), although internally Plot’s axes are implemented as decorations and may in the future be exposed here for more flexible configuration.

### Frame

[<img src="./img/frame.png" width="320" height="198" alt="a faceted scatterplot with a frame around each facet">](https://observablehq.com/@data-workflows/plot-frame)

[Source](./src/marks/frame.js) · [Examples](https://observablehq.com/@data-workflows/plot-frame) · Draws a simple frame around the entire plot (or facet).

The frame mark supports the [standard mark options](#marks), but does not accept any data or support channels. The default **stroke** is currentColor, and the default **fill** is none.

#### Plot.frame(*options*)

```js
Plot.frame({stroke: "red"})
```

Returns a new frame with the specified *options*.

## Transforms

TODO Describe how transforms derive channels and mark indexes. Transforms compute new mark options. Some transforms take a mark’s *options*, while other transforms take transform-specific options as the first argument. In all cases, the transform returns a new *options* object you can pass to a mark — or another transform, as when composing transforms.

TODO All marks support the following basic transforms:

* **filter** -
* **sort** -
* **reverse** -

You can also specify a custom transform function:

* **transform** -

The basic transforms are composable: the filter transform is applied first, then sort, reverse, and lastly the custom transform. The custom transform is rarely specified directly; instead it is applied using one of the built-in transforms described below.

### Bin

[Source](./src/transforms/bin.js) · [Examples](https://observablehq.com/@data-workflows/plot-bin) · The bin transform aggregates quantitative data — continuous measurements such as heights, weights, or temperatures — into discrete bins. You can then compute summary statistics for each bin, such as a count, sum, or proportion. The bin transform is like a [group transform](#group) for quantitative data, and is most often used to make histograms or heatmaps.

#### Plot.bin(*outputs*, *options*)

…

```js
Plot.rectY(athletes, Plot.bin({fillOpacity: "count"}, {x: "weight", y: "height"}))
```

#### Plot.binX(*outputs*, *options*)

…

```js
Plot.rectY(athletes, Plot.binX({y: "count"}, {x: "weight"}))
```

#### Plot.binY(*outputs*, *options*)

…

```js
Plot.rectX(athletes, Plot.binY({x: "count"}, {y: "weight"}))
```

### Group

[Source](./src/transforms/group.js) · [Examples](https://observablehq.com/@data-workflows/plot-group)

#### Plot.group(*outputs*, *options*)

…

#### Plot.groupX(*outputs*, *options*)

…

#### Plot.groupY(*outputs*, *options*)

…

#### Plot.groupZ(*outputs*, *options*)

…

### Map

[Source](./src/transforms/map.js) · [Examples](https://observablehq.com/@data-workflows/plot-map)

#### Plot.map(*outputs*, *options*)

…

#### Plot.mapX(<i>map</i>, *options*)

…

#### Plot.mapY(<i>map</i>, *options*)

…

#### Plot.normalizeX(*options*)

…

#### Plot.normalizeY(*options*)

…

#### Plot.windowX(*options*)

…

#### Plot.windowY(*options*)

…

### Select

[Source](./src/transforms/select.js) · [Examples](https://observablehq.com/@data-workflows/plot-select)

#### Plot.selectFirst(*options*)

…

#### Plot.selectLast(*options*)

…

#### Plot.selectMinX(*options*)

…

#### Plot.selectMinY(*options*)

…

#### Plot.selectMaxX(*options*)

…

#### Plot.selectMaxY(*options*)

…

### Stack

[Source](./src/transforms/stack.js) · [Examples](https://observablehq.com/@data-workflows/plot-stack)

#### Plot.stackX(*options*)

…

#### Plot.stackX1(*options*)

Equivalent to Plot.stackX, except that the **x1** channel is returned as the **x** channel. This can be used, for example, to draw a line at the bottom of each stacked area.

#### Plot.stackX2(*options*)

Equivalent to Plot.stackX, except that the **x2** channel is returned as the **x** channel. This can be used, for example, to draw a line at the top of each stacked area.

#### Plot.stackY(*options*)

…

#### Plot.stackY1(*options*)

Equivalent to Plot.stackY, except that the **y1** channel is returned as the **y** channel. This can be used, for example, to draw a line at the left edge of each stacked area.

#### Plot.stackY2(*options*)

Equivalent to Plot.stackY, except that the **y2** channel is returned as the **y** channel. This can be used, for example, to draw a line at the right edge of each stacked area.

## Curves

A curve defines how to turn a discrete representation of a line as a sequence of points [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] into a continuous path; *i.e.*, how to interpolate between points. Curves are used by the [line](#line), [area](#area), and [link](#link) mark, and are implemented by [d3-shape](https://github.com/d3/d3-shape/blob/master/README.md#curves).

The supported curve options are:

* **curve** - the curve method, either a string or a function
* **tension** - the curve tension (for fine-tuning)

The following named curve methods are supported:

* *basis* - a cubic basis spline (repeating the end points)
* *basis-open* - an open cubic basis spline
* *basis-closed* - a closed cubic basis spline
* *bump-x* - a Bézier curve with horizontal tangents
* *bump-y* - a Bézier curve with vertical tangents
* *cardinal* - a cubic cardinal spline (with one-sided differences at the ends)
* *cardinal-open* - an open cubic cardinal spline
* *cardinal-closed* - an closed cubic cardinal spline
* *catmull-rom* - a cubic Catmull–Rom spline (with one-sided differences at the ends)
* *catmull-rom-open* - an open cubic Catmull–Rom spline
* *catmull-rom-closed* - a closed cubic Catmull–Rom spline
* *linear* - a piecewise linear curve (*i.e.*, straight line segments)
* *linear-closed* - a closed piecewise linear curve (*i.e.*, straight line segments)
* *monotone-x* - a cubic spline that preserves monotonicity in *x*
* *monotone-y* - a cubic spline that preserves monotonicity in *y*
* *natural* - a natural cubic spline
* *step* - a piecewise constant function where *y* changes at the midpoint of *x*
* *step-after* - a piecewise constant function where *y* changes after *x*
* *step-before* - a piecewise constant function where *x* changes after *y*

If *curve* is a function, it will be invoked with a given *context* in the same fashion as a [D3 curve factory](https://github.com/d3/d3-shape/blob/master/README.md#custom-curves).

The tension option only has an effect on cardinal and Catmull–Rom splines (*cardinal*, *cardinal-open*, *cardinal-closed*, *catmull-rom*, *catmull-rom-open*, and *catmull-rom-closed*). For cardinal splines, it corresponds to [tension](https://github.com/d3/d3-shape/blob/master/README.md#curveCardinal_tension); for Catmull–Rom splines, [alpha](https://github.com/d3/d3-shape/blob/master/README.md#curveCatmullRom_alpha).

…

## Formats

These helper functions are provided for use as a *scale*.tickFormat [axis option](#position-options), as the text option for [Plot.text](#plottextdata-options), or for general use. See also [d3-time-format](https://github.com/d3/d3-time-format) and JavaScript’s built-in [date formatting](https://observablehq.com/@mbostock/date-formatting) and [number formatting](https://observablehq.com/@mbostock/number-formatting).

#### Plot.formatIsoDate(*date*)

…

#### Plot.formatWeekday(*locale*, *format*)

…

#### Plot.formatMonth(*locale*, *format*)

…
