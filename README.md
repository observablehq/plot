# Observable Plot

**Observable Plot** is a JavaScript library for exploratory data visualization.

* [Introduction](https://observablehq.com/@data-workflows/plot)
* [API Reference](#API-Reference)
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

<a href="#plot" name="plot">#</a> Plot.<b>plot</b>({<i>marks</i> = [], ...<i>options</i>} = {})

Renders a new plot given the specified *marks* and other *options* and returns the corresponding SVG or HTML figure element. All *options* are optional.

#### Mark options

The *marks* option specifies the array of [marks](#Mark) to render. Each mark has its own data and options; see the respective mark type (*e.g.*, [Plot.barY](#barY) or [Plot.dot](#dot)) for which mark options are supported. Marks are drawn in *z*-order, last on top. For example, here bars are drawn on top of a single rule at *y* = 0.

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

The default *width* is 640. On Observable, it can be set to the [standard width](https://github.com/observablehq/stdlib/blob/master/README.md#width) to make full-width responsive plots. The default *height* is 396 if the plot has a *y* or *fy* scale; otherwise it is 90 if the plot has an *fx* scale, and 60 if it does not. (TODO The default *height* will be getting smarter for ordinal domains; see [#337](https://github.com/observablehq/plot/pull/337).)

TODO Describe the default margins based on the plot’s axes. Mention that margins are not automatically sized to make room for tick labels, as this would lead to inconsistent layout across plots; instead, you are expected to shorten your tick labels or increase the margins as needed.

Two additional options allow further customization:

* **style** - custom styles (*e.g.*, `"color: red"` or `{color: "red"}`)
* **caption** - a figure caption, either a string or HTML element

TODO Describe the default styles: the background is white, the max-width is 100%, the font is system-ui, the fill is currentColor to allow the CSS color to be inherited by marks and axes.

If a *caption* is specified, then Plot.plot returns an HTML figure element instead of an SVG element. To specify an HTML caption, consider using the [`html` tagged template literal](http://github.com/observablehq/htl); otherwise, the specified string represents text that will be escaped as needed.

#### Scale options

Within a given plot, marks share the same scales. For example, if there are two Plot.barY marks, both sets of bars will share the same *x* and *y* scales for a consistent representation of data. (Plot does not currently support dual-axis charts, which are [not advised](https://blog.datawrapper.de/dualaxis/).) Scales’ domains are automatically inferred from associated mark channel values, while scales’ ranges similarly have suitable automatic defaults.

Each scale’s options are specified as a nested options object within the top-level plot *options* whose name corresponds to the scale:

* **x** - horizontal position
* **y** - vertical position
* **r** - size or radius
* **color** - fill or stroke
* **opacity** - fill or stroke opacity

For example, to set the domain for the *x* and *y* scales, you might say:

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

TODO Plot supports several different types of scales. The most common is *linear* for a quantitative scale, but several other types of quantitative scale are also supported:

* *linear* -
* *sqrt* -
* *pow* -
* *log* -
* *symlog* -

For time:

* *utc* -
* *time* -

For ordinal data:

* *ordinal* -

For ordinal position:

* *ordinal* -
* *point* -
* *band* -

For color:

* *categorical* - defaults to the *tableau10* scheme
* *ordinal* - equivalent to *categorical*, but defaults to the *turbo* scheme
* *sequential* - equivalent to *linear*
* *diverging* - defaults to the *rdbu* scheme
* *cyclical* - equivalent to *linear*, but defaults to the *rainbow* scheme

Lastly, you can disable a scale using the *identity* scale type:

* *identity* - disables the scale, rendering values as given

Identity scales are useful to opt-out of Plot’s normal scale behavior, for example if you wish to return literal colors or pixel positions within a mark channel, rather than relying on Plot’s scales to convert abstract values into visual values automatically. In the case of position scales (*x* and *y*), the *identity* scale type is still a quantitative scale and may produce an axis; but unlike a linear scale, the domain and range are fixed based on the chart’s dimensions (representing pixels) and may not be configured.

TODO Describe how the scale’s default type is chosen based on data and marks.

The following options are supported for each scale:

* *scale*.**type** -
* *scale*.**domain** -
* *scale*.**pivot** -
* *scale*.**clamp** -
* *scale*.**nice** -
* *scale*.**zero** -
* *scale*.**range** -
* *scale*.**scheme** -
* *scale*.**interpolate** -
* *scale*.**reverse** -
* *scale*.**inset** -
* *scale*.**round** -
* *scale*.**align** -
* *scale*.**padding** -
* *scale*.**paddingInner** -
* *scale*.**paddingOuter** -
* *scale*.**percent** -
* *scale*.**transform** -

TODO Not all options are supported on all scale types.

The following scale schemes are supported:

* *brbg* -
* *prgn* -
* *piyg* -
* *puor* -
* *rdbu* -
* *rdgy* -
* *rdylbu* -
* *rdylgn* -
* *spectral* -
* *burd* -
* *buylrd* -
* *blues* -
* *greens* -
* *greys* -
* *purples* -
* *reds* -
* *oranges* -
* *turbo* -
* *viridis* -
* *magma* -
* *inferno* -
* *plasma* -
* *cividis* -
* *cubehelix* -
* *warm* -
* *cool* -
* *bugn* -
* *bupu* -
* *gnbu* -
* *orrd* -
* *pubugn* -
* *pubu* -
* *purd* -
* *rdpu* -
* *ylgnbu* -
* *ylgn* -
* *ylorbr* -
* *ylorrd* -
* *rainbow* -
* *sinebow* -
* *accent* -
* *category10* -
* *dark2* -
* *paired* -
* *pastel1* -
* *pastel2* -
* *set1* -
* *set2* -
* *set3* -
* *tableau10* -

The following scale interpolators are supported:

* *number* -
* *rgb* -
* *hsl* -
* *hcl* -
* *lab* -

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

<a href="#area" name="area">#</a> Plot.<b>area</b>(<i>data</i>, <i>options</i>)

…

<a href="#areaX" name="areaX">#</a> Plot.<b>areaX</b>(<i>data</i>, <i>options</i>)

…

<a href="#areaY" name="areaY">#</a> Plot.<b>areaY</b>(<i>data</i>, <i>options</i>)

…

<a href="#barX" name="barX">#</a> Plot.<b>barX</b>(<i>data</i>, <i>options</i>)

…

<a href="#barY" name="barY">#</a> Plot.<b>barY</b>(<i>data</i>, <i>options</i>)

…

<a href="#cell" name="cell">#</a> Plot.<b>cell</b>(<i>data</i>, <i>options</i>)

…

<a href="#cellX" name="cellX">#</a> Plot.<b>cellX</b>(<i>data</i>, <i>options</i>)

…

<a href="#cellY" name="cellY">#</a> Plot.<b>cellY</b>(<i>data</i>, <i>options</i>)

…

<a href="#dot" name="dot">#</a> Plot.<b>dot</b>(<i>data</i>, <i>options</i>)

…

<a href="#dotX" name="dotX">#</a> Plot.<b>dotX</b>(<i>data</i>, <i>options</i>)

…

<a href="#dotY" name="dotY">#</a> Plot.<b>dotY</b>(<i>data</i>, <i>options</i>)

…

<a href="#frame" name="frame">#</a> Plot.<b>frame</b>(<i>options</i>)

…

<a href="#line" name="line">#</a> Plot.<b>line</b>(<i>data</i>, <i>options</i>)

…

<a href="#lineX" name="lineX">#</a> Plot.<b>lineX</b>(<i>data</i>, <i>options</i>)

…

<a href="#lineY" name="lineY">#</a> Plot.<b>lineY</b>(<i>data</i>, <i>options</i>)

…

<a href="#link" name="link">#</a> Plot.<b>link</b>(<i>data</i>, <i>options</i>)

…

<a href="#rect" name="rect">#</a> Plot.<b>rect</b>(<i>data</i>, <i>options</i>)

…

<a href="#rectX" name="rectX">#</a> Plot.<b>rectX</b>(<i>data</i>, <i>options</i>)

…

<a href="#rectY" name="rectY">#</a> Plot.<b>rectY</b>(<i>data</i>, <i>options</i>)

…

<a href="#ruleX" name="ruleX">#</a> Plot.<b>ruleX</b>(<i>data</i>, <i>options</i>)

…

<a href="#ruleY" name="ruleY">#</a> Plot.<b>ruleY</b>(<i>data</i>, <i>options</i>)

…

<a href="#text" name="text">#</a> Plot.<b>text</b>(<i>data</i>, <i>options</i>)

…

<a href="#textX" name="textX">#</a> Plot.<b>textX</b>(<i>data</i>, <i>options</i>)

…

<a href="#textY" name="textY">#</a> Plot.<b>textY</b>(<i>data</i>, <i>options</i>)

…

<a href="#tickX" name="tickX">#</a> Plot.<b>tickX</b>(<i>data</i>, <i>options</i>)

…

<a href="#tickY" name="tickY">#</a> Plot.<b>tickY</b>(<i>data</i>, <i>options</i>)

…

### Transforms

<a href="#bin" name="bin">#</a> Plot.<b>bin</b>(<i>outputs</i>, <i>options</i>)

…

<a href="#binX" name="binX">#</a> Plot.<b>binX</b>(<i>outputs</i>, <i>options</i>)

…

<a href="#binY" name="binY">#</a> Plot.<b>binY</b>(<i>outputs</i>, <i>options</i>)

…

<a href="#group" name="group">#</a> Plot.<b>group</b>(<i>outputs</i>, <i>options</i>)

…

<a href="#groupX" name="groupX">#</a> Plot.<b>groupX</b>(<i>outputs</i>, <i>options</i>)

…

<a href="#groupY" name="groupY">#</a> Plot.<b>groupY</b>(<i>outputs</i>, <i>options</i>)

…

<a href="#groupZ" name="groupZ">#</a> Plot.<b>groupZ</b>(<i>outputs</i>, <i>options</i>)

…

<a href="#map" name="map">#</a> Plot.<b>map</b>(<i>outputs</i>, <i>options</i>)

…

<a href="#mapX" name="mapX">#</a> Plot.<b>mapX</b>(<i>map</i>, <i>options</i>)

…

<a href="#mapY" name="mapY">#</a> Plot.<b>mapY</b>(<i>map</i>, <i>options</i>)

…

<a href="#normalizeX" name="normalizeX">#</a> Plot.<b>normalizeX</b>(<i>options</i>)

…

<a href="#normalizeY" name="normalizeY">#</a> Plot.<b>normalizeY</b>(<i>options</i>)

…

<a href="#selectFirst" name="selectFirst">#</a> Plot.<b>selectFirst</b>(<i>options</i>)

…

<a href="#selectLast" name="selectLast">#</a> Plot.<b>selectLast</b>(<i>options</i>)

…

<a href="#selectMinX" name="selectMinX">#</a> Plot.<b>selectMinX</b>(<i>options</i>)

…

<a href="#selectMinY" name="selectMinY">#</a> Plot.<b>selectMinY</b>(<i>options</i>)

…

<a href="#selectMaxX" name="selectMaxX">#</a> Plot.<b>selectMaxX</b>(<i>options</i>)

…

<a href="#selectMaxY" name="selectMaxY">#</a> Plot.<b>selectMaxY</b>(<i>options</i>)

…

<a href="#stackX" name="stackX">#</a> Plot.<b>stackX</b>(<i>options</i>)

…

<a href="#stackX1" name="stackX1">#</a> Plot.<b>stackX1</b>(<i>options</i>)

…

<a href="#stackX2" name="stackX2">#</a> Plot.<b>stackX2</b>(<i>options</i>)

…

<a href="#stackY" name="stackY">#</a> Plot.<b>stackY</b>(<i>options</i>)

…

<a href="#stackY1" name="stackY1">#</a> Plot.<b>stackY1</b>(<i>options</i>)

…

<a href="#stackY2" name="stackY2">#</a> Plot.<b>stackY2</b>(<i>options</i>)

…

<a href="#windowX" name="windowX">#</a> Plot.<b>windowX</b>(<i>options</i>)

…

<a href="#windowY" name="windowY">#</a> Plot.<b>windowY</b>(<i>options</i>)

…

### Formats

<a href="#formatIsoDate" name="formatIsoDate">#</a> Plot.<b>formatIsoDate</b>(<i>date</i>)

…

<a href="#formatWeekday" name="formatWeekday">#</a> Plot.<b>formatWeekday</b>(<i>locale</i>, <i>format</i>)

…

<a href="#formatMonth" name="formatMonth">#</a> Plot.<b>formatMonth</b>(<i>locale</i>, <i>format</i>)

…
