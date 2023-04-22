<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import alphabet from "../data/alphabet.ts";
import crimea from "../data/crimea.ts";
import {computed, ref, shallowRef, onMounted} from "vue";

const congress = shallowRef([]);
const offsets = ref("wiggle");
const offset = computed(() => offsets.value === "null" ? null : offsets.value);
const orders = ref("appearance");
const order = computed(() => orders.value === "null" ? null : orders.value);
const reverse = ref(true);
const riaa = shallowRef([]);
const survey = shallowRef([]);

onMounted(() => {
  d3.csv("../data/riaa-us-revenue.csv", d3.autoType).then((data) => (riaa.value = data));
  d3.csv("../data/survey.csv", d3.autoType).then((data) => (survey.value = data));
  d3.csv("../data/us-congress-2023.csv", d3.autoType).then((data) => (congress.value = data));
});

function Likert(responses) {
  const map = new Map(responses);
  return {
    order: Array.from(map.keys()),
    offset(I, X1, X2, Z) {
      for (const stacks of I) {
        for (const stack of stacks) {
          const k = d3.sum(stack, (i) => (X2[i] - X1[i]) * (1 - map.get(Z[i]))) / 2;
          for (const i of stack) {
            X1[i] -= k;
            X2[i] -= k;
          }
        }
      }
    }
  };
}

const likert = Likert([
  ["Strongly Disagree", -1],
  ["Disagree", -1],
  ["Neutral", 0],
  ["Agree", 1],
  ["Strongly Agree", 1]
]);

</script>

# Stack transform

The **stack transform** comes in two orientations: [stackY](#stackystack-options) replaces **y** with **y1** and **y2** to form vertical↑ stacks grouped on **x**, while [stackX](#stackx-stack-options) replaces **x** with **x1** and **x2** for horizontal→ stacks grouped on **y**.  In effect, stacking transforms a *length* into *lower* and *upper* positions: the upper position of each element equals the lower position of the next element in the stack. Stacking makes it easier to perceive a total while still showing its parts.

For example, below is a stacked area chart of [deaths in the Crimean War](https://en.wikipedia.org/wiki/Florence_Nightingale#Crimean_War)—predominantly from <span :style="{borderBottom: `solid ${d3.schemeTableau10[0]} 3px`}">disease</span>—using  Florence Nightingale’s data.

:::plot
```js
Plot.plot({
  y: {grid: true},
  color: {legend: true},
  marks: [
    Plot.areaY(crimea, {x: "date", y: "deaths", fill: "cause"}),
    Plot.ruleY([0])
  ]
})
```
:::

:::tip
The [areaY mark](../marks/area.md) applies the stackY transform implicitly if you do not specify either **y1** or **y2**. The same applies to [barY](../marks/bar.md) and [rectY](../marks/rect.md). You can invoke the stack transform explicitly as `Plot.stackY({x: "date", y: "deaths", fill: "cause"})` to produce an identical chart.
:::

The stack transform works with any mark that consumes **y1** & **y2** or **x1** & **x2**, so you can stack rects, too.

:::plot
```js
Plot.plot({
  y: {grid: true},
  marks: [
    Plot.rectY(crimea, {x: "date", y: "deaths", interval: "month", fill: "cause"}),
    Plot.ruleY([0])
  ]
})
```
:::

:::info
The [interval mark option](./interval.md) specifies the periodicity of the data; without it, Plot wouldn’t know how wide to make the rects.
:::

And you can stack bars if you’d prefer to treat *x* as ordinal.

:::plot
```js
Plot.plot({
  x: {
    interval: "month",
    tickFormat: (d) => d.toLocaleString("en", {month: "narrow"}),
    label: null
  },
  y: {grid: true},
  marks: [
    Plot.barY(crimea, {x: "date", y: "deaths", fill: "cause"}),
    Plot.ruleY([0])
  ]
})
```
:::

:::info
The [interval scale option](./interval.md) specifies the periodicity of the data; without it, any gaps in the data would not be visible since barY implies that *x* is ordinal.
:::

The stackY transform also outputs **y** representing the midpoint of **y1** and **y2**, and likewise stackX outputs **x** representing the midpoint of **x1** and **x2**. This is useful for point-based marks such as [text](../marks/text.md) and [dot](../marks/dot.md). Below, a single stacked horizontal [bar](../marks/bar.md) shows the relative frequency of English letters; this form is a compact alternative to a pie 🥧 or donut 🍩 chart.

:::plot https://observablehq.com/@observablehq/plot-stacked-percentages
```js
Plot.plot({
  x: {percent: true},
  marks: [
    Plot.barX(alphabet, Plot.stackX({x: "frequency", fillOpacity: 0.3, inset: 0.5})),
    Plot.textX(alphabet, Plot.stackX({x: "frequency", text: "letter", inset: 0.5})),
    Plot.ruleX([0, 1])
  ]
})
```
:::

The **order** option controls the order in which the layers are stacked. It defaults to null, meaning to respect the input order of the data. The *appearance* order excels when each series has a prominent peak, as in the chart below of [recording industry](https://en.wikipedia.org/wiki/Recording_Industry_Association_of_America) revenue. <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[0]}`}">Compact disc</span> sales started declining well before the rise of <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[1]}`}">downloads</span> and <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[3]}`}">streaming</span>, suggesting that the industry was slow to provide a convenient digital product and hence lost revenue to piracy.

<p>
  <label class="label-input">
    Order:
    <select v-model="orders">
      <option>null</option>
      <option>appearance</option>
      <option>inside-out</option>
      <option>sum</option>
      <option>group</option>
      <option>z</option>
    </select>
  </label>
</p>

:::plot defer
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Annual revenue (billions, adj.)",
    transform: (d) => d / 1000 // convert millions to billions
  },
  color: {legend: true},
  marks: [
    Plot.areaY(riaa, {x: "year", y: "revenue", z: "format", fill: "group", order}),
    Plot.ruleY([0])
  ]
})
```
:::

:::info
In this data, the *group* field is a supercategory of the *format* field, which is useful to avoid overwhelming the color encoding with too many categories. For example, the *Vinyl* group includes both the *LP/EP* and *Vinyl Single* formats.
:::

The **reverse** option reverses the order of layers. In conjunction with the *appearance* order, now layers enter from the bottom rather than the top.

<p>
  <label class="label-input">
    Reverse:
    <input type="checkbox" v-model="reverse">
  </label>
</p>

:::plot defer
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Annual revenue (billions, adj.)",
    transform: (d) => d / 1000 // convert millions to billions
  },
  color: {legend: true},
  marks: [
    Plot.areaY(riaa, {x: "year", y: "revenue", z: "format", fill: "group", order: "appearance", reverse}),
    Plot.ruleY([0])
  ]
})
```
:::

:::warning CAUTION
The **reverse** option is also used by the [sort transform](./sort.md). To disambiguate, pass the *stack* options separately using the two-argument form of the stack transform.
:::

The *value* **order** is worth special mention: it sorts each stack by value independently such that the order of layers can change, emphasizing the changing ranks of layers. This is sometimes called a “ribbon” chart. (In fact, the default null **order** supports changing order of layers, too! But most often data comes already sorted by series.)

:::plot defer
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Annual revenue (billions, adj.)",
    transform: (d) => d / 1000 // convert millions to billions
  },
  marks: [
    Plot.areaY(riaa, {x: "year", y: "revenue", z: "format", fill: "group", order: "value"}),
    Plot.ruleY([0])
  ]
})
```
:::

The **offset** option controls the baseline of stacked layers. It defaults to null for a *y* = 0 baseline (for stackY, or *x* = 0 for stackX). The *center* **offset** centers each stack independently per [Havre *et al.*](https://innovis.cpsc.ucalgary.ca/innovis/uploads/Courses/InformationVisualizationDetails2009/Havre2000.pdf); the *wiggle* **offset** minimizes apparent movement per [Byron & Wattenberg](http://leebyron.com/streamgraph/stackedgraphs_byron_wattenberg.pdf); these two offsets produce “streamgraphs”, so called for their fluid appearance. The *wiggle* **offset** changes the default **order** to *inside-out* to further minimize movement.

<p>
  <label class="label-input">
    Offset:
    <select v-model="offsets">
      <option>null</option>
      <option>center</option>
      <option>wiggle</option>
    </select>
  </label>
</p>

:::plot defer
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Annual revenue (billions, adj.)",
    transform: (d) => d / 1000
  },
  marks: [
    Plot.areaY(riaa, {x: "year", y: "revenue", z: "format", fill: "group", offset})
  ]
})
```
:::

:::warning CAUTION
When **offset** is not null, the *y* axis is harder to use because there is no longer a shared baseline at *y* = 0, though it is still useful for eyeballing length.
:::

The *normalize* **offset** is again worth special mention: it scales stacks to fill the interval [0, 1], thereby showing the relative proportion of each layer. Sales of <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[0]}`}">compact discs</span> accounted for over 90% of revenue in the early 2000’s, but now most revenue comes from <span :style="{borderBottom: `solid 2px ${d3.schemeTableau10[3]}`}">streaming</span>.

:::plot defer
```js
Plot.plot({
  y: {
    label: "↑ Annual revenue (%)",
    percent: true
  },
  marks: [
    Plot.areaY(riaa, {x: "year", y: "revenue", z: "format", fill: "group", offset: "normalize", order: "group", reverse: true}),
    Plot.ruleY([0, 1])
  ]
})
```
:::

When the provided length (typically **y**) is negative, in conjunction with the null **offset** the stack transform will produce diverging stacks on opposites sides of the zero baseline. The diverging stacked dot plot below shows the age and gender distribution of the U.S. Congress in 2023. This form is also often *popular* for [population pyramids](https://observablehq.com/@observablehq/plot-population-pyramid).

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
      Plot.stackY({
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

When visualizing [Likert scale](https://en.wikipedia.org/wiki/Likert_scale) survey results we may wish to place <span :style="{borderWidth: 2, borderBottomStyle: 'solid', borderImage: `linear-gradient(to right, ${d3.schemeRdBu[5][0]}, ${d3.schemeRdBu[5][1]}) 2`}">negative</span> (disagreeing) responses on the left and <span :style="{borderWidth: 2, borderBottomStyle: 'solid', borderImage: `linear-gradient(to right, ${d3.schemeRdBu[5][3]}, ${d3.schemeRdBu[5][4]}) 2`}">positive</span> (agreeing) responses on the right, leaving <span :style="{borderBottom: `solid 2px ${d3.schemeRdBu[5][2]}`}">neutral</span> responses in the middle. This is acheived below using a custom **offset** function.

:::plot defer
```js
Plot.plot({
  x: {tickFormat: Math.abs},
  color: {domain: likert.order, scheme: "RdBu", legend: true},
  marks: [
    Plot.barX(
      survey,
      Plot.groupZ({x: "count"}, {fy: "Question", fill: "Response", ...likert})
    ),
    Plot.ruleX([0])
  ]
})
```
:::

Here `likert` declares which response values are negative (`-1`), which are positive (`1`), and which are neutral (`0`).

```js
likert = Likert([
  ["Strongly Disagree", -1],
  ["Disagree", -1],
  ["Neutral", 0],
  ["Agree", 1],
  ["Strongly Agree", 1]
])
```

And `Likert` implements the **order** (as an explicit array of ordinal values, such that the ordinal color scale lists in the correct order rather than sorting alphabetically) and **offset** (as a function that mutates the **x1** and **x2** channel values) stack options.

```js
function Likert(responses) {
  const map = new Map(responses);
  return {
    order: Array.from(map.keys()),
    offset(I, X1, X2, Z) {
      for (const stacks of I) {
        for (const stack of stacks) {
          const k = d3.sum(stack, (i) => (X2[i] - X1[i]) * (1 - map.get(Z[i]))) / 2;
          for (const i of stack) {
            X1[i] -= k;
            X2[i] -= k;
          }
        }
      }
    }
  };
}
```

See the [Marimekko example](https://observablehq.com/@observablehq/plot-marimekko) for another interesting application of the stack transform.

## Stack options

The stackY transform groups on **x** and transforms **y** into **y1** and **y2**; the stackX transform groups on **y** and transforms **x** into **x1** and **x2**. If **y** is not specified for stackY, or if **x** is not specified for stackX, it defaults to the constant one, which is useful for constructing simple isotype charts (*e.g.*, stacked dots).

The supported stack options are:

- **offset** - the offset (or baseline) method
- **order** - the order in which stacks are layered
- **reverse** - true to reverse order

The following **order** methods are supported:

- null (default) - input order
- *value* - ascending value order (or descending with **reverse**)
- *x* - alias of *value*; for stackX only
- *y* - alias of *value*; for stackY only
- *sum* - order series by their total value
- *appearance* - order series by the position of their maximum value
- *inside-out* (default with *wiggle*) - order the earliest-appearing series on the inside
- a named field or function of data - order data by priority
- an array of *z* values

The **reverse** option reverses the effective order. For the *value* order, stackY uses the *y* value while stackX uses the *x* value. For the *appearance* order, stackY uses the *x* position of the maximum *y* value while stackX uses the *y* position of the maximum *x* value. If an array of *z* values are specified, they should enumerate the *z* values for all series in the desired order; this array is typically hard-coded or computed with [d3.groupSort](https://github.com/d3/d3-array/blob/main/README.md#groupSort). Note that the input order (null) and *value* order can produce crossing paths: they do not guarantee a consistent series order across stacks.

The stack transform supports diverging stacks: negative values are stacked below zero while positive values are stacked above zero. For stackY, the **y1** channel contains the value of lesser magnitude (closer to zero) while the **y2** channel contains the value of greater magnitude (farther from zero); the difference between the two corresponds to the input **y** channel value. For stackX, the same is true, except for **x1**, **x2**, and **x** respectively.

After all values have been stacked from zero, an optional **offset** can be applied to translate or scale the stacks. The following **offset** methods are supported:

- null (default) - a zero baseline
- *normalize* - rescale each stack to fill [0, 1]
- *center* - align the centers of all stacks
- *wiggle* - translate stacks to minimize apparent movement
- a function to be passed a nested index, and start, end, and *z* values

If a given stack has zero total value, the *normalize* offset will not adjust the stack’s position. Both the *center* and *wiggle* offsets ensure that the lowest element across stacks starts at zero for better default axes. The *wiggle* offset is recommended for streamgraphs, and if used, changes the default order to *inside-out*; see [Byron & Wattenberg](http://leebyron.com/streamgraph/).

If the offset is specified as a function, it will receive four arguments: an index of stacks nested by facet and then stack, an array of start values, an array of end values, and an array of *z* values. For stackX, the start and end values correspond to **x1** and **x2**, while for stackY, the start and end values correspond to **y1** and **y2**. The offset function is then responsible for mutating the arrays of start and end values, such as by subtracting a common offset for each of the indices that pertain to the same stack.

In addition to the **y1** and **y2** output channels, stackY computes a **y** output channel that represents the midpoint of **y1** and **y2**; stackX does the same for **x**. This can be used to position a label or a dot in the center of a stacked layer. The **x** and **y** output channels are lazy: they are only computed if needed by a downstream mark or transform.

If two arguments are passed to the stack transform functions below, the stack-specific options (**offset**, **order**, and **reverse**) are pulled exclusively from the first *options* argument, while any channels (*e.g.*, **x**, **y**, and **z**) are pulled from second *options* argument. Options from the second argument that are not consumed by the stack transform will be passed through. Using two arguments is sometimes necessary is disambiguate the option recipient when chaining transforms.

## stackY(*stack*, *options*)

```js
Plot.stackY({x: "year", y: "revenue", z: "format", fill: "group"})
```

Creates new channels **y1** and **y2**, obtained by stacking the original **y** channel for data points that share a common **x** (and possibly **z**) value. A new **y** channel is also returned, which lazily computes the middle value of **y1** and **y2**. The input **y** channel defaults to a constant 1, resulting in a count of the data points. The stack options (**offset**, **order**, and **reverse**) may be specified as part of the *options* object, if the only argument, or as a separate *stack* options argument.

## stackY1(*stack*, *options*)

```js
Plot.stackY1({x: "year", y: "revenue", z: "format", fill: "group"})
```

Like [stackY](#stacky-stack-options), except that the **y1** channel is returned as the **y** channel. This can be used, for example, to draw a line at the bottom of each stacked area.

## stackY2(*stack*, *options*)

```js
Plot.stackY2({x: "year", y: "revenue", z: "format", fill: "group"})
```

Like [stackY](#stacky-stack-options), except that the **y2** channel is returned as the **y** channel. This can be used, for example, to draw a line at the top of each stacked area.

## stackX(*stack*, *options*)

```js
Plot.stackX({y: "year", x: "revenue", z: "format", fill: "group"})
```

Like [stackY](#stacky-stack-options), but with *x* as the input value channel, *y* as the stack index, *x1*, *x2* and *x* as the output channels.

## stackX1(*stack*, *options*)

```js
Plot.stackX1({y: "year", x: "revenue", z: "format", fill: "group"})
```

Like [stackX](#stackx-stack-options), except that the **x1** channel is returned as the **x** channel. This can be used, for example, to draw a line at the left edge of each stacked area.

## stackX2(*stack*, *options*)

```js
Plot.stackX2({y: "year", x: "revenue", z: "format", fill: "group"})
```

Like [stackX](#stackx-stack-options), except that the **x2** channel is returned as the **x** channel. This can be used, for example, to draw a line at the right edge of each stacked area.
