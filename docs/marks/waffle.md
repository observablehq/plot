<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref, shallowRef, onMounted} from "vue";

const apples = ref(512);
const unit = ref(10);

const olympians = shallowRef([
  {weight: 31, height: 1.21, sex: "female"},
  {weight: 170, height: 2.21, sex: "male"}
]);

const survey = [
  {question: "don’t go out after dark", yes: 96},
  {question: "do no activities other than school", yes: 89},
  {question: "engage in political discussion and social movements, including online", yes: 10},
  {question: "would like to do activities but are prevented by safety concerns", yes: 73}
];

onMounted(() => {
  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
});

</script>

# Waffle mark <VersionBadge version="0.6.16" pr="2040" />

The **waffle mark** is similar to the [bar mark](./bar.md) in that it displays a quantity (or quantitative extent) for a given category; but unlike a bar, a waffle is subdivided into square cells that allow easier counting. Waffles are useful for reading exact quantities. How quickly can you count the pears 🍐 below? How many more apples 🍎 are there than bananas 🍌?

:::plot https://observablehq.com/@observablehq/plot-simple-waffle
```js
Plot.waffleY([212, 207, 315, 11], {x: ["apples", "bananas", "oranges", "pears"]}).plot({height: 420})
```
:::

The waffle mark is often used with the [group transform](../transforms/group.md) to compute counts. The chart below compares the number of female and male athletes in the 2012 Olympics.

:::plot https://observablehq.com/@observablehq/plot-waffle-group
```js
Plot.waffleY(olympians, Plot.groupX({y: "count"}, {x: "sex"})).plot({x: {label: null}})
```
:::

:::info
Waffles are rendered using SVG patterns, making them more performant than alternatives such as the [dot mark](./dot.md) for rendering many points.
:::

The **unit** option determines the quantity each waffle cell represents; it defaults to one. The unit may be set to a value greater than one for large quantities, or less than one (but greater than zero) for small fractional quantities. Try changing the unit below to see its effect.

<p>
  <span class="label-input">
    Unit:
    <label style="margin-left: 0.5em;"><input type="radio" name="unit" value="1" v-model="unit" /> 1</label>
    <label style="margin-left: 0.5em;"><input type="radio" name="unit" value="2" v-model="unit" /> 2</label>
    <label style="margin-left: 0.5em;"><input type="radio" name="unit" value="5" v-model="unit" /> 5</label>
    <label style="margin-left: 0.5em;"><input type="radio" name="unit" value="10" v-model="unit" /> 10</label>
    <label style="margin-left: 0.5em;"><input type="radio" name="unit" value="25" v-model="unit" /> 25</label>
    <label style="margin-left: 0.5em;"><input type="radio" name="unit" value="50" v-model="unit" /> 50</label>
    <label style="margin-left: 0.5em;"><input type="radio" name="unit" value="100" v-model="unit" /> 100</label>
  </span>
</p>

:::plot https://observablehq.com/@observablehq/plot-waffle-unit
```js
Plot.waffleY(olympians, Plot.groupZ({y: "count"}, {fx: "date_of_birth", unit})).plot({fx: {interval: "5 years", label: null}})
```
:::

:::tip
Use [faceting](../features/facets.md) as an alternative to supplying an ordinal channel (_i.e._, *fx* instead of *x* for a vertical waffleY). The facet scale’s **interval** option then allows grouping by a quantitative or temporal variable, such as the athlete’s year of birth in the chart below.
:::

While waffles typically represent integer quantities, say to count people or days, they can also encode fractional values with a partial first or last cell. Set the **round** option to true to disable partial cells, or to Math.ceil or Math.floor to round up or down.

Like bars, waffles can be [stacked](../transforms/stack.md), and implicitly apply the stack transform when only a single quantitative channel is supplied.

:::plot https://observablehq.com/@observablehq/plot-stacked-waffles
```js
Plot.waffleY(olympians, Plot.groupZ({y: "count"}, {fill: "sex", sort: "sex", fx: "weight", unit: 10})).plot({fx: {interval: 10}, color: {legend: true}})
```
:::

Waffles can also be used to highlight a proportion of the whole. The chart below recreates a graphic of survey responses from [“Teens in Syria”](https://www.economist.com/graphic-detail/2015/08/19/teens-in-syria) by _The Economist_ (August 19, 2015); positive responses are in orange, while negative responses are in gray. The **rx** option is used to produce circles instead of squares.

:::plot https://observablehq.com/@observablehq/plot-survey-waffle
```js
Plot.plot({
  axis: null,
  label: null,
  height: 260,
  marginTop: 20,
  marginBottom: 70,
  title: "Subdued",
  subtitle: "Of 120 surveyed Syrian teenagers:",
  marks: [
    Plot.axisFx({lineWidth: 10, anchor: "bottom", dy: 20}),
    Plot.waffleY({length: 1}, {y: 120, fillOpacity: 0.4, rx: "100%"}),
    Plot.waffleY(survey, {fx: "question", y: "yes", rx: "100%", fill: "orange"}),
    Plot.text(survey, {fx: "question", text: (d) => (d.yes / 120).toLocaleString("en-US", {style: "percent"}), frameAnchor: "bottom", lineAnchor: "top", dy: 6, fill: "orange", fontSize: 24, fontWeight: "bold"})
  ]
})
```
:::

The waffle mark comes in two orientations: waffleY extends vertically↑, while waffleX extends horizontally→. The waffle mark automatically determines the appropriate number of cells per row or per column (depending on orientation) such that the cells are square, don’t overlap, and are consistent with position scales.

<p>
  <label class="label-input">
    <span>Apples:</span>
    <input type="range" v-model.number="apples" min="10" max="1028" step="1" />
    <span style="font-variant-numeric: tabular-nums;">{{apples}}</span>
  </label>
</p>

:::plot
```js
Plot.waffleX([apples], {y: ["apples"]}).plot({height: 240})
```
:::

:::info
The number of rows in the waffle above is guaranteed to be an integer, but it might not be a multiple or factor of the *x*-axis tick interval. For example, the waffle might have 15 rows while the *x*-axis shows ticks every 100 units.
:::
:::tip
To set the number of rows (or columns) directly, use the **multiple** option, though note that manually setting the multiple may result in non-square cells if there isn’t enough room. Alternatively, you can bias the automatic multiple while preserving square cells by setting the **padding** option on the corresponding band scale: padding defaults to 0.1; a higher value may produce more rows, while a lower (or zero) value may produce fewer rows.
:::

## Waffle options

For required channels, see the [bar mark](./bar.md). The waffle mark supports the [standard mark options](../features/marks.md), including [insets](../features/marks.md#insets) and [rounded corners](../features/marks.md#rounded-corners). The **stroke** defaults to *none*. The **fill** defaults to *currentColor* if the stroke is *none*, and to *none* otherwise.

The waffle mark supports a few additional options to control the rendering of cells:

* **unit** - the quantity each cell represents; defaults to 1
* **multiple** - the number of cells per row (or column); defaults to undefined
* **gap** - the separation between adjacent cells, in pixels; defaults to 1
* **round** - whether to round values to avoid partial cells; defaults to false

If **multiple** is undefined (the default), the waffle mark will use as many cells per row (or column) that fits within the available bandwidth while ensuring that the cells are square, or one cell per row if square cells are not possible. You can change the rounding behavior by specifying **round** as a function, such as Math.floor or Math.ceil; true is equivalent to Math.round.

## waffleX(*data*, *options*) {#waffleX}

```js
Plot.waffleX(olympians, Plot.groupY({x: "count"}, {y: "sport"}))
```

Returns a new horizontal→ waffle with the given *data* and *options*. The following channels are required:

* **x1** - the starting horizontal position; bound to the *x* scale
* **x2** - the ending horizontal position; bound to the *x* scale

The following optional channels are supported:

* **y** - the vertical position; bound to the *y* scale, which must be *band*

If neither the **x1** nor **x2** option is specified, the **x** option may be specified as shorthand to apply an implicit [stackX transform](../transforms/stack.md); this is the typical configuration for a horizontal waffle chart with columns aligned at *x* = 0. If the **x** option is not specified, it defaults to [identity](../features/transforms.md#identity). If *options* is undefined, then it defaults to **x2** as identity and **y** as the zero-based index [0, 1, 2, …]; this allows an array of numbers to be passed to waffleX to make a quick sequential waffle chart. If the **y** channel is not specified, the column will span the full vertical extent of the plot (or facet).

If an **interval** is specified, such as d3.utcDay, **x1** and **x2** can be derived from **x**: *interval*.floor(*x*) is invoked for each *x* to produce *x1*, and *interval*.offset(*x1*) is invoked for each *x1* to produce *x2*. If the interval is specified as a number *n*, *x1* and *x2* are taken as the two consecutive multiples of *n* that bracket *x*. Named UTC intervals such as *day* are also supported; see [scale options](../features/scales.md#scale-options).

## waffleY(*data*, *options*) {#waffleY}

```js
Plot.waffleY(olympians, Plot.groupX({y: "count"}, {x: "sport"}))
```

Returns a new vertical↑ waffle with the given *data* and *options*. The following channels are required:

* **y1** - the starting vertical position; bound to the *y* scale
* **y2** - the ending vertical position; bound to the *y* scale

The following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale, which must be *band*

If neither the **y1** nor **y2** option is specified, the **y** option may be specified as shorthand to apply an implicit [stackY transform](../transforms/stack.md); this is the typical configuration for a vertical waffle chart with columns aligned at *y* = 0. If the **y** option is not specified, it defaults to [identity](../features/transforms.md#identity). If *options* is undefined, then it defaults to **y2** as identity and **x** as the zero-based index [0, 1, 2, …]; this allows an array of numbers to be passed to waffleY to make a quick sequential waffle chart. If the **x** channel is not specified, the column will span the full horizontal extent of the plot (or facet).

If an **interval** is specified, such as d3.utcDay, **y1** and **y2** can be derived from **y**: *interval*.floor(*y*) is invoked for each *y* to produce *y1*, and *interval*.offset(*y1*) is invoked for each *y1* to produce *y2*. If the interval is specified as a number *n*, *y1* and *y2* are taken as the two consecutive multiples of *n* that bracket *y*. Named UTC intervals such as *day* are also supported; see [scale options](../features/scales.md#scale-options).
