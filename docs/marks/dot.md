<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import alphabet from "../data/alphabet.ts";
import cars from "../data/cars.ts";

const aapl = shallowRef([]);
const diamonds = shallowRef([]);
const gistemp = shallowRef([
  {Date: new Date("1880-01-01"), Anomaly: -0.78},
  {Date: new Date("2016-12-01"), Anomaly: 1.35}
]);

onMounted(() => {
  d3.csv("../data/aapl.csv", d3.autoType).then((data) => (aapl.value = data));
  d3.csv("../data/diamonds.csv", d3.autoType).then((data) => (diamonds.value = data));
  d3.csv("../data/gistemp.csv", d3.autoType).then((data) => (gistemp.value = data));
});

</script>

# Dot mark

The **dot mark** draws circles or other symbols, typically positioned in **x** and **y** quantitative dimensions, as in a scatterplot. For example, the scatterplot below shows the roughly-inverse relationship in a dataset of cars between power (in horsepower) in *y*↑ and fuel efficiency (in miles per gallon) in *x*→.

:::plot
```js
Plot.plot({
  grid: true,
  marks: [
    Plot.dot(cars, {x: "economy (mpg)", y: "power (hp)"})
  ]
})
```
:::

Using a functional definition of **x**, we can instead plot the roughly-linear relationship when fuel efficiency is represented as gallons per 100 miles, similar to the liters per 100 km metric used in countries that have adopted the metric system.

:::plot
```js
Plot.plot({
  grid: true,
  inset: 10,
  x: {label: "Fuel consumption (gallons per 100 miles) →"},
  y: {label: "↑ Horsepower"},
  marks: [
    Plot.dot(cars, {
      x: (d) => 100 / (d["economy (mpg)"] ?? NaN),
      y: "power (hp)"
    })
  ]
})
```
:::

:::info
This data contains nulls; nullish coalescing (`??`) to NaN prevents coercion to zero.
:::

Dots support **stroke** and **fill** channels in addition to position along **x** and **y**. Below, color is used as a redundant encoding to emphasize the rising trend in average global surface temperatures. A *diverging* color scale assigns values below zero blue and above zero red.

:::plot defer
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

Dots also support an **r** channel allowing the size of dots to represent data. Below, each dot represents a trading day; the *x*-position represents the day’s change, while the *y*-position and area (**r**) represent the day’s trading volume. As you might expect, days with higher volatility have higher trading volume.

:::plot defer
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

:::plot defer
```js
Plot.plot({
  height: 640,
  grid: true,
  x: {
    label: "Carats →"
  },
  y: {
    label: "↑ Price ($)"
  },
  r: {
    range: [0, 20]
  },
  marks: [
    Plot.dot(diamonds, Plot.bin({r: "count"}, {x: "carat", y: "price", thresholds: 100}))
  ]
})
```
:::

While dots are typically positioned in two dimensions (*x* and *y*), one-dimensional dots (only *x* or only *y*) are also supported. Below, dot area is used to represent the frequency of letters in the English language as a compact alternative to a bar chart.

:::plot
```js
Plot.plot({
  marks: [
    Plot.dot(alphabet, {x: "letter", r: "frequency", fill: "currentColor"})
  ]
})
```
:::

Dots can also be used to mark observations in low-density data, so it’s easy to distinguish what was observed from what is interpolated. For example, the connected scatterplot below plots how the relationship between annual per capita driving and the price of gasoline has changed over time. (This recreates Hannah Fairfield’s [“Driving Shifts Into Reverse”](http://www.nytimes.com/imagepages/2010/05/02/business/02metrics.html) from 2009.)

```js
Plot.plot({
  grid: true,
  x: {
    label: "Miles driven (per capita per year) →"
  },
  y: {
    label: "↑ Price of gas (average per gallon, adjusted)"
  },
  marks: [
    Plot.line(driving, {x: "miles", y: "gas", curve: "catmull-rom"}),
    Plot.dot(driving, {x: "miles", y: "gas", fill: "currentColor"}),
    Plot.text(driving, {filter: (d) => d.year % 5 === 0, x: "miles", y: "gas", text: "year", dy: -8})
  ]
})
```

Dots, together with [rules](./rule.md), can be used as a stylistic alternative to [bars](./bar.md) to produce a “lollipop” chart. Sadly these lollipops cannot actually be eaten.

```js
Plot.plot({
  x: {
    label: null,
    tickSize: 0
  },
  y: {
    label: "↑ Frequency (%)",
    transform: (d) => d * 100
  },
  marks: [
    Plot.ruleY([0]),
    Plot.ruleX(alphabet, {x: "letter", y: "frequency", fill: "black"}),
    Plot.dot(alphabet, {x: "letter", y: "frequency", fill: "black", r: 4})
  ]
})
```

Sometimes, a scatterplot may have an ordinal dimension on either *x* and *y*, as in the plot below comparing the demographics of states: color represents age group, and *x* represents the proportion of the state’s population in that age group. A *reduce* transform is used to pull out the minimum and maximum values for each state such that a rule can span the extent for better Gestalt grouping.

```js
stateage = {
  const data = await FileAttachment("us-population-state-age.csv").csv({typed: true});
  const ages = data.columns.slice(1); // convert wide data to tidy data
  return Object.assign(ages.flatMap(age => data.map((d) => ({state: d.name, age, population: d[age]}))), {ages});
}
```

```js
{
  const xy = Plot.normalizeX({basis: "sum", z: "state", x: "population", y: "state"});
  return Plot.plot({
    height: 660,
    grid: true,
    x: {
      axis: "top",
      label: "Percent (%) →",
      transform: (d) => d * 100
    },
    y: {
      axis: null
    },
    color: {
      scheme: "spectral",
      domain: stateage.ages, // in order
      legend: true
    },
    marks: [
      Plot.ruleX([0]),
      Plot.ruleY(stateage, Plot.groupY({x1: "min", x2: "max"}, xy)),
      Plot.dot(stateage, {...xy, fill: "age", title: "age"}),
      Plot.text(stateage, Plot.selectMinX({...xy, textAnchor: "end", dx: -6, text: "state"}))
    ]
  });
}
```

As another example of a scatterplot with an ordinal dimension, we can plot age groups along the *x*-axis and connect states with lines. This emphasizes the overall age distribution of the United States, while giving a hint to variation across states.

```js
{
  const xy = Plot.normalizeY({basis: "sum", z: "state", x: "age", y: "population"});
  return Plot.plot({
    grid: true,
    x: {
      domain: stateage.ages, // in order
      label: "Age range (years) →",
      labelAnchor: "right"
    },
    y: {
      label: "↑ Percent of population (%)",
      transform: (d) => d * 100
    },
    marks: [
      Plot.ruleY([0]),
      Plot.line(stateage, {...xy, strokeWidth: 1, stroke: "#ccc"}),
      Plot.dot(stateage, xy)
    ]
  });
}
```

Another visualization technique supported by the dot mark is the [quantile-quantile (QQ) plot](https://observablehq.com/d/6bb4330bca6eba2b); this is used to compare univariate two distributions.

## Dot options

In addition to the [standard mark options](#marks), the following optional channels are supported:

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
* **frameAnchor** - the [frame anchor](#frameanchor); defaults to *middle*

The **r** option can be specified as either a channel or constant. When the radius is specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel. The radius defaults to 4.5 pixels when using the **symbol** channel, and otherwise 3 pixels. Dots with a nonpositive radius are not drawn.

The **stroke** defaults to none. The **fill** defaults to currentColor if the stroke is none, and to none otherwise. The **strokeWidth** defaults to 1.5. The **rotate** and **symbol** options can be specified as either channels or constants. When rotate is specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel. When symbol is a valid symbol name or symbol object (implementing the draw method), it is interpreted as a constant; otherwise it is interpreted as a channel. If the **symbol** channel’s values are all symbols, symbol names, or nullish, the channel is unscaled (values are interpreted literally); otherwise, the channel is bound to the *symbol* scale.

The built-in **symbol** types are: *circle*, *cross*, *diamond*, *square*, *star*, *triangle*, and *wye* (for fill) and *circle*, *plus*, *times*, *triangle2*, *asterisk*, *square2*, and *diamond2* (for stroke, based on [Heman Robinson’s research](https://www.tandfonline.com/doi/abs/10.1080/10618600.2019.1637746)). The *hexagon* symbol is also supported. You can also specify a D3 or custom symbol type as an object that implements the [*symbol*.draw(*context*, *size*)](https://github.com/d3/d3-shape/blob/main/README.md#custom-symbol-types) method.

Dots are sorted by descending radius by default to mitigate overplotting; set the **sort** option to null to draw them in input order.

## dot(*data*, *options*)

```js
Plot.dot(sales, {x: "units", y: "fruit"})
```

Returns a new dot with the given *data* and *options*. If neither the **x** nor **y** nor **frameAnchor** options are specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

## dotX(*data*, *options*)

```js
Plot.dotX(cars.map((d) => d["economy (mpg)"]))
```

Equivalent to [Plot.dot](#plotdotdata-options) except that if the **x** option is not specified, it defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …].

If an **interval** is specified, such as d3.utcDay, **y** is transformed to (*interval*.floor(*y*) + *interval*.offset(*interval*.floor(*y*))) / 2. If the interval is specified as a number *n*, *y* will be the midpoint of two consecutive multiples of *n* that bracket *y*.

## dotY(*data*, *options*)

```js
Plot.dotY(cars.map((d) => d["economy (mpg)"]))
```

Equivalent to [Plot.dot](#plotdotdata-options) except that if the **y** option is not specified, it defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …].

If an **interval** is specified, such as d3.utcDay, **x** is transformed to (*interval*.floor(*x*) + *interval*.offset(*interval*.floor(*x*))) / 2. If the interval is specified as a number *n*, *x* will be the midpoint of two consecutive multiples of *n* that bracket *x*.

## circle(*data*, *options*)

Equivalent to [Plot.dot](#plotdotdata-options) except that the **symbol** option is set to *circle*.

## hexagon(*data*, *options*)

Equivalent to [Plot.dot](#plotdotdata-options) except that the **symbol** option is set to *hexagon*.
