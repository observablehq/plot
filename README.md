# Observable Plot

**Observable Plot** is a JavaScript library for exploratory data visualization.

* [Introduction](https://observablehq.com/@data-workflows/plot)
* [Installing](#installing)
* [API Reference](#api-reference)
* [Contributing](./CONTRIBUTING.md)

## Installing

Plot can be imported into an Observable notebook like so:

```js
import {Plot} from "@observablehq/plot"
```

In Node.js, Plot is typically first installed via a package manager such as Yarn or npm.

```bash
yarn add @observablehq/plot
```

Plot can then be imported as a namespace:

```js
import * as Plot from "@observablehq/plot";
```

In modern browsers, Plot can be imported as an ES module, say from Skypack:

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

## API Reference

### Plot.plot(*options*)

Renders a new plot given the specified *options* and returns the corresponding SVG or HTML figure element. All *options* are optional.

#### Mark options

The **marks** option specifies an array of [marks](#marks) to render. Each mark has its own data and options; see the respective mark type (*e.g.*, [Plot.barY](#plotbarydata-options) or [Plot.dot](#plotdotdata-options)) for which mark options are supported. Marks are drawn in *z*-order, last on top. For example, here bars for the dataset *alphabet* are drawn on top of a single rule at *y* = 0.

```js
Plot.plot({
  marks: [
    Plot.ruleY([0]),
    Plot.barY(alphabet, {x: "letter", y: "frequency"})
  ]
})
```

Each mark may also be a nested array of marks, allowing composition.

#### Layout options

These options determine the overall layout of the plot; all are specified as numbers in pixels:

* **marginTop** - the top margin
* **marginRight** - the right margin
* **marginBottom** - the bottom margin
* **marginLeft** - the left margin
* **width** - the outer width of the plot (including margins)
* **height** - the outer height of the plot (including margins)

The default **width** is 640. On Observable, the width can be set to the [standard width](https://github.com/observablehq/stdlib/blob/master/README.md#width) to make responsive plots. The default **height** is 396 if the plot has a *y* or *fy* scale; otherwise it is 90 if the plot has an *fx* scale, or 60 if it does not. (The default height will be getting smarter for ordinal domains; see [#337](https://github.com/observablehq/plot/pull/337).)

The default margins depend on the plot’s axes: for example, the top and bottom margins are at least 30 if there is a corresponding top or bottom *x* axis, and the left and right margins are at least 40 if there is a corresponding left or right *y* axis. For simplicity’s sake and for consistent layout across plots, margins are not automatically sized to make room for tick labels; instead, shorten your tick labels or increase the margins as needed. (In the future, margins may be specified indirectly via a scale property to make it easier to reorient axes without adjusting margins; see [#210](https://github.com/observablehq/plot/issues/210).)

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

If a **caption** is specified, then Plot.plot wraps the generated SVG element in an HTML figure element with a figcaption, returning the figure. To specify an HTML caption, consider using the [`html` tagged template literal](http://github.com/observablehq/htl); otherwise, the specified string represents text that will be escaped as needed.

```js
Plot.plot({
  marks: …,
  caption: html`Figure 1. This chart has a <i>fancy</i> caption.`
})
```

#### Scale options

Plot passes data through [scales](https://observablehq.com/@data-workflows/plot-scales) before rendering marks. A scale maps abstract values such as time or temperature to visual values such as position or color. Within a given plot, marks share scales. For example, if a plot has two Plot.line marks, both share the same *x* and *y* scales for a consistent representation of data. (Plot does not currently support dual-axis charts, which are [not advised](https://blog.datawrapper.de/dualaxis/).)

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

The default range depends on the scale: for [position scales](#position-options) (*x*, *y*, *fx*, and *fy*), the default range depends on the plot’s [size and margins](#layout-options); for [color scales](#color-options), there are default color schemes for quantitative, ordinal, and categorical data; for opacity, the default range is [0, 1]; and for radius, the default range is designed to produce dots of reasonable size.

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

#### Position options

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

#### Color options

The normal scale types — *linear*, *sqrt*, *pow*, *log*, *symlog*, and *ordinal* — can be used to encode color and default to the *turbo* scheme. In addition, Plot supports special scale types for encoding data as color:

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

Or to use gamma-corrected RGB:

```js
Plot.plot({
  color: {
    range: ["red", "blue"],
    interpolate: d3.interpolateRgb.gamma(2.2)
  },
  marks: …
})
```

#### Facet options

The *facet* option enables faceting. When faceting, two additional band scales may be configured:

* **fx** - facet (horizontal) *x*-position
* **fy** - facet (vertical) *y*-position

The following *facet* options are supported:

* facet.**data** -
* facet.**x** -
* facet.**y** -
* facet.**marginTop** -
* facet.**marginRight** -
* facet.**marginBottom** -
* facet.**marginLeft** -
* facet.**grid** -

### Marks

Marks visualize data as geometric shapes such as bars, dots, and lines. An single mark can generate multiple shapes: for example, passing a [Plot.barY](#plotbarydata-options) to [Plot.plot](#plotplotoptions) will produce a bar for each element in the associated data.

Mark constructors take two arguments: **data** and **options**. Together, the *data* and *options* describe a tabular dataset and how to visualize it. Options that are shared by all of a mark’s generated shapes are known as *constants*, while options that vary with the mark’s data are known as *channels*. Channels are typically specified as abstract values such as time or temperature rather than visual values such as position or color; this is because most channels are bound to [scales](#scale-options).

A mark’s *data* is commonly an array of objects representing a tabular dataset, such as the result of loading a CSV file, while *options* binds mark channels (such as *x* and *y*) to named columns in the data (such as *units* and *fruit*).

```js
Plot.plot({
  marks: [
    Plot.dot(
      [
        {units: 10, fruit: "fig"},
        {units: 20, fruit: "date"},
        {units: 40, fruit: "plum"},
        {units: 30, fruit: "plum"}
      ],
      {
        x: "units",
        y: "fruit"
      }
    )
  ]
})
```

Channels can also be specified as functions, affording greater flexibility if your data is not structured in a way that is so readily visualized, or if you want to visualize computed values. Channel functions are invoked for each datum (*d*) in the data and return the corresponding channel value. (This is similar to how D3’s [*selection*.attr](https://github.com/d3/d3-selection/blob/master/README.md#selection_attr) accepts functions, though note that Plot channel functions should return abstract values, not visual values.)

```js
Plot.plot({
  marks: [
    Plot.dot(
      [
        {units: 10, fruit: "fig"},
        {units: 20, fruit: "date"},
        {units: 40, fruit: "plum"},
        {units: 30, fruit: "plum"}
      ],
      {
        x: d => d.units,
        y: d => d.fruit
      }
    )
  ]
})
```

Plot also supports columnar data; for example, data can be specified as an object `{length}` (or any iterable or value compatible with [Array.from](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)), and then arrays of values can be passed as individual *options*.

```js
Plot.plot({
  marks: [
    Plot.dot(
      {length: 4},
      {
        x: [10, 20, 40, 30],
        y: ["fig", "date", "plum", "plum"]
      }
    )
  ]
})
```


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

#### Plot.area(*data*, *options*)

[Source](./src/area.js) · [Examples](https://observablehq.com/@data-workflows/plot-area) · The area mark draws the region formed by a baseline (*x1*, *y1*) and a topline (*x2*, *y2*), as in an area chart. It is rarely used directly; [Plot.areaY](#plotareaydata-options) tends to be used instead, or less commonly [Plot.areaX](#plotareaxdata-options).

The following channels are required:

* **x1** - the horizontal position of the baseline; bound to the *x* scale
* **y1** - the vertical position of the baseline; bound to the *y* scale
* **x2** - the horizontal position of the topline; bound to the *x* scale
* **y2** - the vertical position of the topline; bound to the *y* scale

The following channels are optional:

* **z** - an ordinal value to group data into series
* **fill** - a fill color per series
* **fillOpacity** - a fill opacity per series (a number between 0 and 1)
* **stroke** - a stroke color per series
* **strokeOpacity** - a stroke opacity per series (a number between 0 and 1)
* **title** - a tooltip per series (a string of text, possibly with newlines)

To distinguish a *fill* channel from a constant *fill*, the area mark tests whether the provided *fill* is a valid CSS color;

In addition to the [standard style options](#marks), the following additional options are supported:

* **curve** -
* **tension** -

The following curves are supported:

* *basis* -
* *basis-open* -
* *bump-x* -
* *bump-y* -
* *cardinal* -
* *cardinal-open* -
* *catmull-rom* -
* *catmull-rom-open* -
* *linear* -
* *monotone-x* -
* *monotone-y* -
* *natural* -
* *step* -
* *step-after* -
* *step-before* -

The tension option only has an effect on the *cardinal*, *cardinal-open*, *catmull-rom*, and *catmull-rom-open* curves.

#### Plot.areaX(*data*, *options*)

Equivalent to [Plot.area](#plotareadata-options), except…

#### Plot.areaY(*data*, *options*)

Equivalent to [Plot.area](#plotareadata-options), except…

#### Plot.barX(*data*, *options*)

…

#### Plot.barY(*data*, *options*)

…

#### Plot.cell(*data*, *options*)

…

#### Plot.cellX(*data*, *options*)

…

#### Plot.cellY(*data*, *options*)

…

#### Plot.dot(*data*, *options*)

…

#### Plot.dotX(*data*, *options*)

…

#### Plot.dotY(*data*, *options*)

…

#### Plot.line(*data*, *options*)

…

#### Plot.lineX(*data*, *options*)

…

#### Plot.lineY(*data*, *options*)

…

#### Plot.link(*data*, *options*)

…

#### Plot.rect(*data*, *options*)

…

#### Plot.rectX(*data*, *options*)

…

#### Plot.rectY(*data*, *options*)

…

#### Plot.ruleX(*data*, *options*)

…

#### Plot.ruleY(*data*, *options*)

…

#### Plot.text(*data*, *options*)

…

#### Plot.textX(*data*, *options*)

…

#### Plot.textY(*data*, *options*)

…

#### Plot.tickX(*data*, *options*)

…

#### Plot.tickY(*data*, *options*)

…

### Transforms

#### Plot.bin(*outputs*, *options*)

…

#### Plot.binX(*outputs*, *options*)

…

#### Plot.binY(*outputs*, *options*)

…

#### Plot.group(*outputs*, *options*)

…

#### Plot.groupX(*outputs*, *options*)

…

#### Plot.groupY(*outputs*, *options*)

…

#### Plot.groupZ(*outputs*, *options*)

…

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

#### Plot.stackX(*options*)

…

#### Plot.stackX1(*options*)

…

#### Plot.stackX2(*options*)

…

#### Plot.stackY(*options*)

…

#### Plot.stackY1(*options*)

…

#### Plot.stackY2(*options*)

…

#### Plot.windowX(*options*)

…

#### Plot.windowY(*options*)

…

### Decorations

Decorations are special mark types that do not represent data, but are still used to draw on the plot. Currently this includes only [Plot.frame](#plotframeoptions), although internally Plot’s axes are implemented as decoration marks and may in the future be exposed here for more flexible configuration.

#### Plot.frame(*options*)

…

### Formats

These helper functions are provided for use as a *scale*.tickFormat [axis option](#position-options), as the text option for [Plot.text](#plottextdata-options), or for general use. See also [d3-time-format](https://github.com/d3/d3-time-format) and JavaScript’s built-in [date formatting](https://observablehq.com/@mbostock/date-formatting) and [number formatting](https://observablehq.com/@mbostock/number-formatting).

#### Plot.formatIsoDate(*date*)

…

#### Plot.formatWeekday(*locale*, *format*)

…

#### Plot.formatMonth(*locale*, *format*)

…
