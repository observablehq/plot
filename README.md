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

The **marks** option specifies the array of [marks](#marks) to render. Each mark has its own data and options; see the respective mark type (*e.g.*, [Plot.barY](#plotbarydata-options) or [Plot.dot](#plotdotdata-options)) for which mark options are supported. Marks are drawn in *z*-order, last on top. For example, here bars for the dataset *alphabet* are drawn on top of a single rule at *y* = 0.

```js
Plot.plot({
  marks: [
    Plot.ruleY([0]),
    Plot.barY(alphabet, {x: "letter", y: "frequency"})
  ]
})
```

Each mark may also be a nested array of marks, allowing mark composition.

#### Layout options

These options determine the overall layout of the plot; all are specified as numbers in pixels:

* **marginTop** - the top margin
* **marginRight** - the right margin
* **marginBottom** - the bottom margin
* **marginLeft** - the left margin
* **width** - the outer width of the plot (including margins)
* **height** - the outer height of the plot (including margins)

The default *width* is 640. On Observable, it can be set to the [standard width](https://github.com/observablehq/stdlib/blob/master/README.md#width) to make full-width responsive plots. The default *height* is 396 if the plot has a *y* or *fy* scale; otherwise it is 90 if the plot has an *fx* scale, and 60 if it does not. (The default *height* will be getting smarter for ordinal domains; see [#337](https://github.com/observablehq/plot/pull/337).)

TODO Describe the default margins based on the plot’s axes. Mention that margins are not automatically sized to make room for tick labels, as this would lead to inconsistent layout across plots; instead, you are expected to shorten your tick labels or increase the margins as needed.

Two additional options allow further customization:

* **style** - custom styles (*e.g.*, `"color: red"` or `{color: "red"}`)
* **caption** - a figure caption, either a string or HTML element

TODO Describe the default styles: the background is white, the max-width is 100%, the font is system-ui, the fill is currentColor to allow the CSS color to be inherited by marks and axes.

If a *caption* is specified, then Plot.plot returns an HTML figure element instead of an SVG element. To specify an HTML caption, consider using the [`html` tagged template literal](http://github.com/observablehq/htl); otherwise, the specified string represents text that will be escaped as needed.

#### Scale options

Before Plot renders a mark, data is passed through [scales](): scales map an abstract value such as time or temperature to a visual value such as *x*- or *y*-position or color. Within a given plot, marks share scales. For example, if there are two Plot.line marks, both lines will share the same *x* and *y* scales for a consistent representation of data. (Plot does not currently support dual-axis charts, which are [not advised](https://blog.datawrapper.de/dualaxis/).)

```js
Plot.plot({
  marks: [
    Plot.line(aapl, {x: "Date", y: "Close"}),
    Plot.line(goog, {x: "Date", y: "Close"})
  ]
})
```

Each scale’s options are specified as a nested options object, within the top-level plot *options*, whose name corresponds to the scale:

* **x** - horizontal position
* **y** - vertical position
* **r** - size or radius
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

Plot supports many scale types. You can set the scale type explicitly via the *scale*.**type** option, but typically the scale type is inferred automatically from the associated data: strings and booleans imply an ordinal scale; dates imply a UTC scale; anything else is linear. Plot assumes that your data is consistently typed, so inference is based solely on the first non-null, non-undefined value. We recommend explicitly coercing types when loading data (*e.g.*, d3.autoType or Observable’s FileAttachment). Certain mark types also imply a scale type; for example, the [Plot.barY](#plotbarydata-options) mark implies that the *x* scale is a band scale.

The following numeric quantitative scale types are supported:

* *linear* - a linear scale
* *pow* - an exponential (power) scale
* *sqrt* - an exponential scale with *exponent* = 0.5
* *log* - a logarithmic (log) scale
* *symlog* - a bi-symmetric logarithmic scale for wide-range data

For time (temporal quantitative), two variants of a linear scale are supported:

* *utc* - UTC time
* *time* - local time

UTC is recommended over local time as charts in UTC time are guaranteed to appear consistently to all viewers whereas charts in local time will depend on the viewer’s time zone. (Due to limitations in JavaScript’s Date class, Plot does not yet support an explicit time zone other than UTC.)

For data that is ordinal (such as t-shirt sizes) or categorical (*a.k.a.* nominal, such as brands of clothing), you can specify an *ordinal* scale type. For a position encoding (*i.e.*, for the *x* or *y* scale), you can chose either a *point* or *band* scale.

* *ordinal* - map a discrete domain to a discrete range
* *point* - map a discrete domain to a continuous range
* *band* - map a discrete domain to a continuous range

If the associated mark has a non-zero width along the ordinal dimension, such as a bar, then use a *band* scale; otherwise, say for a dot, use a *point* scale.

Plot similarly supports special scale types for encoding data as color:

* *sequential* - equivalent to *linear*; defaults to the *turbo* scheme
* *cyclical* - equivalent to *linear*, but defaults to the *rainbow* scheme
* *diverging* - like *linear*, but with a pivot; defaults to the *rdbu* scheme
* *ordinal* - defaults to the *turbo*
* *categorical* - equivalent to *ordinal*, but defaults to the *tableau10* scheme

Lastly, you can disable a scale using the *identity* scale type:

* *identity* - disables the scale, rendering values as given

Identity scales are useful to opt-out of a scale, for example if you wish to return literal colors or pixel positions within a mark channel rather than relying on a scale to convert abstract values into visual values. In the case of position scales (*x* and *y*), the *identity* scale type is still a quantitative scale and may produce an axis, but unlike a linear scale, the domain and range are fixed based on the chart’s dimensions (representing pixels) and may not be configured.

Scales’ domains are typically automatically inferred from associated data, while scales’ ranges similarly have suitable automatic defaults based on the chart dimensions. However, you can set the domain and range explicitly using the following options.

* *scale*.**domain** - typically [*min*, *max*] for quantitative scales, or an array of ordinal values
* *scale*.**range** - typically [*min*, *max*], or an array of values for ordinal scales
* *scale*.**reverse** - reverses the domain, say to flip the chart along *x* or *y*

TODO Describe the values for *domain* and *range* are expected based on the scale type.

For quantitative scales…

* *scale*.**clamp** - if true, clamp input values to the scale’s domain
* *scale*.**nice** - if true (or a tick count), extend the domain to nice round values
* *scale*.**zero** - if true, extend the domain to include zero if needed
* *scale*.**exponent** - for pow scales
* *scale*.**base** - for log scales
* *scale*.**constant** - for symlog scales

For color scales…

* *scale*.**scheme** - a named color scheme, *e.g.*  `"reds"`
* *scale*.**interpolate** -

The following sequential scale schemes are supported:

* *blues* <sub><img src="./img/blues.png" width="120" height="16" alt="blues"></sub>
* *greens* <sub><img src="./img/greens.png" width="120" height="16" alt="greens"></sub>
* *greys* <sub><img src="./img/greys.png" width="120" height="16" alt="greys"></sub>
* *oranges* <sub><img src="./img/oranges.png" width="120" height="16" alt="oranges"></sub>
* *purples* <sub><img src="./img/purples.png" width="120" height="16" alt="purples"></sub>
* *reds* <sub><img src="./img/reds.png" width="120" height="16" alt="reds"></sub>
* *bugn* <sub><img src="./img/bugn.png" width="120" height="16" alt="bugn"></sub>
* *bupu* <sub><img src="./img/bupu.png" width="120" height="16" alt="bupu"></sub>
* *gnbu* <sub><img src="./img/gnbu.png" width="120" height="16" alt="gnbu"></sub>
* *orrd* <sub><img src="./img/orrd.png" width="120" height="16" alt="orrd"></sub>
* *pubu* <sub><img src="./img/pubu.png" width="120" height="16" alt="pubu"></sub>
* *pubugn* <sub><img src="./img/pubugn.png" width="120" height="16" alt="pubugn"></sub>
* *purd* <sub><img src="./img/purd.png" width="120" height="16" alt="purd"></sub>
* *rdpu* <sub><img src="./img/rdpu.png" width="120" height="16" alt="rdpu"></sub>
* *ylgn* <sub><img src="./img/ylgn.png" width="120" height="16" alt="ylgn"></sub>
* *ylgnbu* <sub><img src="./img/ylgnbu.png" width="120" height="16" alt="ylgnbu"></sub>
* *ylorbr* <sub><img src="./img/ylorbr.png" width="120" height="16" alt="ylorbr"></sub>
* *ylorrd* <sub><img src="./img/ylorrd.png" width="120" height="16" alt="ylorrd"></sub>
* *cividis* <sub><img src="./img/cividis.png" width="120" height="16" alt="cividis"></sub>
* *inferno* <sub><img src="./img/inferno.png" width="120" height="16" alt="inferno"></sub>
* *magma* <sub><img src="./img/magma.png" width="120" height="16" alt="magma"></sub>
* *plasma* <sub><img src="./img/plasma.png" width="120" height="16" alt="plasma"></sub>
* *viridis* <sub><img src="./img/viridis.png" width="120" height="16" alt="viridis"></sub>
* *cubehelix* <sub><img src="./img/cubehelix.png" width="120" height="16" alt="cubehelix"></sub>
* *turbo* <sub><img src="./img/turbo.png" width="120" height="16" alt="turbo"></sub>
* *warm* <sub><img src="./img/warm.png" width="120" height="16" alt="warm"></sub>
* *cool* <sub><img src="./img/cool.png" width="120" height="16" alt="cool"></sub>

The following diverging scale schemes are supported:

* *brbg* <sub><img src="./img/brbg.png" width="120" height="16" alt="brbg"></sub>
* *prgn* <sub><img src="./img/prgn.png" width="120" height="16" alt="prgn"></sub>
* *piyg* <sub><img src="./img/piyg.png" width="120" height="16" alt="piyg"></sub>
* *puor* <sub><img src="./img/puor.png" width="120" height="16" alt="puor"></sub>
* *rdbu* <sub><img src="./img/rdbu.png" width="120" height="16" alt="rdbu"></sub>
* *rdgy* <sub><img src="./img/rdgy.png" width="120" height="16" alt="rdgy"></sub>
* *rdylbu* <sub><img src="./img/rdylbu.png" width="120" height="16" alt="rdylbu"></sub>
* *rdylgn* <sub><img src="./img/rdylgn.png" width="120" height="16" alt="rdylgn"></sub>
* *spectral* <sub><img src="./img/spectral.png" width="120" height="16" alt="spectral"></sub>
* *burd* <sub><img src="./img/burd.png" width="120" height="16" alt="burd"></sub>
* *buylrd* <sub><img src="./img/buylrd.png" width="120" height="16" alt="buylrd"></sub>

The following cylical color schemes are supported:

* *rainbow* <sub><img src="./img/rainbow.png" width="120" height="16" alt="rainbow"></sub>
* *sinebow* <sub><img src="./img/sinebow.png" width="120" height="16" alt="sinebow"></sub>

The following categorical color schemes are supported:

* *accent* (8 colors) <sub><img src="./img/accent.png" width="96" height="16" alt="accent"></sub>
* *category10* (10 colors) <sub><img src="./img/category10.png" width="120" height="16" alt="category10"></sub>
* *dark2* (8 colors) <sub><img src="./img/dark2.png" width="96" height="16" alt="dark2"></sub>
* *paired* (12 colors) <sub><img src="./img/paired.png" width="144" height="16" alt="paired"></sub>
* *pastel1* (9 colors) <sub><img src="./img/pastel1.png" width="108" height="16" alt="pastel1"></sub>
* *pastel2* (8 colors) <sub><img src="./img/pastel2.png" width="96" height="16" alt="pastel2"></sub>
* *set1* (9 colors) <sub><img src="./img/set1.png" width="108" height="16" alt="set1"></sub>
* *set2* (8 colors) <sub><img src="./img/set2.png" width="96" height="16" alt="set2"></sub>
* *set3* (12 colors) <sub><img src="./img/set3.png" width="144" height="16" alt="set3"></sub>
* *tableau10* (10 colors) <sub><img src="./img/tableau10.png" width="120" height="16" alt="tableau10"></sub>

The following scale interpolators are supported:

* *number* -
* *rgb* -
* *hsl* -
* *hcl* -
* *lab* -

For diverging color scales…

* *scale*.**pivot** -

For position scales…

* *scale*.**inset** -
* *scale*.**round** -

For ordinal position scales (*point* or *band*)…

* *scale*.**align** -
* *scale*.**padding** -
* *scale*.**paddingInner** -
* *scale*.**paddingOuter** -

Additional scale options…

* *scale*.**percent** -
* *scale*.**transform** -

#### Axis options

* **grid** -
* *scale*.**axis** -
* *scale*.**ticks** -
* *scale*.**tickSize** -
* *scale*.**tickPadding** -
* *scale*.**tickFormat** -
* *scale*.**tickRotate** -
* *scale*.**grid** -
* *scale*.**label** -
* *scale*.**labelAnchor** -
* *scale*.**labelOffset** -

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

#### Plot.area(*data*, *options*)

…

#### Plot.areaX(*data*, *options*)

…

#### Plot.areaY(*data*, *options*)

…

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

#### Plot.frame(*options*)

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

### Formats

#### Plot.formatIsoDate(*date*)

…

#### Plot.formatWeekday(*locale*, *format*)

…

#### Plot.formatMonth(*locale*, *format*)

…
