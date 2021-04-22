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

Plot is also available as a [UMD bundle](https://cdn.jsdelivr.net/npm/@observablehq/plot/dist/) which is published to npm.

## API Reference

<a href="#plot" name="plot">#</a> Plot.<b>plot</b>({<i>marks</i>, ...<i>options</i>})

Renders a new plot given the specified *marks* and other *options* and returns the corresponding SVG or HTML figure element.

The *marks* option specifies the types of graphical shapes to draw and their associated data. Each mark in the *marks* array is typically an instance of [Plot.Mark](#Mark) (such as the result of calling [Plot.barY](#barY) or [Plot.dot](#dot)) which renders SVG elements (such as SVG rect or circle elements). Marks are drawn in *z*-order, last on top. Each mark may also be a nested array of marks, allowing mark composition. Each mark has its own data and options; see [Marks](#marks) for which options are supported for each mark class.

Within a given plot, marks share the same scales. For example, if there are two Plot.barY marks, both sets of bars will share the same *x* and *y* scales for a consistent representation of data. (Plot does not currently support dual-axis charts, which are also [not advised](https://blog.datawrapper.de/dualaxis/).) Scales’ domains are automatically inferred from associated mark channel values, while scales’ ranges similarly have suitable automatic defaults.

Separate options may be passed for each scale:

* **x** - (horizontal) *x*-position
* **y** - (vertical) *y*-position
* **r** - size or radius
* **color** - fill or stroke
* **opacity** - fill or stroke opacity

The following scale options are supported:

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

Chart dimension options…

* **marginTop** -
* **marginRight** -
* **marginBottom** -
* **marginLeft** -
* **width** -
* **height** -

Other chart options…

* **style** - custom styles, either a string or object (*e.g.*, `"color: red"` or `{color: "red"}`)
* **caption** - a figure caption, either a string, HTML element, or Text node

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
