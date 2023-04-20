<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import aapl from "../data/aapl.ts";
import industries from "../data/bls-industry-unemployment.ts";
import penguins from "../data/penguins.ts";

const olympians = shallowRef([{weight: 31, height: 1.21, sex: "female"}, {weight: 170, height: 2.21, sex: "male"}]);

onMounted(() => {
  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
});

</script>

# Auto mark

The magic ✨ **auto mark** automatically selects a mark type that best represents the given dimensions of the data according to some simple heuristics. The auto mark is intended to support fast exploratory analysis where the goal is to get a useful plot as quickly as possible. For example, two quantitative dimensions make a scatterplot:

:::plot https://observablehq.com/@observablehq/plot-auto-mark-scatterplot
```js
Plot.auto(penguins, {x: "body_mass_g", y: "flipper_length_mm"}).plot()
```
:::

:::tip
The auto mark is supposed to be fast and fluid, so don’t overthink it. If you need precise control, use explicit marks instead.
:::

:::warning CAUTION
While the auto mark will respect the options you provide, you shouldn’t rely on its behavior being stable over time. The auto mark may get smarter and take advantage of new features.
Because its heuristics are likely to evolve, they are not explicitly documented; see the [source code](https://github.com/observablehq/plot/blob/main/src/marks/auto.js) for details.
:::

A monotonically increasing dimension (here *Date*, as the data is ordered chronologically), paired with a numeric column (*Close*), makes a line chart:

:::plot https://observablehq.com/@observablehq/plot-auto-mark-line-chart
```js
Plot.auto(aapl, {x: "Date", y: "Close"}).plot()
```
:::

Given only one dimension of data, it makes a histogram:

:::plot defer https://observablehq.com/@observablehq/plot-auto-mark-quantitative-histogram
```js
Plot.auto(olympians, {x: "weight"}).plot()
```
:::

:::plot https://observablehq.com/@observablehq/plot-auto-mark-ordinal-histogram
```js
Plot.auto(penguins, {x: "island"}).plot()
```
:::

This is easier than deciding whether to use bin and rect, or group and bar: the auto mark chooses the right one based on whether the data is quantitative or ordinal.

If you’d like to explicitly avoid grouping the data, you can opt out of the reducer, and get a one-dimensional plot:

:::plot https://observablehq.com/@observablehq/plot-auto-mark-barcode
```js
Plot.auto(penguins, {x: "body_mass_g", y: {reduce: null}}).plot()
```
:::

As you can see from that **reduce** property, the auto mark has some special syntax that lets you specify a reducer without explicitly specifying a transform. For example, the scatterplot above can be made into a heatmap by adding a color reducer. You can pass the name of a reducer to that property, or pass a shorthand string:

:::plot defer https://observablehq.com/@observablehq/plot-auto-mark-heatmap
```js
Plot.auto(olympians, {x: "weight", y: "height", color: "count"}).plot()
```
:::

That’s equivalent to this:

```js
Plot.rect(olympians, Plot.bin({fill: "count"}, {x: "weight", y: "height"})).plot()
```

Notice that the code above makes you think about nested functions and two different options objects, which the auto mark flattens. The auto mark infers that it should use a [rect](./rect.md); that it should [bin](../transforms/bin.md) on **x** and **y**; that the kind of color should be a **fill**; and that **fill** is an “output” of the reducer, whereas **x** and **y** are “inputs”.

This saves you a little bit of typing, but, more importantly, it means that switching from showing one dimension to another only involves changing _one thing_. In the code above, if you change **y** from *weight* to *sex*, it’ll break, because *sex* is ordinal instead of quantitative. (You’d also have to change [rect](./rect.md) to [barX](./bar.md#barx-data-options), and [bin](../transforms/bin.md#bin-outputs-options) to [binX](../transforms/bin.md#binx-outputs-options).) With the auto mark, it just works:

:::plot defer https://observablehq.com/@observablehq/plot-auto-mark-heatmap-2
```js
Plot.auto(olympians, {x: "weight", y: "sex", color: "count"}).plot()
```
:::

Similarly, with explicit marks and transforms, changing a vertical histogram to a horizontal histogram involves switching [rectY](./rect.md#recty-data-options) to [rectX](./rect.md#rectx-data-options), [binX](../transforms/bin.md#binx-outputs-options) to [binY](../transforms/bin.md#biny-outputs-options), **x** to **y**, and **y** to **x**. With the auto mark, just specify **y** instead of **x**:

:::plot https://observablehq.com/@observablehq/plot-auto-mark-vertical-histogram
```js
Plot.auto(penguins, {y: "island"}).plot()
```
:::

For the sake of seamless switching, the auto mark has just one color channel, which it assigns to either **fill** or **stroke** depending on the mark. We can see that clearly by overriding a line chart with the **mark** option to make an area chart:

:::plot https://observablehq.com/@observablehq/plot-auto-mark-color-channel
```js
Plot.auto(industries, {x: "date", y: "unemployed", color: "industry"}).plot()
```
:::

:::plot
```js
Plot.auto(industries, {x: "date", y: "unemployed", color: "industry", mark: "area"}).plot()
```
:::

The **mark** override option supports [dot](./dot.md), [line](./line.md), [area](./area.md), [rule](./rule.md), and [bar](./bar.md) (which automatically chooses among barX, barY, rectX, rectY, rect, and cell).

You can get a more elaborate aggregated chart by passing an object with both a **value** (the input dimension) and a **reduce** (the reducer). For example, here’s the average heights of Olympians over time by sex:

:::plot defer https://observablehq.com/@observablehq/plot-auto-mark-with-value-and-reduce
```js
Plot
  .auto(olympians, {x: "date_of_birth", y: {value: "height", reduce: "mean"}, color: "sex", mark: "line"})
  .plot({color: {legend: true}})
```
:::

You can similarly pass a **zero** option to indicate that zero is meaningful for either **x** or **y**. This adds a corresponding rule to the returned mark.

:::plot https://observablehq.com/@observablehq/plot-auto-mark-zero-option
```js
Plot.auto(industries, {x: "date", y: {value: "unemployed", zero: true}, color: "industry"}).plot()
```
:::

The auto mark has a **size** channel, which (currently) always results in a dot. For now, it’s an alias for the dot’s **r** channel; in the future it will also represent a vector’s **length** channel.

:::plot https://observablehq.com/@observablehq/plot-auto-mark-size-channel
```js
Plot.auto(aapl, {x: "Date", y: "Close", size: "Volume"}).plot()
```
:::

Like with any other mark, you can also use **fx** or **fy**, and pass additional global options in the plot method.

:::plot defer https://observablehq.com/@observablehq/plot-auto-mark-faceted
```js
Plot.auto(penguins, {
  x: "body_mass_g",
  y: "culmen_length_mm",
  fx: "island",
  fy: "species"
}).plot({
  x: {label: "Body mass →", ticks: 5},
  y: {label: "↑ Culmen length"},
  marginRight: 70
})
```
:::

:::warning Caution
You can combine the auto mark with other marks, but the combination may be brittle because the auto mark may pick encodings that don’t play well with others.
:::

## Auto options

The auto mark currently supports only a subset of the standard [mark options](../features/marks.md#mark-options). You must provide at least one position channel:

* **x** - horizontal position
* **y** - vertical position

You may also provide one or more visual encoding channels:

* **color** - corresponds to **stroke** or **fill** (depending on the chosen mark type)
* **size** - corresponds to **r** (and in future, possibly **length**)

And you may specify the standard mark-level facet channels:

* **fx** - horizontal facet position (column)
* **fy** - vertical facet position (row)

In addition to channel values, the **x**, **y**, **color**, and **size** options may specify reducers. Setting a reducer on **x** implicitly groups or bins on **y**, and likewise setting a reducer on **y** implicitly groups or bins on **x**. Setting a reducer on **color** or **size** groups or bins in both **x** and **y**. Setting a reducer on both **x** and **y** throws an error. To specify a reducer, simply pass the reducer name to the corresponding option. For example:

```js
Plot.auto(penguins, {x: "body_mass_g", y: "count"})
```

To pass both a value and a reducer, or to disambiguate whether the given string represents a field name or a reducer name, the **x**, **y**, **color**, and **size** options can also be specified as an object with separate **value** and **reduce** properties. For example, to compute the total weight of the penguins in each bin:

```js
Plot.auto(penguins, {x: "body_mass_g", y: {value: "body_mass_g", reduce: "sum"}})
```

If the **color** channel is specified as a string that is also a valid CSS color, it is interpreted as a constant color. For example, for red bars:

```js
Plot.auto(penguins, {x: "body_mass_g", color: "red"})
```

This is shorthand for:

```js
Plot.auto(penguins, {x: "body_mass_g", color: {color: "red"}})
```

To reference a field name instead as a variable color encoding, specify the **color** option as an object with a **value** property:

```js
Plot.auto(penguins, {x: "body_mass_g", color: {value: "red"}})
```

Alternatively, you can specify a function of data or an array of values, as with a standard mark channel.

The auto mark chooses the mark type automatically based on several simple heuristics. For more control, you can specify the desired mark type using the **mark** option, which supports the following names:

* *area* - areaY or areaX (or sometimes area)
* *bar* - barY or barX; or rectY, rectX, or rect; or cell
* *dot* - dot
* *line* - lineY or lineX (or sometimes line)
* *rule* - ruleY or ruleX

The chosen mark type depends both on the options you provide (*e.g.*, whether you specified **x** or **y** or both) and the inferred type of the corresponding data values (whether the associated dimension of data is quantitative, categorical, monotonic, *etc.*).

## auto(*data*, *options*)

```js
Plot.auto(olympians, {x: "weight", y: "height", color: "count"}) // equivalent to rect + bin, say
```

Returns an automatically-chosen mark with the given *data* and *options*, suitable for a quick view of the data.
