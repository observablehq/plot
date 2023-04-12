# Observable Plot

<img src="./img/plot.svg" width="320" alt="The Observable Plot logo, spelling out the letters P-L-O-T in pastel shapes.">

**Observable Plot** is a JavaScript library for exploratory data visualization. If you are new to Plot, we highly recommend first reading these notebooks to introduce Plot’s core concepts such as *marks* and *scales*:

* [Introduction](https://observablehq.com/@observablehq/plot?collection=@observablehq/plot) - a quick tour, and Plot’s motivations
* [Marks and Channels](https://observablehq.com/@observablehq/plot-marks?collection=@observablehq/plot) - drawing data-driven shapes with Plot
* [Scales](https://observablehq.com/@observablehq/plot-scales?collection=@observablehq/plot) - visual encodings for abstract data
* [Axes](https://observablehq.com/@observablehq/plot-axes?collection=@observablehq/plot) - documenting position encodings
* [Transforms](https://observablehq.com/@observablehq/plot-transforms?collection=@observablehq/plot) - deriving data
* [Facets](https://observablehq.com/@observablehq/plot-facets?collection=@observablehq/plot) - small multiples
* [Legends](https://observablehq.com/@observablehq/plot-legends?collection=@observablehq/plot) - documenting other visual encodings
* [Mapping](https://observablehq.com/@observablehq/plot-mapping?collection=@observablehq/plot) - creating maps with geometries and projections

This README is intended as a technical reference for Plot’s API. For more, please see:

* [Cheatsheets](https://observablehq.com/@observablehq/plot-cheatsheets) - a handy, interactive guide
* [Changelog](./CHANGELOG.md) - release notes
* [Contributing](./CONTRIBUTING.md) - if you’d like to help build Plot
* [Discussions](https://github.com/observablehq/plot/discussions) - if you’d like help
* [Forum](https://talk.observablehq.com/c/help/6) - another place to ask for help
* [Issues](https://github.com/observablehq/plot/issues) - to file a bug or request a new feature

## Installing

In Observable notebooks, Plot and D3 are available by default as part of the [standard library](https://observablehq.com/@observablehq/recommended-libraries).

For use with Webpack, Rollup, or other Node-based bundlers, Plot is typically installed via a package manager such as Yarn or npm. (Plot is distributed as an ES module; see [Sindre Sorhus’s guide](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) for help upgrading.)

```bash
yarn add @observablehq/plot
```

Plot can then be imported as a namespace:

```js
import * as Plot from "@observablehq/plot";
```

In vanilla HTML, Plot can be imported as an ES module, say from jsDelivr:

```html
<script type="module">

import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

document.body.append(Plot.plot(options));

</script>
```

Plot is also available as a UMD bundle for legacy browsers.

```html
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script src="https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6"></script>
<script>

document.body.append(Plot.plot(options));

</script>
```

See also our [Plot + React example](https://github.com/observablehq/plot-create-react-app-example/blob/main/src/App.js).

## Plot.plot(*options*)

Renders a new plot given the specified *options* and returns the corresponding SVG or HTML figure element. All *options* are optional.

### Mark options

The **marks** option specifies an array of [marks](#marks) to render. Each mark has its own data and options; see the respective mark type (*e.g.*, [bar](#bar) or [dot](#dot)) for which mark options are supported. Each mark may be a nested array of marks, allowing composition. Marks may also be a function which returns an SVG element, if you wish to insert some arbitrary content into your plot. And marks may be null or undefined, which produce no output; this is useful for showing marks conditionally (*e.g.*, when a box is checked). Marks are drawn in *z* order, last on top. For example, here a single rule at *y* = 0 is drawn on top of blue bars for the [*alphabet* dataset](./test/data/alphabet.csv).

```js
Plot.plot({
  marks: [
    Plot.barY(alphabet, {x: "letter", y: "frequency", fill: "steelblue"}),
    Plot.ruleY([0])
  ]
})
```

### Layout options

These options determine the overall layout of the plot; all are specified as numbers in pixels:

* **marginTop** - the top margin
* **marginRight** - the right margin
* **marginBottom** - the bottom margin
* **marginLeft** - the left margin
* **margin** - shorthand for the four margins
* **width** - the outer width of the plot (including margins)
* **height** - the outer height of the plot (including margins)
* **aspectRatio** - the desired aspect ratio of data (affecting default **height**)

The default **width** is 640. On Observable, the width can be set to the [standard width](https://github.com/observablehq/stdlib/blob/main/README.md#width) to make responsive plots. The default **height** is chosen automatically based on the plot’s associated scales; for example, if *y* is linear and there is no *fy* scale, it might be 396. The default margins depend on the maximum margins of the plot’s constituent [marks](#mark-options). While most marks default to zero margins (because they are drawn inside the chart area), Plot’s [axis mark](#axis) has non-zero default margins.

The **aspectRatio** option, if not null, computes a default **height** such that a variation of one unit in the *x* dimension is represented by the corresponding number of pixels as a variation in the *y* dimension of one unit. Note: when using facets, set the *fx* and *fy* scales’ **round** option to false if you need an exact aspect ratio.

The **style** option allows custom styles to override Plot’s defaults. It may be specified either as a string of inline styles (*e.g.*, `"color: red;"`, in the same fashion as assigning [*element*.style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)) or an object of properties (*e.g.*, `{color: "red"}`, in the same fashion as assigning [*element*.style properties](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration)). Note that unitless numbers ([quirky lengths](https://www.w3.org/TR/css-values-4/#deprecated-quirky-length)) such as `{padding: 20}` may not be supported by some browsers; you should instead specify a string with units such as `{padding: "20px"}`. By default, the returned plot has a white background, a max-width of 100%, and the system-ui font. Plot’s marks and axes default to [currentColor](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#currentcolor_keyword), meaning that they will inherit the surrounding content’s color. For example, a dark theme:

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

The generated SVG element has a random class name which applies a default stylesheet. Use the top-level **className** option to specify that class name.

The **document** option specifies the [document](https://developer.mozilla.org/en-US/docs/Web/API/Document) used to create plot elements. It defaults to window.document, but can be changed to another document, say when using a virtual DOM library for server-side rendering in Node.

### Scale options

Plot passes data through [scales](https://observablehq.com/@observablehq/plot-scales) as needed before rendering marks. A scale maps abstract values such as time or temperature to visual values such as position or color. Within a given plot, marks share scales. For example, if a plot has two Plot.line marks, both share the same *x* and *y* scales for a consistent representation of data. (Plot does not currently support dual-axis charts, which are [not advised](https://blog.datawrapper.de/dualaxis/).)

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
* **length** - linear length (for [vectors](#vector))
* **symbol** - categorical symbol (for [dots](#dot))

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

Plot supports many scale types. Some scale types are for quantitative data: values that can be added or subtracted, such as temperature or time. Other scale types are for ordinal or categorical data: unquantifiable values that can only be ordered, such as t-shirt sizes, or values with no inherent order that can only be tested for equality, such as types of fruit. Some scale types are further intended for specific visual encodings: for example, as [position](#position-options) or [color](#color-options).

You can set the scale type explicitly via the *scale*.**type** option, though typically the scale type is inferred automatically. Some marks mandate a particular scale type: for example, [Plot.barY](#plotbarydata-options) requires that the *x* scale is a *band* scale. Some scales have a default type: for example, the *radius* scale defaults to *sqrt* and the *opacity* scale defaults to *linear*. Most often, the scale type is inferred from associated data, pulled either from the domain (if specified) or from associated channels. Strings and booleans imply an ordinal scale; dates imply a UTC scale; and anything else is linear. Unless they represent text, we recommend explicitly converting strings to more specific types when loading data (*e.g.*, with d3.autoType or Observable’s FileAttachment). For simplicity’s sake, Plot assumes that data is consistently typed; type inference is based solely on the first non-null, non-undefined value.

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

You can opt-out of a scale using the *identity* scale type. This is useful if you wish to specify literal colors or pixel positions within a mark channel rather than relying on the scale to convert abstract values into visual values. For position scales (*x* and *y*), an *identity* scale is still quantitative and may produce an axis, yet unlike a *linear* scale the domain and range are fixed based on the plot layout. (To opt out of a scale for a single channel, you can specify the channel values as a {value, scale} object; see [mark options](#mark-options).)

Quantitative scales, as well as identity position scales, coerce channel values to numbers; both null and undefined are coerced to NaN. Similarly, time scales coerce channel values to dates; numbers are assumed to be milliseconds since UNIX epoch, while strings are assumed to be in [ISO 8601 format](https://github.com/mbostock/isoformat/blob/main/README.md#parsedate-fallback).

A scale’s domain (the extent of its inputs, abstract values) and range (the extent of its outputs, visual values) are typically inferred automatically. You can set them explicitly using these options:

* *scale*.**domain** - typically [*min*, *max*], or an array of ordinal or categorical values
* *scale*.**range** - typically [*min*, *max*], or an array of ordinal or categorical values
* *scale*.**unknown** - the desired output value (defaults to undefined) for invalid input values
* *scale*.**reverse** - reverses the domain (or in somes cases, the range), say to flip the chart along *x* or *y*
* *scale*.**interval** - an interval or time interval (for interval data; see below)

For most quantitative scales, the default domain is the [*min*, *max*] of all values associated with the scale. For the *radius* and *opacity* scales, the default domain is [0, *max*] to ensure a meaningful value encoding. For ordinal scales, the default domain is the set of all distinct values associated with the scale in natural ascending order; for a different order, set the domain explicitly or add a [sort option](#sort-options) to an associated mark. For threshold scales, the default domain is [0] to separate negative and non-negative values. For quantile scales, the default domain is the set of all defined values associated with the scale. If a scale is reversed, it is equivalent to setting the domain as [*max*, *min*] instead of [*min*, *max*].

The default range depends on the scale: for [position scales](#position-options) (*x*, *y*, *fx*, and *fy*), the default range depends on the plot’s [size and margins](#layout-options). For [color scales](#color-options), there are default color schemes for quantitative, ordinal, and categorical data. For opacity, the default range is [0, 1]. And for radius, the default range is designed to produce dots of “reasonable” size assuming a *sqrt* scale type for accurate area representation: zero maps to zero, the first quartile maps to a radius of three pixels, and other values are extrapolated. This convention for radius ensures that if the scale’s data values are all equal, dots have the default constant radius of three pixels, while if the data varies, dots will tend to be larger.

The behavior of the *scale*.**unknown** option depends on the scale type. For quantitative and temporal scales, the unknown value is used whenever the input value is undefined, null, or NaN. For ordinal or categorical scales, the unknown value is returned for any input value outside the domain. For band or point scales, the unknown option has no effect; it is effectively always equal to undefined. If the unknown option is set to undefined (the default), or null or NaN, then the affected input values will be considered undefined and filtered from the output.

For data at regular intervals, such as integer values or daily samples, the *scale*.**interval** option can be used to enforce uniformity. The specified *interval*—such as d3.utcMonth—must expose an *interval*.floor(*value*), *interval*.offset(*value*), and *interval*.range(*start*, *stop*) functions. The option can also be specified as a number, in which case it will be promoted to a numeric interval with the given step. The option can alternatively be specified as a string (*second*, *minute*, *hour*, *day*, *week*, *month*, *quarter*, *half*, *year*, *monday*, *tuesday*, *wednesday*, *thursday*, *friday*, *saturday*, *sunday*) naming the corresponding UTC interval. This option sets the default *scale*.transform to the given interval’s *interval*.floor function. In addition, the default *scale*.domain is an array of uniformly-spaced values spanning the extent of the values associated with the scale.

Quantitative scales can be further customized with additional options:

* *scale*.**clamp** - if true, clamp input values to the scale’s domain
* *scale*.**nice** - if true (or a tick count), extend the domain to nice round values
* *scale*.**zero** - if true, extend the domain to include zero if needed
* *scale*.**percent** - if true, transform proportions in [0, 1] to percentages in [0, 100]

Clamping is typically used in conjunction with setting an explicit domain since if the domain is inferred, no values will be outside the domain. Clamping is useful for focusing on a subset of the data while ensuring that extreme values remain visible, but use caution: clamped values may need an annotation to avoid misinterpretation. Top-level **clamp**, **nice**, and **zero** options are supported as shorthand for setting the respective option on all scales.

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

#### *plot*.scale(*scaleName*)

Scale definitions can be exposed through the *plot*.**scale**(*scaleName*) function of a returned plot. The *scaleName* must be one of the known scale names: `"x"`, `"y"`, `"fx"`, `"fy"`, `"r"`, `"color"`, `"opacity"`, `"symbol"`, or `"length"`. If the associated *plot* has no scale with the given *scaleName*, returns undefined.

```js
const plot = Plot.plot(…); // render a plot
const color = plot.scale("color"); // retrieve the color scale object
console.log(color.range); // inspect the color scale’s range, ["red", "blue"]
```

#### Plot.scale(*options*)

You can also create a standalone scale with Plot.**scale**(*options*). The *options* object must define at least one scale; see [Scale options](#scale-options) for how to define a scale. For example, here is a linear color scale with the default domain of [0, 1] and default scheme *turbo*:

```js
const color = Plot.scale({color: {type: "linear"}});
```

#### Scale objects

Both [*plot*.scale](#plotscalescalename) and [Plot.scale](#plotscaleoptions) return scale objects. These objects represent the actual (or “materialized”) scale options used by Plot, including the domain, range, interpolate function, *etc.* The scale’s label, if any, is also returned; however, note that other axis properties are not currently exposed. Point and band scales also expose their materialized bandwidth and step.

To reuse a scale across plots, pass the corresponding scale object into another plot specification:

```js
const plot1 = Plot.plot(…);
const plot2 = Plot.plot({…, color: plot1.scale("color")});
```

For convenience, scale objects expose a *scale*.**apply**(*input*) method which returns the scale’s output for the given *input* value. When applicable, scale objects also expose a *scale*.**invert**(*output*) method which returns the corresponding input value from the scale’s domain for the given *output* value.

### Position options

The position scales (*x*, *y*, *fx*, and *fy*) support additional options:

* *scale*.**inset** - inset the default range by the specified amount in pixels
* *scale*.**round** - round the output value to the nearest integer (whole pixel)

The *x* and *fx* scales support asymmetric insets for more precision. Replace inset by:

* *scale*.**insetLeft** - insets the start of the default range by the specified number of pixels
* *scale*.**insetRight** - insets the end of the default range by the specified number of pixels

Similarly, the *y* and *fy* scales support asymmetric insets with:

* *scale*.**insetTop** - insets the top of the default range by the specified number of pixels
* *scale*.**insetBottom** - insets the bottom of the default range by the specified number of pixels

The inset scale options can provide “breathing room” to separate marks from axes or the plot’s edge. For example, in a scatterplot with a Plot.dot with the default 3-pixel radius and 1.5-pixel stroke width, an inset of 5 pixels prevents dots from overlapping with the axes. The *scale*.round option is useful for crisp edges by rounding to the nearest pixel boundary.

In addition to the generic *ordinal* scale type, which requires an explicit output range value for each input domain value, Plot supports special *point* and *band* scale types for encoding ordinal data as position. These scale types accept a [*min*, *max*] range similar to quantitative scales, and divide this continuous interval into discrete points or bands based on the number of distinct values in the domain (*i.e.*, the domain’s cardinality). If the associated marks have no effective width along the ordinal dimension—such as a dot, rule, or tick—then use a *point* scale; otherwise, say for a bar, use a *band* scale. In the image below, the top *x* scale is a *point* scale while the bottom *x* scale is a *band* scale; see [Plot: Scales](https://observablehq.com/@observablehq/plot-scales) for an interactive version.

<img src="./img/point-band.png" width="640" alt="point and band scales">

Ordinal position scales support additional options, all specified as proportions in [0, 1]:

* *scale*.**padding** - how much of the range to reserve to inset first and last point or band
* *scale*.**align** - where to distribute points or bands (0 = at start, 0.5 = at middle, 1 = at end)

For a *band* scale, you can further fine-tune padding:

* *scale*.**paddingInner** - how much of the range to reserve to separate adjacent bands
* *scale*.**paddingOuter** - how much of the range to reserve to inset first and last band

Align defaults to 0.5 (centered). Band scale padding defaults to 0.1 (10% of available space reserved for separating bands), while point scale padding defaults to 0.5 (the gap between the first point and the edge is half the distance of the gap between points, and likewise for the gap between the last point and the opposite edge). Note that rounding and mark insets (e.g., for bars and rects) also affect separation between adjacent marks.

Plot automatically generates [axis](#axis) and optionally [grid](#grid) marks for position scales. (For more control, declare these marks explicitly.) You can configure the implicit axes with the following scale options:

* *scale*.**axis** - the orientation: *top* or *bottom* (or *both*) for *x* and *fx*; *left* or *right* (or *both*) for *y* and *fy*; null to suppress
* *scale*.**ticks** - the approximate number of ticks to generate, or interval, or array of values
* *scale*.**tickSize** - the length of each tick (in pixels; default 6 for *x* and *y*, or 0 for *fx* and *fy*)
* *scale*.**tickSpacing** - the approximate number of pixels between ticks (if *scale*.**ticks** is not specified)
* *scale*.**tickPadding** - the separation between the tick and its label (in pixels; default 3)
* *scale*.**tickFormat** - either a function or specifier string to format tick values; see [Formats](#formats)
* *scale*.**tickRotate** - whether to rotate tick labels (an angle in degrees clockwise; default 0)
* *scale*.**grid** - whether to draw grid lines across the plot for each tick
* *scale*.**line** - if true, draw the axis line (only for *x* and *y*)
* *scale*.**label** - a string to label the axis
* *scale*.**labelAnchor** - the label anchor: *top*, *right*, *bottom*, *left*, or *center*
* *scale*.**labelOffset** - the label position offset (in pixels; default depends on margins and orientation)
* *scale*.**fontVariant** - the font-variant attribute for axis ticks; defaults to tabular-nums for quantitative axes
* *scale*.**ariaLabel** - a short label representing the axis in the accessibility tree
* *scale*.**ariaDescription** - a textual description for the axis

Top-level options are also supported as shorthand: **grid** (for *x* and *y* only; see [facet.grid](#facet-options)), **label**, **axis**, **inset**, **round**, **align**, and **padding**. If the **grid** option is true, show a grid with the currentColor stroke; if specified as a string, show a grid with the specified stroke color; if an approximate number of ticks, an interval, or an array of tick values, show corresponding grid lines.

### Projection options

The top-level **projection** option applies a two-dimensional (often geographic) projection in place of *x* and *y* scales. It is typically used in conjunction with a [geo mark](#geo) to produce a map, but can be used with any mark that supports *x* and *y* channels, such as [dot](#dot), [text](#text), [arrow](#arrow), and [rect](#rect). For marks that use *x1*, *y1*, *x2*, and *y2* channels, the two projected points are ⟨*x1*, *y1*⟩ and ⟨*x2*, *y2*⟩; otherwise, the projected point is ⟨*x*, *y*⟩. The following built-in named projections are supported:

* *equirectangular* - the equirectangular, or *plate carrée*, projection
* *orthographic* - the orthographic projection
* *stereographic* - the stereographic projection
* *mercator* - the Mercator projection
* *equal-earth* - the [Equal Earth projection](https://en.wikipedia.org/wiki/Equal_Earth_projection) by Šavrič *et al.*
* *azimuthal-equal-area* - the azimuthal equal-area projection
* *azimuthal-equidistant* - the azimuthal equidistant projection
* *conic-conformal* - the conic conformal projection
* *conic-equal-area* - the conic equal-area projection
* *conic-equidistant* - the conic equidistant projection
* *gnomonic* - the gnomonic projection
* *transverse-mercator* - the transverse Mercator projection
* *albers* - the Albers’ conic equal-area projection
* *albers-usa* - a composite Albers conic equal-area projection suitable for the United States
* *identity* - the identity projection for planar geometry
* *reflect-y* - like the identity projection, but *y* points up
* null (default) - the null projection for pre-projected geometry in screen coordinates

In addition to these named projections, the **projection** option may be specified as a [D3 projection](https://github.com/d3/d3-geo/blob/main/README.md#projections), or any custom projection that implements [*projection*.stream](https://github.com/d3/d3-geo/blob/main/README.md#projection_stream), or a function that receives a configuration object ({width, height, ...options}) and returns such a projection. In the last case, the width and height represent the frame dimensions minus any insets.

If the **projection** option is specified as an object, the following additional projection options are supported:

* projection.**type** - one of the projection names above
* projection.**parallels** - the [standard parallels](https://github.com/d3/d3-geo/blob/main/README.md#conic_parallels) (for conic projections only)
* projection.**precision** - the [sampling threshold](https://github.com/d3/d3-geo/blob/main/README.md#projection_precision)
* projection.**rotate** - a two- or three- element array of Euler angles to rotate the sphere
* projection.**domain** - a GeoJSON object to fit in the center of the (inset) frame
* projection.**inset** - inset by the given amount in pixels when fitting to the frame (default zero)
* projection.**insetLeft** - inset from the left edge of the frame (defaults to inset)
* projection.**insetRight** - inset from the right edge of the frame (defaults to inset)
* projection.**insetTop** - inset from the top edge of the frame (defaults to inset)
* projection.**insetBottom** - inset from the bottom edge of the frame (defaults to inset)
* projection.**clip** - the projection clipping method

The following projection clipping methods are supported for projection.**clip**:

* *frame* or true (default) - clip to the extent of the frame (including margins but not insets)
* a number - clip to a great circle of the given radius in degrees centered around the origin
* null or false - do not clip

Whereas the mark.**clip** option is implemented using SVG clipping, the projection.**clip** option affects the generated geometry and typically produces smaller SVG output.

### Color options

The normal scale types—*linear*, *sqrt*, *pow*, *log*, *symlog*, and *ordinal*—can be used to encode color. In addition, Plot supports special scale types for color:

* *categorical* - equivalent to *ordinal*, but defaults to the *tableau10* scheme
* *sequential* - equivalent to *linear*
* *cyclical* - equivalent to *linear*, but defaults to the *rainbow* scheme
* *threshold* - encodes based on the specified discrete thresholds; defaults to the *rdylbu* scheme
* *quantile* - encodes based on the computed quantile thresholds; defaults to the *rdylbu* scheme
* *quantize* - transforms a continuous domain into quantized thresholds; defaults to the *rdylbu* scheme
* *diverging* - like *linear*, but with a pivot; defaults to the *rdbu* scheme
* *diverging-log* - like *log*, but with a pivot that defaults to 1; defaults to the *rdbu* scheme
* *diverging-pow* - like *pow*, but with a pivot; defaults to the *rdbu* scheme
* *diverging-sqrt* - like *sqrt*, but with a pivot; defaults to the *rdbu* scheme
* *diverging-symlog* - like *symlog*, but with a pivot; defaults to the *rdbu* scheme

For a *threshold* scale, the *domain* represents *n* (typically numeric) thresholds which will produce a *range* of *n* + 1 output colors; the *i*th color of the *range* applies to values that are smaller than the *i*th element of the domain and larger or equal to the *i* - 1th element of the domain. For a *quantile* scale, the *domain* represents all input values to the scale, and the *n* option specifies how many quantiles to compute from the *domain*; *n* quantiles will produce *n* - 1 thresholds, and an output range of *n* colors. For a *quantize* scale, the domain will be transformed into approximately *n* quantized values, where *n* is an option that defaults to 5.

By default, all diverging color scales are symmetric around the pivot; set *symmetric* to false if you want to cover the whole extent on both sides.

Color scales support two additional options:

* *scale*.**scheme** - a named color scheme in lieu of a range, such as *reds*
* *scale*.**interpolate** - in conjunction with a range, how to interpolate colors

For quantile and quantize color scales, the *scale*.scheme option is used in conjunction with *scale*.**n**, which determines how many quantiles or quantized values to compute, and thus the number of elements in the scale’s range; it defaults to 5 (for quintiles in the case of a quantile scale).

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

The default color scheme, *turbo*, was chosen primarily to ensure high-contrast visibility. Color schemes such as *blues* make low-value marks difficult to see against a white background, for better or for worse. To use a subset of a continuous color scheme (or any single-argument *interpolate* function), set the *scale*.range property to the corresponding subset of [0, 1]; for example, to use the first half of the *rainbow* color scheme, use a range of [0, 0.5]. By default, the full range [0, 1] is used. If you wish to encode a quantitative value without hue, consider using *opacity* rather than *color* (e.g., use Plot.dot’s *strokeOpacity* instead of *stroke*).

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

Picking a diverging color scheme name defaults the scale type to *diverging*; set the scale type to *linear* to treat the color scheme as sequential instead. Diverging color scales support a *scale*.**pivot** option, which defaults to zero. Values below the pivot will use the lower half of the color scheme (*e.g.*, reds for the *rdgy* scheme), while values above the pivot will use the upper half (grays for *rdgy*).

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

### Sort options

If an ordinal scale’s domain is not set, it defaults to natural ascending order; to order the domain by associated values in another dimension, either compute the domain manually (consider [d3.groupSort](https://github.com/d3/d3-array/blob/main/README.md#groupSort)) or use an associated mark’s **sort** option. For example, to sort bars by ascending frequency rather than alphabetically by letter:

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y"}})
```

The sort option is an object whose keys are ordinal scale names, such as *x* or *fx*, and whose values are mark channel names, such as *y*, *y1*, or *y2*. By specifying an existing channel rather than a new value, you avoid repeating the order definition and can refer to channels derived by [transforms](#transforms) (such as [stack](#stack) or [bin](#bin)). When sorting on the *x*, if no such channel is defined, the *x2* channel will be used instead if available, and similarly for *y* and *y2*; this is useful for marks that implicitly stack such as [area](#area), [bar](#bar), and [rect](#rect). A sort value may also be specified as *width* or *height*, representing derived channels |*x2* - *x1*| and |*y2* - *y1*| respectively.

Note that there may be multiple associated values in the secondary dimension for a given value in the primary ordinal dimension. The secondary values are therefore grouped for each associated primary value, and each group is then aggregated by applying a reducer. Lastly the primary values are sorted based on the associated reduced value in natural ascending order to produce the domain. The default reducer is *max*, but may be changed by specifying the *reduce* option. The above code is shorthand for:

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", reduce: "max"}})
```

Generally speaking, a reducer only needs to be specified when there are multiple secondary values for a given primary value. See the [group transform](#group) for the list of supported reducers.

For descending rather than ascending order, use the *reverse* option:

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", reverse: true}})
```

An additional *limit* option truncates the domain to the first *n* values after sorting. If *limit* is negative, the last *n* values are used instead. Hence, a positive *limit* with *reverse* = true will return the top *n* values in descending order. If *limit* is an array [*lo*, *hi*], the *i*th values with *lo* ≤ *i* < *hi* will be selected. (Note that like the [basic filter transform](#transforms), limiting the *x* domain here does not affect the computation of the *y* domain, which is computed independently without respect to filtering.)

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", limit: 5}})
```

If different sort options are needed for different ordinal scales, the channel name can be replaced with a *value* object with additional per-scale options.

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: {value: "y", reverse: true}}})
```

If the input channel is *data*, then the reducer is passed groups of the mark’s data; this is typically used in conjunction with a custom reducer function, as when the built-in single-channel reducers are insufficient.

Note: when the value of the sort option is a string or a function, it is interpreted as a [basic sort transform](#transforms). To use both sort options and a sort transform, use [Plot.sort](#plotsortorder-options).

### Facet options

Plot’s [faceting system](https://observablehq.com/@observablehq/plot-facets) produces small multiples by partitioning data in discrete sets and repeating the plot for each set. When faceting, two additional band scales may be configured:

* *fx* - the horizontal position, a *band* scale
* *fy* - the vertical position, a *band* scale

Faceting may either be specified at the top level of the plot or on individual marks. When specified at the top level, the following options indicate which data should be faceted, and how:

* facet.**data** - the data to be faceted
* facet.**x** - the horizontal position; bound to the *fx* scale, which must be *band*
* facet.**y** - the vertical position; bound to the *fy* scale, which must be *band*

With top-level faceting, any mark that uses the specified facet data will be faceted by default, whereas marks that use different data will be repeated across all facets. (See the *mark*.**facet** option below for more). When specified at the mark level, facets can be defined for each mark via the *mark*.**fx** or *mark*.**fy** channel options.

Here is an example of top-level faceting:

```js
Plot.plot({
  facet: {
    data: penguins,
    x: "sex",
    y: "island"
  },
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```

And here is the equivalent mark-level faceting:

```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "sex", fy: "island"})
  ]
})
```

Regardless of whether top- or mark-level faceting is used, the *fx* and *fy* channels are strictly ordinal or categorical (*i.e.*, discrete); each distinct channel value defines a facet. Quantitative data must be manually discretized for faceting, say by rounding or binning. (Automatic binning for quantitative data may be added in the future; see [#14](https://github.com/observablehq/plot/issues/14).) When mark-level faceting is used, the *fx* and *fy* channels are computed prior to the [mark’s transform](#transforms), if any (*i.e.*, facet channels are not transformed).

The following top-level facet constant options are also supported:

* facet.**marginTop** - the top margin
* facet.**marginRight** - the right margin
* facet.**marginBottom** - the bottom margin
* facet.**marginLeft** - the left margin
* facet.**margin** - shorthand for the four margins
* facet.**grid** - if true, draw grid lines for each facet
* facet.**label** - if null, disable default facet axis labels

Faceting can be explicitly enabled or disabled on a mark with the *mark*.**facet** option, which accepts the following values:

* *auto* (default) - automatically determine if this mark should be faceted
* *include* (or true) - draw the subset of the mark’s data in the current facet
* *exclude* - draw the subset of the mark’s data *not* in the current facet
* *super* - draw this mark in a single frame that covers all facets
* null (or false) - repeat this mark’s data across all facets (*i.e.*, no faceting)

When a mark uses *super* faceting, it is not allowed to use position scales (*x*, *y*, *fx*, or *fy*); *super* faceting is intended for decorations, such as labels and legends.

When top-level faceting is used, the default *auto* setting is equivalent to *include* when the mark data is strictly equal to the top-level facet data; otherwise it is equivalent to null. When the *include* or *exclude* facet mode is chosen, the mark data must be parallel to the top-level facet data: the data must have the same length and order. If the data are not parallel, then the wrong data may be shown in each facet. The default *auto* therefore requires strict equality (`===`) for safety, and using the facet data as mark data is recommended when using the *exclude* facet mode. (To construct parallel data safely, consider using [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) on the facet data.)

When mark-level faceting is used, the default *auto* setting is equivalent to *include*: the mark will be faceted if either the *mark*.**fx** or *mark*.**fy** channel option (or both) is specified. The null or false option will disable faceting, while *exclude* draws the subset of the mark’s data *not* in the current facet.

The <a name="facetanchor">*mark*.**facetAnchor**</a> option controls the placement of the mark with respect to the facets. It supports the following settings:

* null - display the mark on each non-empty facet (default for all marks, with the exception of axis marks)
* *top*, *right*, *bottom*, or *left* - display the mark on facets on the specified side
* *top-empty*, *right-empty*, *bottom-empty*, or *left-empty* - display the mark on facets that have an empty space on the specified side (the empty space being either the margin, or an empty facet); this is the default for axis marks
* *empty* - display the mark on empty facets only

## Legends

Plot can generate legends for *color*, *opacity*, and *symbol* [scales](#scale-options). (An opacity scale is treated as a color scale with varying transparency.) For an inline legend, use the *scale*.**legend** option:

* *scale*.**legend** - if truthy, generate a legend for the given scale

If the *scale*.**legend** option is true, the default legend will be produced for the scale; otherwise, the meaning of the *legend* option depends on the scale. For quantitative color scales, it defaults to *ramp* but may be set to *swatches* for a discrete scale (most commonly for *threshold* color scales); for ordinal color scales and symbol scales, only the *swatches* value is supported.

For example, this scatterplot includes a swatches legend for the ordinal color scale:

```js
Plot.plot({
  color: {
    legend: true
  },
  marks: [
    Plot.dot(athletes, {x: "weight", y: "height", stroke: "sex"})
  ]
})
```

Whereas this scatterplot would render a ramp legend for its diverging color scale:

```js
Plot.plot({
  color: {
    type: "diverging",
    legend: true
  },
  marks: [
    Plot.dot(gistemp, {x: "Date", y: "Anomaly", stroke: "Anomaly"})
  ]
})
```

#### *plot*.legend(*scaleName*, *options*)

Given an existing *plot* returned by [Plot.plot](#plotplotoptions), returns a detached legend for the *plot*’s scale with the given *scaleName*. The *scaleName* must refer to a scale that supports legends: either `"color"`, `"opacity"`, or `"symbol"`. For example:

```js
myplot = Plot.plot(…)
```
```js
mylegend = myplot.legend("color")
```

Or, with additional *options*:

```js
mylegend = myplot.legend("color", {width: 320})
```

If there is no scale with the given *scaleName* on the given *plot*, then *plot*.legend will return undefined.

Categorical and ordinal color legends are rendered as swatches, unless *options*.**legend** is set to *ramp*. The swatches can be configured with the following options:

* *options*.**tickFormat** - a format function for the labels
* *options*.**swatchSize** - the size of the swatch (if square)
* *options*.**swatchWidth** - the swatches’ width
* *options*.**swatchHeight** - the swatches’ height
* *options*.**columns** - the number of swatches per row
* *options*.**marginLeft** - the legend’s left margin
* *options*.**className** - a class name, that defaults to a randomly generated string scoping the styles
* *options*.**opacity** - the swatch fill opacity
* *options*.**width** - the legend’s width (in pixels)

Symbol legends are rendered as swatches and support the options above in addition to the following options:

* *options*.**fill** - the symbol fill color
* *options*.**fillOpacity** - the symbol fill opacity; defaults to 1
* *options*.**stroke** - the symbol stroke color
* *options*.**strokeOpacity** - the symbol stroke opacity; defaults to 1
* *options*.**strokeWidth** - the symbol stroke width; defaults to 1.5
* *options*.**r** - the symbol radius; defaults to 4.5 pixels

The **fill** and **stroke** symbol legend options can be specified as “color” to apply the color scale when the symbol scale is a redundant encoding. The **fill** defaults to none. The **stroke** defaults to currentColor if the fill is none, and to none otherwise. The **fill** and **stroke** options may also be inherited from the corresponding options on an associated dot mark.

Continuous color legends are rendered as a ramp, and can be configured with the following options:

* *options*.**label** - the scale’s label
* *options*.**ticks** - the desired number of ticks, or an array of tick values
* *options*.**tickFormat** - a format function for the legend’s ticks
* *options*.**tickSize** - the tick size
* *options*.**round** - if true (default), round tick positions to pixels
* *options*.**width** - the legend’s width
* *options*.**height** - the legend’s height
* *options*.**marginTop** - the legend’s top margin
* *options*.**marginRight** - the legend’s right margin
* *options*.**marginBottom** - the legend’s bottom margin
* *options*.**marginLeft** - the legend’s left margin
* *options*.**opacity** - the ramp’s fill opacity

The **style** legend option allows custom styles to override Plot’s defaults; it has the same behavior as in Plot’s top-level [layout options](#layout-options).

#### Plot.legend(*options*)

Returns a standalone legend for the scale defined by the given *options* object. The *options* object must define at least one scale; see [Scale options](#scale-options) for how to define a scale. For example, here is a ramp legend of a linear color scale with the default domain of [0, 1] and default scheme *turbo*:

```js
Plot.legend({color: {type: "linear"}})
```

The *options* object may also include any additional legend options described in the previous section. For example, to make the above legend slightly wider:

```js
Plot.legend({
  width: 320,
  color: {
    type: "linear"
  }
})
```

## Marks

[Marks](https://observablehq.com/@observablehq/plot-marks) visualize data as geometric shapes such as bars, dots, and lines. An single mark can generate multiple shapes: for example, passing a [Plot.barY](#plotbarydata-options) to [Plot.plot](#plotplotoptions) will produce a bar for each element in the associated data. Multiple marks can be layered into [plots](#plotplotoptions).

Mark constructors take two arguments: **data** and **options**. Together these describe a tabular dataset and how to visualize it. Option values that must be the same for all of a mark’s generated shapes are known as *constants*, whereas option values that may vary across a mark’s generated shapes are known as *channels*. Channels are typically bound to [scales](#scale-options) and encode abstract data values, such as time or temperature, as visual values, such as position or color. (Channels can also be used to order ordinal domains; see [sort options](#sort-options).)

A mark’s data is most commonly an array of objects representing a tabular dataset, such as the result of loading a CSV file, while a mark’s options bind channels (such as *x* and *y*) to columns in the data (such as *units* and *fruit*).

```js
sales = [
  {units: 10, fruit: "peach"},
  {units: 20, fruit: "pear"},
  {units: 40, fruit: "plum"},
  {units: 30, fruit: "plum"}
]
```
```js
Plot.dot(sales, {x: "units", y: "fruit"}).plot()
```

While a column name such as `"units"` is the most concise way of specifying channel values, values can also be specified as functions for greater flexibility, say to transform data or derive a new column on the fly. Channel functions are invoked for each datum (*d*) in the data and return the corresponding channel value. (This is similar to how D3’s [*selection*.attr](https://github.com/d3/d3-selection/blob/main/README.md#selection_attr) accepts functions, though note that Plot channel functions should return abstract values, not visual values.)

```js
Plot.dot(sales, {x: d => d.units * 1000, y: d => d.fruit}).plot()
```

Plot also supports columnar data for greater efficiency with bigger datasets; for example, data can be specified as any array of the appropriate length (or any iterable or value compatible with [Array.from](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)), and then separate arrays of values can be passed as *options*.

```js
index = [0, 1, 2, 3]
```
```js
units = [10, 20, 40, 30]
```
```js
fruits = ["peach", "pear", "plum", "plum"]
```
```js
Plot.dot(index, {x: units, y: fruits}).plot()
```

Channel values can also be specified as numbers for constant values, say for a fixed baseline with an [area](#area).

```js
Plot.area(aapl, {x1: "Date", y1: 0, y2: "Close"}).plot()
```

Missing and invalid data are handled specifically for each mark type and channel. In most cases, if the provided channel value for a given datum is null, undefined, or (strictly) NaN, the mark will implicitly filter the datum and not generate a corresponding output. In some cases, such as the radius (*r*) of a dot, the channel value must additionally be positive. Plot.line and Plot.area will stop the path before any invalid point and start again at the next valid point, thus creating interruptions rather than interpolating between valid points. Titles will only be added if they are non-empty.

All marks support the following style options:

* **fill** - fill color
* **fillOpacity** - fill opacity (a number between 0 and 1)
* **stroke** - stroke color
* **strokeWidth** - stroke width (in pixels)
* **strokeOpacity** - stroke opacity (a number between 0 and 1)
* **strokeLinejoin** - how to join lines (*bevel*, *miter*, *miter-clip*, or *round*)
* **strokeLinecap** - how to cap lines (*butt*, *round*, or *square*)
* **strokeMiterlimit** - to limit the length of *miter* joins
* **strokeDasharray** - a comma-separated list of dash lengths (typically in pixels)
* **strokeDashoffset** - the [stroke dash offset](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset) (typically in pixels)
* **opacity** - object opacity (a number between 0 and 1)
* **mixBlendMode** - the [blend mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode) (*e.g.*, *multiply*)
* **shapeRendering** - the [shape-rendering mode](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering) (*e.g.*, *crispEdges*)
* **paintOrder** - the [paint order](https://developer.mozilla.org/en-US/docs/Web/CSS/paint-order) (*e.g.*, *stroke*)
* **dx** - horizontal offset (in pixels; defaults to 0)
* **dy** - vertical offset (in pixels; defaults to 0)
* **target** - link target (e.g., “_blank” for a new window); for use with the **href** channel
* **ariaDescription** - a textual description of the mark’s contents
* **ariaHidden** - if true, hide this content from the accessibility tree
* **pointerEvents** - the [pointer events](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events) (*e.g.*, *none*)
* **clip** - whether and how to clip the mark

If the **clip** option is *frame* (or equivalently true), the mark is clipped to the frame’s dimensions; if the **clip** option is null (or equivalently false), the mark is not clipped. If the **clip** option is *sphere*, then a [geographic projection](#projection-options) is required and the mark will be clipped to the projected sphere (_e.g._, the front hemisphere when using the orthographic projection).

For all marks except [text](#plottextdata-options), the **dx** and **dy** options are rendered as a transform property, possibly including a 0.5px offset on low-density screens.

All marks support the following optional channels:

* **fill** - a fill color; bound to the *color* scale
* **fillOpacity** - a fill opacity; bound to the *opacity* scale
* **stroke** - a stroke color; bound to the *color* scale
* **strokeOpacity** - a stroke opacity; bound to the *opacity* scale
* **strokeWidth** - a stroke width (in pixels)
* **opacity** - an object opacity; bound to the *opacity* scale
* **title** - an accessible, short-text description (a string of text, possibly with newlines)
* **href** - a URL to link to
* **ariaLabel** - a short label representing the value in the accessibility tree

The **fill**, **fillOpacity**, **stroke**, **strokeWidth**, **strokeOpacity**, and **opacity** options can be specified as either channels or constants. When the fill or stroke is specified as a function or array, it is interpreted as a channel; when the fill or stroke is specified as a string, it is interpreted as a constant if a valid CSS color and otherwise it is interpreted as a column name for a channel. Similarly when the fill opacity, stroke opacity, object opacity, stroke width, or radius is specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel.

The scale associated with any channel can be overridden by specifying the channel as an object with a *value* property specifying the channel values and a *scale* property specifying the desired scale name or null for an unscaled channel. For example, to force the **stroke** channel to be unscaled, interpreting the associated values as literal color strings:

```js
Plot.dot(data, {stroke: {value: "fieldName", scale: null}})
```

To instead force the **stroke** channel to be bound to the *color* scale regardless of the provided values, say:

```js
Plot.dot(data, {stroke: {value: "fieldName", scale: "color"}})
```

The color channels (**fill** and **stroke**) are bound to the *color* scale by default, unless the provided values are all valid CSS color strings or nullish, in which case the values are interpreted literally and unscaled.

In addition to functions of data, arrays, and column names, channel values can be specified as an object with a *transform* method; this transform method is passed the mark’s array of data and must return the corresponding array of channel values. (Whereas a channel value specified as a function is invoked repeatedly for each element in the mark’s data, similar to *array*.map, the transform method is invoked only once being passed the entire array of data.) For example, to pass the mark’s data directly to the **x** channel, equivalent to [Plot.identity](#plotidentity):

```js
Plot.dot(numbers, {x: {transform: data => data}})
```

The **title**, **href**, and **ariaLabel** options can *only* be specified as channels. When these options are specified as a string, the string refers to the name of a column in the mark’s associated data. If you’d like every instance of a particular mark to have the same value, specify the option as a function that returns the desired value, *e.g.* `() => "Hello, world!"`.

The rectangular marks ([bar](#bar), [cell](#cell), [frame](#frame), and [rect](#rect)) support insets and rounded corner constant options:

* **insetTop** - inset the top edge
* **insetRight** - inset the right edge
* **insetBottom** - inset the bottom edge
* **insetLeft** - inset the left edge
* **rx** - the [*x* radius](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx) for rounded corners
* **ry** - the [*y* radius](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/ry) for rounded corners

Insets are specified in pixels. Corner radii are specified in either pixels or percentages (strings). Both default to zero. Insets are typically used to ensure a one-pixel gap between adjacent bars; note that the [bin transform](#bin) provides default insets, and that the [band scale padding](#position-options) defaults to 0.1, which also provides separation.

For marks that support the <a name="frameanchor">**frameAnchor**</a> option, it may be specified as one of the four sides (*top*, *right*, *bottom*, *left*), one of the four corners (*top-left*, *top-right*, *bottom-right*, *bottom-left*), or the *middle* of the frame.

#### *mark*.plot(*options*)

Given a *mark*, such as the result of calling [Plot.barY](#plotbarydata-options), you can call *mark*.plot to render a plot. This is [shorthand](https://observablehq.com/@observablehq/plot-shorthand?collection=@observablehq/plot) for calling [Plot.plot](#plotplotoptions) where the *marks* option specifies this single mark.

```js
const mark = Plot.barY(alphabet, {x: "letter", y: "frequency"});
return mark.plot();
```

More commonly this shorthand is written as a single expression:

```js
Plot.barY(alphabet, {x: "letter", y: "frequency"}).plot()
```

This is equivalent to:

```js
Plot.plot({marks: [Plot.barY(alphabet, {x: "letter", y: "frequency"})]})
```

If needed, you can pass additional *options* to *mark*.plot, which is equivalent to passing *options* to Plot.plot. (If the *marks* option is used, additional marks are concatenated with the shorthand *mark*.)

```js
Plot.barY(alphabet, {x: "letter", y: "frequency"}).plot({width: 1024})
```

#### Plot.marks(...*marks*)

A convenience method for composing a mark from a series of other marks. Returns an array of marks that implements the *mark*.plot function. See the [box mark implementation](./src/marks/box.js) for an example.

## Decorations

Decorations are marks that do not directly represent data. Currently this includes [Plot.frame](#frame), as well as the [axes](#axis) and [grid](#grid) marks described above.

## Transforms

Plot’s transforms provide a convenient mechanism for transforming data as part of a plot specification. All marks support the following basic transforms:

* **filter** - filters data according to the specified accessor or values
* **sort** - sorts data according to the specified comparator, accessor, or values
* **reverse** - reverses the sorted (or if not sorted, the input) data order

For example, to draw bars only for letters that commonly form vowels:

```js
Plot.barY(alphabet, {filter: d => /[aeiou]/i.test(d.letter), x: "letter", y: "frequency"})
```

The **filter** transform is similar to filtering the data with [*array*.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), except that it will preserve [faceting](#facet-options) and will not affect inferred [scale domains](#scale-options); domains are inferred from the unfiltered channel values.

```js
Plot.barY(alphabet.filter(d => /[aeiou]/i.test(d.letter)), {x: "letter", y: "frequency"})
```

Together the **sort** and **reverse** transforms allow control over *z* order, which can be important when addressing overplotting. If the sort option is a function but does not take exactly one argument, it is assumed to be a [comparator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description); otherwise, the sort option is interpreted as a channel value definition and thus may be either as a column name, accessor function, or array of values.

The sort transform can also be used to sort on channel values, including those derived by [initializers](#initializers). For example, to sort dots by descending radius:

```js
Plot.dot(earthquakes, {x: "longitude", y: "latitude", r: "intensity", sort: {channel: "r", order: "descending}})
```

In fact, sorting by descending radius is the default behavior of the dot mark when an *r* channel is specified. You can disable this by setting the sort explicitly to null:

```js
Plot.dot(earthquakes, {x: "longitude", y: "latitude", r: "intensity", sort: null})
```

For greater control, you can also implement a [custom transform function](#custom-transforms):

* **transform** - a function that returns transformed *data* and *index*

The basic transforms are composable: the *filter* transform is applied first, then *sort*, then *reverse*. If a custom *transform* option is specified directly, it supersedes any basic transforms (*i.e.*, the *filter*, *sort* and *reverse* options are ignored). However, the *transform* option is rarely used directly; instead an option transform is used. These option transforms automatically compose with the basic *filter*, *sort* and *reverse* transforms.

Plot’s option transforms, listed below, do more than populate the **transform** function: they derive new mark options and channels. These transforms take a mark’s *options* object (and possibly transform-specific options as the first argument) and return a new, transformed, *options*. Option transforms are composable: you can pass an *options* objects through more than one transform before passing it to a mark. You can also reuse the same transformed *options* on multiple marks.

The *filter*, *sort* and *reverse* transforms are also available as functions, allowing the order of operations to be specified explicitly. For example, sorting before binning results in sorted data inside bins, whereas sorting after binning results affects the *z* order of rendered marks.

#### Plot.sort(*order*, *options*)

```js
Plot.sort("body_mass_g", options) // show data in ascending body mass order
```

Sorts the data by the specified *order*, which can be an accessor function, a comparator function, or a channel value definition such as a field name. See also [index sorting](#sort-options), which allows marks to be sorted by a named channel, such as *r* for radius.

#### Plot.shuffle(*options*)

```js
Plot.shuffle(options) // show data in random order
```

Shuffles the data randomly. If a *seed* option is specified, a linear congruential generator with the given seed is used to generate random numbers deterministically; otherwise, Math.random is used.

#### Plot.reverse(*options*)

```js
Plot.reverse(options) // reverse the input order
```

Reverses the order of the data.

#### Plot.filter(*test*, *options*)

```js
Plot.filter(d => d.body_mass_g > 3000, options) // show data whose body mass is greater than 3kg
```

Filters the data given the specified *test*. The test can be given as an accessor function (which receives the datum and index), or as a channel value definition such as a field name; truthy values are retained.

### Custom transforms

The **transform** option defines a custom transform function, allowing data, indexes, or channels to be derived prior to rendering. Custom transforms are rarely implemented directly; see the built-in transforms above. The transform function (if present) is passed two arguments, *data* and *facets*, representing the mark’s data and facet indexes; it must then return a {data, facets} object representing the resulting transformed data and facet indexes. The *facets* are represented as a nested array of arrays such as [[0, 1, 3, …], [2, 5, 10, …], …]; each element in *facets* specifies the zero-based indexes of elements in *data* that are in a given facet (*i.e.*, have a distinct value in the associated *fx* or *fy* dimension).

While transform functions often produce new *data* or *facets*, they may return the passed-in *data* and *facets* as-is, and often have a side-effect of constructing derived channels. For example, the count of elements in a [groupX transform](#group) might be returned as a new *y* channel. In this case, the transform is typically expressed as an options transform: a function that takes a mark options object and returns a new, transformed options object, where the returned options object implements a *transform* function option. Transform functions should not mutate the input *data* or *facets*. Likewise options transforms should not mutate the input *options* object.

Plot provides a few helpers for implementing transforms.

#### Plot.valueof(*data*, *value*, *type*)

Given an iterable *data* and some *value* accessor, returns an array (a column) of the specified *type* with the corresponding value of each element of the data. The *value* accessor may be one of the following types:

* a string - corresponding to the field accessor (`d => d[value]`)
* an accessor function - called as *type*.from(*data*, *value*)
* a number, Date, or boolean — resulting in an array uniformly filled with the *value*
* an object with a transform method — called as *value*.transform(*data*)
* an array of values - returning the same
* null or undefined - returning the same

If *type* is specified, it must be Array or a similar class that implements the [Array.from](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from) interface such as a typed array. When *type* is Array or a typed array class, the return value of valueof will be an instance of the same (or null or undefined). When *type* is a typed array, values will be implicitly coerced numbers, and if *type* is Float64Array, Float32Array, or a subclass of the same, null values will be implicitly replaced with NaN. If *type* is not specified, valueof may return either an array or a typed array (or null or undefined).

Plot.valueof is not guaranteed to return a new array. When a transform method is used, or when the given *value* is an array that is compatible with the requested *type*, the array may be returned as-is without making a copy.

#### Plot.transform(*options*, *transform*)

Given an *options* object that may specify some basic transforms (*filter*, *sort*, or *reverse*) or a custom *transform* function, composes those transforms if any with the given *transform* function, returning a new *options* object. If a custom *transform* function is present on the given *options*, any basic transforms are ignored. Any additional input *options* are passed through in the returned *options* object. This method facilitates applying the basic transforms prior to applying the given custom *transform* and is used internally by Plot’s built-in transforms.

#### Plot.column(*source*)

This helper for constructing derived columns returns a [*column*, *setColumn*] array. The *column* object implements *column*.transform, returning whatever value was most recently passed to *setColumn*. If *setColumn* is not called, then *column*.transform returns undefined. If a *source* is specified, then *column*.label exposes the given *source*’s label, if any: if *source* is a string as when representing a named field of data, then *column*.label is *source*; otherwise *column*.label propagates *source*.label. This allows derived columns to propagate a human-readable axis or legend label.

Plot.column is typically used by options transforms to define new channels; the associated columns are populated (derived) when the **transform** option function is invoked.

#### Plot.identity

This channel helper returns a source array as-is, avoiding an extra copy when defining a channel as being equal to the data:

```js
Plot.raster(await readValues(), {width: 300, height: 200, fill: Plot.identity})
```

## Initializers

Initializers can be used to transform and derive new channels prior to rendering. Unlike transforms which operate in abstract data space, initializers can operate in screen space such as pixel coordinates and colors. For example, initializers can modify a marks’ positions to avoid occlusion. Initializers are invoked *after* the initial scales are constructed and can modify the channels or derive new channels; these in turn may (or may not, as desired) be passed to scales.

### Custom initializers

You can specify a custom initializer by specifying a function as the mark **initializer** option. This function is called after the scales have been computed, and receives as inputs the (possibly transformed) array of *data*, the *facets* index of elements of this array that belong to each facet, the input *channels* (as an object of named channels), the *scales*, and the *dimensions*. The mark itself is the *this* context. The initializer function must return an object with *data*, *facets*, and new *channels*. Any new channels are merged with existing channels, replacing channels of the same name.

If an initializer desires a channel that is not supported by the downstream mark, additional channels can be declared using the mark **channels** option.

#### Plot.initializer(*options*, *initializer*)

This helper composes the *initializer* function with any other transforms present in the *options*, and returns a new *options* object.

## Curves

A curve defines how to turn a discrete representation of a line as a sequence of points [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] into a continuous path; *i.e.*, how to interpolate between points. Curves are used by the [line](#line), [area](#area), and [link](#link) mark, and are implemented by [d3-shape](https://github.com/d3/d3-shape/blob/main/README.md#curves).

The supported curve options are:

* **curve** - the curve method, either a string or a function
* **tension** - the curve tension (for fine-tuning)

The following named curve methods are supported:

* *basis* - a cubic basis spline (repeating the end points)
* *basis-open* - an open cubic basis spline
* *basis-closed* - a closed cubic basis spline
* *bump-x* - a Bézier curve with horizontal tangents
* *bump-y* - a Bézier curve with vertical tangents
* *bundle* - a straightened cubic basis spline (suitable for lines only, not areas)
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
* *auto* - like *linear*, but use the (possibly spherical) [projection](#projection-options), if any

If *curve* is a function, it will be invoked with a given *context* in the same fashion as a [D3 curve factory](https://github.com/d3/d3-shape/blob/main/README.md#custom-curves). The *auto* curve is only available for the [line mark](#line) and [link mark](#link) and is typically used in conjunction with a spherical [projection](#projection-options) to interpolate along [geodesics](https://en.wikipedia.org/wiki/Geodesic).

The tension option only has an effect on bundle, cardinal and Catmull–Rom splines (*bundle*, *cardinal*, *cardinal-open*, *cardinal-closed*, *catmull-rom*, *catmull-rom-open*, and *catmull-rom-closed*). For bundle splines, it corresponds to [beta](https://github.com/d3/d3-shape/blob/main/README.md#curveBundle_beta); for cardinal splines, [tension](https://github.com/d3/d3-shape/blob/main/README.md#curveCardinal_tension); for Catmull–Rom splines, [alpha](https://github.com/d3/d3-shape/blob/main/README.md#curveCatmullRom_alpha).

## Spatial interpolation

The [raster](#raster) and [contour](#contour) marks use spatial interpolation to populate a raster grid from a discrete set of (often ungridded) spatial samples. The **interpolate** option controls how these marks compute the raster grid. The following built-in methods are provided:

* *none* (or null) - assign each sample to the containing pixel
* *nearest* - assign each pixel to the closest sample’s value (Voronoi diagram)
* *barycentric* - apply barycentric interpolation over the Delaunay triangulation
* *random-walk* - apply a random walk from each pixel, stopping when near a sample

The **interpolate** option can also be specified as a function with the following arguments:

* *index* - an array of numeric indexes into the channels *x*, *y*, *value*
* *width* - the width of the raster grid; a positive integer
* *height* - the height of the raster grid; a positive integer
* *x* - an array of values representing the *x*-position of samples
* *y* - an array of values representing the *y*-position of samples
* *value* - an array of values representing the sample’s observed value

So, *x*[*index*[0]] represents the *x*-position of the first sample, *y*[*index*[0]] its *y*-position, and *value*[*index*[0]] its value (*e.g.*, the observed height for a topographic map).

#### Plot.interpolateNone(*index*, *width*, *height*, *x*, *y*, *value*)

Applies a simple forward mapping of samples, binning them into pixels in the raster grid without any blending or interpolation. If multiple samples map to the same pixel, the last one wins; this can introduce bias if the points are not in random order, so use [Plot.shuffle](#plotshuffleoptions) to randomize the input if needed.

#### Plot.interpolateNearest(*index*, *width*, *height*, *x*, *y*, *value*)

Assigns each pixel in the raster grid the value of the closest sample; effectively a Voronoi diagram.

#### Plot.interpolatorBarycentric({*random*})

Constructs a Delaunay triangulation of the samples, and then for each pixel in the raster grid, determines the triangle that covers the pixel’s centroid and interpolates the values associated with the triangle’s vertices using [barycentric coordinates](https://en.wikipedia.org/wiki/Barycentric_coordinate_system). If the interpolated values are ordinal or categorical (_i.e._, anything other than numbers or dates), then one of the three values will be picked randomly weighted by the barycentric coordinates; the given *random* number generator will be used, which defaults to a [linear congruential generator](https://github.com/d3/d3-random/blob/main/README.md#randomLcg) with a fixed seed (for deterministic results).

#### Plot.interpolatorRandomWalk({*random*, *minDistance* = 0.5, *maxSteps* = 2})

For each pixel in the raster grid, initiates a random walk, stopping when either the walk is within a given distance (*minDistance*) of a sample or the maximum allowable number of steps (*maxSteps*) have been taken, and then assigning the current pixel the closest sample’s value. The random walk uses the “walk on spheres” algorithm in two dimensions described by [Sawhney and Crane](https://www.cs.cmu.edu/~kmcrane/Projects/MonteCarloGeometryProcessing/index.html), SIGGRAPH 2020.

## Markers

A [marker](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker) defines a graphic drawn on vertices of a [line](#line) or a [link](#link) mark. The supported marker options are:

* **markerStart** - the marker for the starting point of a line segment
* **markerMid** - the marker for any intermediate point of a line segment
* **markerEnd** - the marker for the end point of a line segment
* **marker** - shorthand for setting the marker on all points

The following named markers are supported:

* *none* (default) - no marker
* *arrow* - an arrowhead
* *dot* - a filled *circle* without a stroke and 2.5px radius
* *circle*, equivalent to *circle-fill* - a filled circle with a white stroke and 3px radius
* *circle-stroke* - a hollow circle with a colored stroke and a white fill and 3px radius

If *marker* is true, it defaults to *circle*. If *marker* is a function, it will be called with a given *color* and must return an SVG marker element.

The primary color of a marker is inherited from the *stroke* of the associated mark. The *arrow* marker is [automatically oriented](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/orient) such that it points in the tangential direction of the path at the position the marker is placed. The *circle* markers are centered around the given vertex. Note that for lines whose curve is not *linear*, markers are not necessarily drawn at the data positions given by *x* and *y*; marker placement is determined by the (possibly Bézier) path segments generated by the curve. To ensure that symbols are drawn at a given *x* and *y* position, consider using a [dot](#dot).

## Formats

These helper functions are provided for use as a *scale*.tickFormat [axis option](#position-options), as the text option for [Plot.text](#plottextdata-options), or for general use. See also [d3-format](https://github.com/d3/d3-format), [d3-time-format](https://github.com/d3/d3-time-format), and JavaScript’s built-in [date formatting](https://observablehq.com/@mbostock/date-formatting) and [number formatting](https://observablehq.com/@mbostock/number-formatting).

#### Plot.formatIsoDate(*date*)

```js
Plot.formatIsoDate(new Date("2020-01-01T00:00.000Z")) // "2020-01-01"
```

Given a *date*, returns the shortest equivalent ISO 8601 UTC string. If the given *date* is not valid, returns `"Invalid Date"`.

#### Plot.formatWeekday(*locale*, *format*)

```js
Plot.formatWeekday("es-MX", "long")(0) // "domingo"
```

Returns a function that formats a given week day number (from 0 = Sunday to 6 = Saturday) according to the specified *locale* and *format*. The *locale* is a [BCP 47 language tag](https://tools.ietf.org/html/bcp47) and defaults to U.S. English. The *format* is a [weekday format](https://tc39.es/ecma402/#datetimeformat-objects): either *narrow*, *short*, or *long*; if not specified, it defaults to *short*.

#### Plot.formatMonth(*locale*, *format*)

```js
Plot.formatMonth("es-MX", "long")(0) // "enero"
```

Returns a function that formats a given month number (from 0 = January to 11 = December) according to the specified *locale* and *format*. The *locale* is a [BCP 47 language tag](https://tools.ietf.org/html/bcp47) and defaults to U.S. English. The *format* is a [month format](https://tc39.es/ecma402/#datetimeformat-objects): either *2-digit*, *numeric*, *narrow*, *short*, *long*; if not specified, it defaults to *short*.

## Accessibility

Plot supports several [ARIA properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) to help build the accessibility tree. The accessibility tree is consumed by various assistive technology such as screen readers and browser add-ons to make web contents and web applications more accessible to people with disabilities. It can be inspected in the browser’s inspector.

The aria-label and aria-description properties can be set on the SVG root element by specifying the top-level options **ariaLabel** and **ariaDescription**, which default to null.

Positional axes are branded with an aria-label and an aria-description properties, which can likewise be specified as axis options. Set the aria-label with the **ariaLabel** axis option, which defaults to “x-axis” and “y-axis” for the corresponding axes (and “fx-axis” and “fy-axis” for facet axes). Set the aria-description with the **ariaDescription** axis option, which defaults to null.

Marks are branded with an aria-label property with the mark’s name (*e.g.*, “dot”). You can also set an optional aria-description property by specifying the mark option **ariaDescription**. A short label can be specified for each of the individual elements—*e.g.*, individual dots in a dot mark—with the mark option **ariaLabel**. A mark can be hidden from the accessibility tree by specifying the mark option **ariaHidden** to true; this allows to hide decorative elements (such as rules) and repetitive marks (such as lines that support dots, or text marks that are also represented by symbols).
