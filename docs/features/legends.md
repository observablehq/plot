<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";

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
});

</script>

# Legends

:::danger TODO
This guide is still under construction. 🚧 Please come back when it’s finished.
:::

Plot can generate legends for *color*, *opacity*, and *symbol* [scales](./scales.md). For example, this scatterplot includes a *swatches* legend for its *categorical* *color* scale:

:::plot defer
```js
Plot.plot({
  color: {
    legend: true
  },
  marks: [
    Plot.dot(olympians, {x: "weight", y: "height", stroke: "sex"})
  ]
})
```
:::

Whereas this scatterplot renders a ramp legend for its diverging color scale:

:::plot defer
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

If the **legend** scale option is true, the default legend will be produced for the scale; otherwise, the meaning of the **legend** option depends on the scale: for quantitative color scales, it defaults to *ramp* but may be set to *swatches* for a discrete scale (most commonly for *threshold* color scales); for *ordinal* *color* scales and *symbol* scales, only the *swatches* value is supported.

<!-- TODO Describe the color and opacity options, and demo the symbol legend with a redundant color encoding. -->

## *plot*.legend(*scaleName*, *options*)

Given an existing *plot* returned by [Plot.plot](./plots.md), returns a detached legend for the *plot*’s scale with the given *scaleName*. The *scaleName* must refer to a scale that supports legends: either `"color"`, `"opacity"`, or `"symbol"`. For example:

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

The **style** legend option allows custom styles to override Plot’s defaults; it has the same behavior as in Plot’s top-level [layout options](./plots.md#layout).

## legend(*options*)

Returns a standalone legend for the scale defined by the given *options* object. The *options* object must define at least one scale; see [scale options](./scales.md) for how to define a scale. For example, here is a ramp legend of a linear color scale with the default domain of [0, 1] and default scheme *turbo*:

<PlotRender :options='{color: {type: "linear"}}' defer method="legend" />

```js
Plot.legend({color: {type: "linear"}})
```

The *options* object may also include any additional legend options described in the previous section. For example, to make the above legend slightly wider:

<PlotRender :options='{width: 320, color: {type: "linear"}}' defer method="legend" />

```js
Plot.legend({width: 320, color: {type: "linear"}})
```
