<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";

const penguins = shallowRef([]);

const olympians = shallowRef([
  {weight: 31, height: 1.21, sex: "female"},
  {weight: 170, height: 2.21, sex: "male"}
]);

const gistemp = shallowRef([
  {Date: new Date("1880-01-01"), Anomaly: -0.78},
  {Date: new Date("2016-12-01"), Anomaly: 1.35}
]);

onMounted(() => {
  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
  d3.csv("../data/gistemp.csv", d3.autoType).then((data) => (gistemp.value = data));
  d3.csv("../data/penguins.csv", d3.autoType).then((data) => (penguins.value = data));
});

</script>

# Legends

Plot can generate **legends** for *color*, *opacity*, and *symbol* [scales](./scales.md). For example, the scatterplot below of body measurements of Olympic athletes includes a legend for its *color* scale, allowing the meaning of color to be interpreted by the reader. (The axes similarly document the meaning of the *x* and *y* position scales.)

:::plot defer https://observablehq.com/@observablehq/plot-olympians-scatterplot
```js
Plot.plot({
  color: {legend: true},
  marks: [
    Plot.dot(olympians, {x: "weight", y: "height", stroke: "sex"})
  ]
})
```
:::

The legend above is a *swatches* legend because the *color* scale is *ordinal* (with a *categorical* scheme). When the *color* scale is continuous, a *ramp* legend with a smooth gradient is generated instead. The plot below of global average surface temperature ([GISTEMP](https://data.giss.nasa.gov/gistemp/)) uses a *diverging* *color* scale to indicate the deviation from the 1951–1980 average in degrees Celsius.

:::plot defer https://observablehq.com/@observablehq/plot-colored-scatterplot
```js
Plot.plot({
  color: {
    scheme: "BuRd",
    legend: true
  },
  marks: [
    Plot.ruleY([0]),
    Plot.dot(gistemp, {x: "Date", y: "Anomaly", stroke: "Anomaly"})
  ]
})
```
:::

When an ordinal *color* scale is used redundantly with a *symbol* scale, the *symbol* legend will incorporate the color encoding. This is more accessible than using color alone, particularly for readers with color vision deficiency.

:::plot defer https://observablehq.com/@observablehq/plot-symbol-channel
```js
Plot.plot({
  grid: true,
  x: {label: "Body mass (g) →"},
  y: {label: "↑ Flipper length (mm)"},
  symbol: {legend: true},
  marks: [
    Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species", symbol: "species"})
  ]
})
```
:::

Plot does not yet generate legends for the *r* (radius) scale or the *length* scale. If you are interested in this feature, please upvote [#236](https://github.com/observablehq/plot/issues/236). In the meantime, you can implement a legend using marks as demonstrated in the [spike map](https://observablehq.com/@observablehq/plot-spike) example.

## Legend options

If the **legend** [scale option](./scales.md#scale-options) is true, the default legend will be produced for the scale; otherwise, the meaning of the **legend** option depends on the scale: for quantitative color scales, it defaults to *ramp* but may be set to *swatches* for a discrete scale (most commonly for *threshold* color scales); for *ordinal* *color* scales and *symbol* scales, only the *swatches* value is supported.

<!-- TODO Describe the color and opacity options. -->

Categorical and ordinal color legends are rendered as swatches, unless the **legend** option is set to *ramp*. The swatches can be configured with the following options:

* **tickFormat** - a format function for the labels
* **swatchSize** - the size of the swatch (if square)
* **swatchWidth** - the swatches’ width
* **swatchHeight** - the swatches’ height
* **columns** - the number of swatches per row
* **marginLeft** - the legend’s left margin
* **className** - a class name, that defaults to a randomly generated string scoping the styles
* **opacity** - the swatch fill opacity
* **width** - the legend’s width (in pixels)

Symbol legends are rendered as swatches and support the options above in addition to the following options:

* **fill** - the symbol fill color
* **fillOpacity** - the symbol fill opacity; defaults to 1
* **stroke** - the symbol stroke color
* **strokeOpacity** - the symbol stroke opacity; defaults to 1
* **strokeWidth** - the symbol stroke width; defaults to 1.5
* **r** - the symbol radius; defaults to 4.5 pixels

The **fill** and **stroke** symbol legend options can be specified as “color” to apply the color scale when the symbol scale is a redundant encoding. The **fill** defaults to none. The **stroke** defaults to currentColor if the fill is none, and to none otherwise. The **fill** and **stroke** options may also be inherited from the corresponding options on an associated dot mark.

Continuous color legends are rendered as a ramp, and can be configured with the following options:

* **label** - the scale’s label
* **ticks** - the desired number of ticks, or an array of tick values
* **tickFormat** - a format function for the legend’s ticks
* **tickSize** - the tick size
* **round** - if true (default), round tick positions to pixels
* **width** - the legend’s width
* **height** - the legend’s height
* **marginTop** - the legend’s top margin
* **marginRight** - the legend’s right margin
* **marginBottom** - the legend’s bottom margin
* **marginLeft** - the legend’s left margin
* **opacity** - the ramp’s fill opacity

The **style** legend option allows custom styles to override Plot’s defaults; it has the same behavior as in Plot’s top-level [plot options](./plots.md).

## legend(*options*)

Renders a standalone legend for the scale defined by the given *options* object, returning a SVG or HTML figure element. This element can then be inserted into the page as described in the [getting started guide](../getting-started.md). The *options* object must define at least one scale; see [scale options](./scales.md) for how to define a scale.

For example, here is a *ramp* legend of a *linear* *color* scale with the default domain of [0, 1] and default scheme *turbo*:

<PlotRender :options='{color: {type: "linear"}}' defer method="legend" />

```js
Plot.legend({color: {type: "linear"}})
```

The *options* object may also include any additional legend options described in the previous section. For example, to make the above legend slightly wider:

<PlotRender :options='{width: 320, color: {type: "linear"}}' defer method="legend" />

```js
Plot.legend({width: 320, color: {type: "linear"}})
```
