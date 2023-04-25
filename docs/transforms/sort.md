<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, ref, shallowRef, onMounted} from "vue";
import cars from "../data/cars.ts";

const sorted = ref(true);
const order = ref("ascending");
const bls = shallowRef([]);
const us = shallowRef(null);
const statemesh = computed(() => us.value ? topojson.mesh(us.value, us.value.objects.states) : {type: null});
const counties = computed(() => us.value ? topojson.feature(us.value, us.value.objects.counties).features : []);

onMounted(() => {
  d3.csv("../data/bls-metro-unemployment.csv", d3.autoType).then((data) => (bls.value = data));
  Promise.all([
    d3.json("../data/us-counties-10m.json"),
    d3.csv("../data/us-county-population.csv")
  ]).then(([_us, _population]) => {
    const map = new Map(_population.map((d) => [d.state + d.county, +d.population]));
    _us.objects.counties.geometries.forEach((g) => (g.properties.population = map.get(g.id)));
    us.value = _us;
  });
});

</script>

# Sort transform

The **sort transform** sorts a mark’s index to change the effective order of data. The sort transform affects the order in which a mark’s graphical elements are drawn ([z-order](https://en.wikipedia.org/wiki/Z-order)), which can have a dramatic effect when these elements overlap. For example, see the bubble map of U.S. county population below; when the null sort order is used for input order, many small dots are hidden underneath larger ones.

<p>
  <label class="label-input">
    Sort by descending radius (r):
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
      sort: sorted ? {channel: "r", order: "descending"} : null
    }))
  ]
})
```
:::

:::tip
Dots are sorted by descending **r** by default, so you may not need the **sort** option.
:::

The sort transform can be applied either via the **sort** [mark option](../features/marks.md#mark-options), as above, or as an explicit [sort transform](#sort-order-options). The latter is generally only needed when composing multiple transforms, or to disambiguate the sort transform from imputed ordinal scale domains, *i.e.*, [scale sorting](../features/marks.md#sort-option).

As another example, in the line chart of unemployment rates below, lines for metropolitan areas in Michigan (which saw exceptionally high unemployment following the [financial crisis of 2008](https://en.wikipedia.org/wiki/2007–2008_financial_crisis), in part due to the [auto industry collapse](https://en.wikipedia.org/wiki/2008–2010_automotive_industry_crisis)) are highlighted in <span style="border-bottom: solid 2px var(--vp-c-red);">red</span>, and the **sort** option is used to draw them on top of other series.

:::plot https://observablehq.com/@observablehq/plot-multiple-line-highlight
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Unemployment (%)"
  },
  color: {
    domain: [false, true],
    range: ["#ccc", "red"]
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(bls, {
      x: "date",
      y: "unemployment",
      z: "division",
      sort: (d) => /, MI /.test(d.division),
      stroke: (d) => /, MI /.test(d.division)
    })
  ]
})
```
:::

:::tip
You could say `sort: {channel: "stroke"}` here to avoid repeating the test function.
:::

The index order also affects the behavior of certain transforms such as [stack](./stack.md) and [dodge](./dodge.md).

<p>
  <span class="label-input">
    Sort x order:
    <label style="margin-left: 0.5em;"><input type="radio" name="order" value="ascending" v-model="order" /> ascending</label>
    <label style="margin-left: 0.5em;"><input type="radio" name="order" value="descending" v-model="order" /> descending</label>
  </span>
</p>

:::plot https://observablehq.com/@observablehq/plot-dodge-cars-2
```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dotX(cars, Plot.dodgeY({
      x: "weight (lb)",
      title: "name",
      fill: "currentColor",
      sort: {channel: "x", order}
    }))
  ]
})
```
:::

The closely-related [reverse transform](#reverse-options) likewise reverses the mark index, while the [shuffle transform](#shuffle-options) for randomizes the mark index’s order.

## sort(*order*, *options*)

```js
Plot.sort("body_mass_g", {x: "culmen_length_mm", y: "culmen_depth_mm"})
```

Sorts the data by the specified *order*, which is one of:

- a comparator function, as with [*array*.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- an accessor function
- a field name
- a {*channel*, *order*} object

In the object case, the **channel** option specifies the name of the channel, while the **order** option specifies *ascending* (the default) or *descending* order. For example, `sort: {channel: "r", order: "descending"}` will sort by descending radius (**r**).

In the function case, if the sort function does not take exactly one argument, it is interpreted as a comparator function; otherwise it is interpreted as an accessor function.

## shuffle(*options*)

```js
Plot.shuffle({x: "culmen_length_mm", y: "culmen_depth_mm"})
```

Shuffles the data randomly. If a **seed** option is specified, a [linear congruential generator](https://github.com/d3/d3-random/blob/main/README.md#randomLcg) with the given seed is used to generate random numbers; otherwise, Math.random is used.

## reverse(*options*)

```js
Plot.reverse({x: "culmen_length_mm", y: "culmen_depth_mm"})
```

Reverses the order of the data.
