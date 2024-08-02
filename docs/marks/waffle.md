<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import alphabet from "../data/alphabet.ts";

const olympians = shallowRef([
  {weight: 31, height: 1.21, sex: "female"},
  {weight: 170, height: 2.21, sex: "male"}
]);

onMounted(() => {
  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
});

</script>

# Waffle mark <VersionBadge pr="2040" />

The **waffle mark** is similar to the [bar mark](./bar.md), but subdivides values into discrete square cells that are more easily counted.

:::plot
```js
Plot.waffleY([1, 2, 32, 400, 5]).plot()
```
:::

The waffle mark is often used in conjunction with the group transform.

:::plot
```js
Plot.waffleY(olympians, Plot.groupX({y: "count"}, {x: (d) => Math.floor(d.date_of_birth?.getUTCFullYear() / 10) * 10, unit: 10})).plot({round: true, x: {tickFormat: ""}})
```
:::

The waffle mark comes in two orientations: waffleY extends vertically↑, while waffleX extends horizontally→.

Waffles typically used to represent countable integer values, such as people or days, though they can also encode fractional values with a partial first or last cell.

:::plot
```js
Plot.waffleY([1.5, 2, 32, 400, 5]).plot()
```
:::

Waffles can be stacked.

## Waffle options

For required channels, see the [bar mark](./bar.md). The waffle mark supports the [standard mark options](../features/marks.md). It does not support [insets](../features/marks.md#insets), [rounded corners](../features/marks.md#rounded-corners), or **stroke**. The **fill** defaults to *currentColor*.

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
