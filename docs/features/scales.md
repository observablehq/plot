# Scales

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

## Color scales

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

## Position scales

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
