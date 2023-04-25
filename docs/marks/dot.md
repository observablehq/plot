<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, ref, shallowRef, onMounted} from "vue";
import alphabet from "../data/alphabet.ts";
import cars from "../data/cars.ts";
import penguins from "../data/penguins.ts";

const sorted = ref(true);
const aapl = shallowRef([]);
const congress = shallowRef([]);
const diamonds = shallowRef([]);
const gistemp = shallowRef([{Date: new Date("1880-01-01"), Anomaly: -0.78}, {Date: new Date("2016-12-01"), Anomaly: 1.35}]);
const stateage = shallowRef([]);
const us = shallowRef(null);
const statemesh = computed(() => us.value ? topojson.mesh(us.value, us.value.objects.states) : {type: null});
const counties = computed(() => us.value ? topojson.feature(us.value, us.value.objects.counties).features : []);

const xy = Plot.normalizeX({basis: "sum", z: "state", x: "population", y: "state"});

onMounted(() => {
  d3.csv("../data/aapl.csv", d3.autoType).then((data) => (aapl.value = data));
  d3.csv("../data/us-congress-2023.csv", d3.autoType).then((data) => (congress.value = data));
  d3.csv("../data/diamonds.csv", d3.autoType).then((data) => (diamonds.value = data));
  d3.csv("../data/gistemp.csv", d3.autoType).then((data) => (gistemp.value = data));
  Promise.all([
    d3.json("../data/us-counties-10m.json"),
    d3.csv("../data/us-county-population.csv")
  ]).then(([_us, _population]) => {
    const map = new Map(_population.map((d) => [d.state + d.county, +d.population]));
    _us.objects.counties.geometries.forEach((g) => (g.properties.population = map.get(g.id)));
    us.value = _us;
  });
  d3.csv("../data/us-population-state-age.csv", d3.autoType).then((data) => {
    const ages = data.columns.slice(1); // convert wide data to tidy data
    stateage.value = Object.assign(ages.flatMap((age) => data.map((d) => ({state: d.name, age, population: d[age]}))), {ages});
  });
});

</script>

# Dot mark

The **dot mark** draws circles or other symbols positioned in **x** and **y** as in a scatterplot. For example, the chart below shows the roughly-inverse relationship between car horsepower in *y*↑ and fuel efficiency in miles per gallon in *x*→.

:::plot https://observablehq.com/@observablehq/plot-basic-scatterplot
```js
Plot.dot(cars, {x: "economy (mpg)", y: "power (hp)"}).plot({grid: true})
```
:::

Using a function for **x**, we can instead plot the roughly-linear relationship when fuel efficiency is represented as gallons per 100 miles. (For fans of the metric system, 1 gallon per 100 miles is roughly 2.4 liters per 100 km.)

:::plot https://observablehq.com/@observablehq/plot-derived-value-scatterplot
```js
Plot.plot({
  grid: true,
  inset: 10,
  x: {label: "Fuel consumption (gallons per 100 miles) →"},
  y: {label: "↑ Horsepower"},
  marks: [
    Plot.dot(cars, {x: (d) => 100 / d["economy (mpg)"], y: "power (hp)"})
  ]
})
```
:::

Dots support **stroke** and **fill** channels in addition to position along **x** and **y**. Below, color is used as a redundant encoding to emphasize the rising trend in average global surface temperatures. A *diverging* color scale encodes values below zero blue and above zero red.

:::plot defer https://observablehq.com/@observablehq/plot-colored-scatterplot
```js
Plot.plot({
  y: {
    grid: true,
    tickFormat: "+f",
    label: "↑ Surface temperature anomaly (°F)"
  },
  color: {
    scheme: "BuRd"
  },
  marks: [
    Plot.ruleY([0]),
    Plot.dot(gistemp, {x: "Date", y: "Anomaly", stroke: "Anomaly"})
  ]
})
```
:::

Dots also support an **r** channel allowing dot size to represent quantitative value. Below, each dot represents a day of trading; the *x*-position represents the day’s change, while the *y*-position and area (**r**) represent the day’s trading volume. As you might expect, days with higher volatility have higher trading volume.

:::plot defer https://observablehq.com/@observablehq/plot-proportional-symbol-scatterplot
```js
Plot.plot({
  grid: true,
  x: {
    label: "Daily change (%) →",
    tickFormat: "+f",
    percent: true
  },
  y: {
    type: "log",
    label: "↑ Daily trading volume"
  },
  marks: [
    Plot.ruleX([0]),
    Plot.dot(aapl, {x: (d) => (d.Close - d.Open) / d.Open, y: "Volume", r: "Volume"})
  ]
})
```
:::

With the [bin transform](../transforms/bin.md), sized dots can also be used as an alternative to a [rect-based](./rect.md) heatmap to show a two-dimensional distribution.

:::plot defer https://observablehq.com/@observablehq/plot-proportional-dot-heatmap
```js
Plot.plot({
  height: 640,
  marginLeft: 60,
  grid: true,
  x: {label: "Carats →"},
  y: {label: "↑ Price ($)"},
  r: {range: [0, 20]},
  marks: [
    Plot.dot(diamonds, Plot.bin({r: "count"}, {x: "carat", y: "price", thresholds: 100}))
  ]
})
```
:::

:::tip
For hexagonal binning, use the [hexbin transform](../transforms/hexbin.md) instead of the bin transform.
:::

While dots are typically positioned in two dimensions (**x** and **y**), one-dimensional dots (only **x** or only **y**) are also supported. Below, dot area is used to represent the frequency of letters in the English language as a compact alternative to a bar chart.

:::plot https://observablehq.com/@observablehq/plot-dot-area-chart
```js
Plot.dot(alphabet, {x: "letter", r: "frequency"}).plot()
```
:::

Dots, together with [rules](./rule.md), can be used as a stylistic alternative to [bars](./bar.md) to produce a lollipop 🍭 chart. (Sadly these lollipops cannot be eaten.)

:::plot https://observablehq.com/@observablehq/plot-lollipop
```js
Plot.plot({
  x: {label: null, tickPadding: 6, tickSize: 0},
  y: {percent: true},
  marks: [
    Plot.ruleX(alphabet, {x: "letter", y: "frequency", strokeWidth: 2}),
    Plot.dot(alphabet, {x: "letter", y: "frequency", fill: "currentColor", r: 4})
  ]
})
```
:::

A dot may have an ordinal dimension on either **x** and **y**, as in the plot below comparing the demographics of states: color represents age group, **y** represents the state, and **x** represents the proportion of the state’s population in that age group. The [normalize transform](../transforms/normalize.md) is used to compute the relative proportion of each age group within each state, while the [group transform](../transforms/group.md) is used to pull out the *min* and *max* values for each state for a horizontal [rule](./rule.md).

:::plot defer https://observablehq.com/@observablehq/plot-dot-plot
```js
Plot.plot({
  height: 660,
  axis: null,
  grid: true,
  x: {
    axis: "top",
    label: "Population (%) →",
    percent: true
  },
  color: {
    scheme: "spectral",
    domain: stateage.ages, // in age order
    legend: true
  },
  marks: [
    Plot.ruleX([0]),
    Plot.ruleY(stateage, Plot.groupY({x1: "min", x2: "max"}, {...xy, sort: {y: "x1"}})),
    Plot.dot(stateage, {...xy, fill: "age", title: "age"}),
    Plot.text(stateage, Plot.selectMinX({...xy, textAnchor: "end", dx: -6, text: "state"}))
  ]
})
```
:::

```js
xy = Plot.normalizeX("sum", {x: "population", y: "state", z: "state"})
```

:::tip
To reduce code duplication, pull shared options out into an object (here `xy`) and then merge them into each mark’s options using the spread operator (`...`).
:::

To improve accessibility, particularly for readers with color vision deficiency, the **symbol** channel can be used in addition to color (or instead of it) to represent ordinal data.

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

Plot uses the following default symbols for filled dots:

:::plot
```js
Plot.dotX([
  "circle",
  "cross",
  "diamond",
  "square",
  "star",
  "triangle",
  "wye"
], {fill: "currentColor", symbol: Plot.identity}).plot()
```
:::

There is a separate set of default symbols for stroked dots:

:::plot
```js
Plot.dotX([
  "circle",
  "plus",
  "times",
  "triangle2",
  "asterisk",
  "square2",
  "diamond2",
], {stroke: "currentColor", symbol: Plot.identity}).plot()
```
:::

:::info
The stroked symbols are based on [Heman Robinson’s research](https://www.tandfonline.com/doi/abs/10.1080/10618600.2019.1637746). There is also a *hexagon* symbol; it is primarily intended for the [hexbin transform](../transforms/hexbin.md). You can even specify a D3 or custom symbol type as an object that implements the [*symbol*.draw(*context*, *size*)](https://github.com/d3/d3-shape/blob/main/README.md#custom-symbol-types) method.
:::

The dot mark can be combined with the [stack transform](../transforms/stack.md). The diverging stacked dot plot below shows the age and gender distribution of the U.S. Congress in 2023.

:::plot defer https://observablehq.com/@observablehq/plot-stacked-dots
```js
Plot.plot({
  aspectRatio: 1,
  x: {label: "Age (years) →"},
  y: {
    grid: true,
    label: "← Women · Men →",
    labelAnchor: "center",
    tickFormat: Math.abs
  },
  marks: [
    Plot.dot(
      congress,
      Plot.stackY2({
        x: (d) => 2023 - d.birthday.getUTCFullYear(),
        y: (d) => d.gender === "M" ? 1 : -1,
        fill: "gender",
        title: "full_name"
      })
    ),
    Plot.ruleY([0])
  ]
})
```
:::

:::info
The stackY2 transform places each dot at the upper bound of the associated stacked interval, rather than the middle of the interval as when using stackY. Hence, the first male dot is placed at *y* = 1, and the first female dot is placed at *y* = -1.
:::

:::tip
The [dodge transform](../transforms/dodge.md) can also be used to produce beeswarm plots; this is particularly effective when dots have varying radius.
:::

Dots are sorted by descending radius by default to mitigate occlusion; the smallest dots are drawn on top. Set the **sort** option to null to draw them in input order. Use the checkbox below to see the effect of sorting on a bubble map of U.S. county population.

<p>
  <label class="label-input">
    Use default sort:
    <input type="checkbox" v-model="sorted">
  </label>
</p>

:::plot defer https://observablehq.com/@observablehq/plot-dot-sort
```js
Plot.plot({
  projection: "albers-usa",
  marks: [
    Plot.geo(statemesh, {strokeOpacity: 0.4}),
    Plot.dot(counties, Plot.geoCentroid({
      r: (d) => d.properties.population,
      fill: "currentColor",
      stroke: "var(--vp-c-bg)",
      strokeWidth: 1,
      sort: sorted ? undefined : null
    }))
  ]
})
```
:::

The dot mark can also be used to construct a [quantile-quantile (QQ) plot](https://observablehq.com/@observablehq/qq-plot) for comparing two univariate distributions.

## Dot options

In addition to the [standard mark options](../features/marks.md#mark-options), the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale
* **y** - the vertical position; bound to the *y* scale
* **r** - the radius (area); bound to the *radius* scale, which defaults to *sqrt*
* **rotate** - the rotation angle in degrees clockwise
* **symbol** - the categorical symbol; bound to the *symbol* scale

If either of the **x** or **y** channels are not specified, the corresponding position is controlled by the **frameAnchor** option.

The following dot-specific constant options are also supported:

* **r** - the effective radius (length); a number in pixels
* **rotate** - the rotation angle in degrees clockwise; defaults to 0
* **symbol** - the categorical symbol; defaults to circle
* **frameAnchor** - how to position the dot within the frame; defaults to *middle*

The **r** option can be specified as either a channel or constant. When the radius is specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel. The radius defaults to 4.5 pixels when using the **symbol** channel, and otherwise 3 pixels. Dots with a nonpositive radius are not drawn.

The **stroke** defaults to *none*. The **fill** defaults to *currentColor* if the stroke is *none*, and to *none* otherwise. The **strokeWidth** defaults to 1.5. The **rotate** and **symbol** options can be specified as either channels or constants. When rotate is specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel. When symbol is a valid symbol name or symbol object (implementing the draw method), it is interpreted as a constant; otherwise it is interpreted as a channel. If the **symbol** channel’s values are all symbols, symbol names, or nullish, the channel is unscaled (values are interpreted literally); otherwise, the channel is bound to the *symbol* scale.

## dot(*data*, *options*)

```js
Plot.dot(sales, {x: "units", y: "fruit"})
```

Returns a new dot with the given *data* and *options*. If neither the **x** nor **y** nor **frameAnchor** options are specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

## dotX(*data*, *options*)

```js
Plot.dotX(cars.map((d) => d["economy (mpg)"]))
```

Equivalent to [dot](#dot-data-options) except that if the **x** option is not specified, it defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …].

If an **interval** is specified, such as d3.utcDay, **y** is transformed to (*interval*.floor(*y*) + *interval*.offset(*interval*.floor(*y*))) / 2. If the interval is specified as a number *n*, *y* will be the midpoint of two consecutive multiples of *n* that bracket *y*.

## dotY(*data*, *options*)

```js
Plot.dotY(cars.map((d) => d["economy (mpg)"]))
```

Equivalent to [dot](#dot-data-options) except that if the **y** option is not specified, it defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …].

If an **interval** is specified, such as d3.utcDay, **x** is transformed to (*interval*.floor(*x*) + *interval*.offset(*interval*.floor(*x*))) / 2. If the interval is specified as a number *n*, *x* will be the midpoint of two consecutive multiples of *n* that bracket *x*.

## circle(*data*, *options*)

Equivalent to [dot](#dot-data-options) except that the **symbol** option is set to *circle*.

## hexagon(*data*, *options*)

Equivalent to [dot](#dot-data-options) except that the **symbol** option is set to *hexagon*.
