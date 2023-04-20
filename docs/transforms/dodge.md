<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref, shallowRef, onMounted} from "vue";
import cars from "../data/cars.ts";

const anchor = ref("middle");
const r = ref(3);
const padding = ref(2);
const ipos = shallowRef([]);

onMounted(() => {
  d3.csv("../data/ipos.csv", d3.autoType).then((data) => (ipos.value = data));
});

</script>

# Dodge transform

Given one position dimension (either **x** or **y**), the **dodge** transform computes the other position dimension such that dots are packed densely without overlapping. The [dodgeX transform](#dodgex-dodgeoptions-options) computes **x** (horizontal position) given **y** (vertical position), while the [dodgeY transform](#dodgey-dodgeoptions-options) computes **y** given **x**.

The dodge transform is commonly used to produce beeswarm 🐝 plots, a way of showing a one-dimensional distribution that preserves the visual identity of individual data points. For example, the dots below represent the weights of cars; the rough shape of the pile gives a sense of the overall distribution (peaking around 2,100 pounds), and you can hover an individual dot to see which car it represents.

:::plot
```js
Plot.plot({
  height: 160,
  marks: [
    Plot.dotX(cars, Plot.dodgeY({x: "weight (lb)", title: "name", fill: "currentColor"}))
  ]
})
```
:::

Compare this to a conventional histogram using a [rect mark](../marks/rect.md).

:::plot
```js
Plot.plot({
  height: 180,
  marks: [
    Plot.rectY(cars, Plot.binX({y: "count"}, {x: "weight (lb)"})),
    Plot.ruleY([0])
  ]
})
```
:::

Beeswarm plots avoid the occlusion problem of dense scatterplots and barcode plots.

:::plot
```js
Plot.dotX(cars, {x: "weight (lb)"}).plot()
```
:::

:::plot
```js
Plot.ruleX(cars, {x: "weight (lb)"}).plot()
```
:::

The **anchor** option specifies the layout baseline: the optimal output position. For the dodgeX transform, the supported anchors are: _left_ (default), _middle_, _right_. For the dodgeY transform, the supported anchors are: _bottom_ (default), _middle_, _top_. When the _middle_ anchor is used, the dots are placed symmetrically around the baseline.

<p>
  <label class="label-input">
    Anchor:
    <select v-model="anchor">
      <option>top</option>
      <option>middle</option>
      <option>bottom</option>
    </select>
  </label>
</p>

:::plot
```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dot(cars, Plot.dodgeY({x: "weight (lb)", fill: "currentColor", anchor}))
  ]
})
```
:::

When using dodgeY, you must typically specify the plot’s **height** to create suitable space for the layout. The dodge transform is not currently able to set the height automatically. For dodgeX, the default **width** of 640 is often sufficient, though you may need to adjust it as well depending on your data.

The dodge transform differs from the [stack transform](./stack.md) in that the dots do not need the exact same input position to avoid overlap; the dodge transform respects the radius **r** of each dot. Try adjusting the radius below to see the effect.

<p>
  <label class="label-input">
    Radius (r):
    <input type="range" v-model.number="r" min="0.5" max="10" step="0.1">
    <span style="font-variant-numeric: tabular-nums;">{{r.toLocaleString("en-US", {minimumFractionDigits: 1})}}</span>
  </label>
</p>

:::plot
```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dot(cars, Plot.dodgeY({x: "weight (lb)", r, fill: "currentColor"}))
  ]
})
```
:::

The dodge transform also supports a **padding** option (default 1), which specifies the minimum separating distance between dots. Increase it for more breathing room.

<p>
  <label class="label-input">
    Padding:
    <input type="range" v-model.number="padding" min="-1" max="5" step="0.1">
    <span style="font-variant-numeric: tabular-nums;">{{padding.toLocaleString("en-US", {minimumFractionDigits: 1})}}</span>
  </label>
</p>

:::plot
```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dot(cars, Plot.dodgeY({x: "weight (lb)", padding, fill: "currentColor"}))
  ]
})
```
:::

If **r** is a channel, the dodge transform will position circles of varying radius. The chart below shows twenty years of IPO offerings leading up to Facebook’s $104B offering in 2012; each circle is sized proportionally to the associated company’s valuation at IPO. (This data comes from [“The Facebook Offering: How It Compares”](https://archive.nytimes.com/www.nytimes.com/interactive/2012/05/17/business/dealbook/how-the-facebook-offering-compares.html?hp) by Jeremy Ashkenas, Matthew Bloch, Shan Carter, and Amanda Cox.) Facebook’s valuation was nearly four times that of Google, the previous record. The 2000 [dot-com bubble](https://en.wikipedia.org/wiki/Dot-com_bubble) is also visible.

:::plot defer
```js
Plot.plot({
  insetRight: 10,
  height: 790,
  marks: [
    Plot.dot(
      ipos,
      Plot.dodgeY({
        x: "date",
        r: "rMVOP",
        title: (d) => `${d.NAME}\n${(d.rMVOP / 1e3).toFixed(1)}B`,
        fill: "currentColor"
      })
    ),
    Plot.text(
      ipos,
      Plot.dodgeY({
        filter: (d) => d.rMVOP > 5e3,
        x: "date",
        r: "rMVOP",
        text: (d) => (d.rMVOP / 1e3).toFixed(),
        fill: "var(--vp-c-bg)",
        pointerEvents: "none"
      })
    )
  ]
})
```
:::

The dodge transform can be use with any mark that supports **x** and **y** position. Below, we use the [text mark](../marks/text.md) instead to show company valuations (in billions).

:::plot defer
```js
Plot.plot({
  insetRight: 10,
  height: 790,
  marks: [
    Plot.text(
      ipos,
      Plot.dodgeY({
        x: "date",
        r: "rMVOP",
        text: (d) => (d.rMVOP / 1e3).toFixed(1),
        title: "NAME",
        fontSize: (d) => Math.min(22, Math.cbrt(d.rMVOP / 1e3) * 6)
      })
    )
  ]
})
```
:::

The dodge transform places dots sequentially, each time finding the closest position to the baseline that avoids intersection with previously-placed dots. Because this is a [greedy algorithm](https://en.wikipedia.org/wiki/Greedy_algorithm), the resulting layout depends on the input order. When **r** is a channel, dots are sorted by descending radius by default such that the largest dots are placed closest to the baseline. Otherwise, dots are placed in input order by default.

To adjust the dodge layout, use the [sort transform](./sort.md). For example, if the **sort** option uses the same column as **x**, the dots are arranged in piles leaning right.

:::plot
```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dotX(cars, Plot.dodgeY({x: "weight (lb)", title: "name", fill: "currentColor", sort: "weight (lb)"}))
  ]
})
```
:::

Reversing the sort order produces piles leaning left.

:::plot
```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dotX(cars, Plot.dodgeY({x: "weight (lb)", title: "name", fill: "currentColor", sort: "weight (lb)", reverse: true}))
  ]
})
```
:::

:::tip
To avoid repeating a channel definition, you can also specify the **sort** option as `{channel: "x"}`.
:::

:::info
Unlike a [force-directed beeswarm](https://observablehq.com/@harrystevens/force-directed-beeswarm), the dodge transform exactly preserves the input position dimension, resulting in a more accurate visualization. Also, the dodge transform tends to be faster than the iterative constraint relaxation used in the force-directed approach. We use Mikola Lysenko’s [interval-tree-1d library](https://github.com/mikolalysenko/interval-tree-1d) for fast intersection testing. For previous work on accurate beeswarms, see Yuri Vishnevsky’s [“Building a Better Beeswarm”](https://observablehq.com/@yurivish/building-a-better-beeswarm), James Trimble’s [accurate-beeswarm-plot](https://github.com/jtrim-ons/accurate-beeswarm-plot), and Franck Lebeau’s [d3-beeswarm](https://github.com/Kcnarf/d3-beeswarm).
:::

## Dodge options

The dodge transforms accept the following options:

* **padding** — a number of pixels added to the radius of the mark to estimate its size
* **anchor** - the dodge anchor; defaults to *left* for dodgeX, or *bottom* for dodgeY

The **anchor** option may one of *middle*, *right*, and *left* for dodgeX, and one of *middle*, *top*, and *bottom* for dodgeY. With the *middle* anchor the piles will grow from the center in both directions; with the other anchors, the piles will grow from the specified anchor towards the opposite direction.

## dodgeY(*dodgeOptions*, *options*)

```js
Plot.dodgeY({x: "date"})
```

Given marks arranged along the *x* axis, the dodgeY transform piles them vertically by defining a *y* position channel that avoids overlapping. The *x* position channel is unchanged.

## dodgeX(*dodgeOptions*, *options*)

```js
Plot.dodgeX({y: "value"})
```

Equivalent to Plot.dodgeY, but piling horizontally, creating a new *x* position channel that avoids overlapping. The *y* position channel is unchanged.
