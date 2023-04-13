<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import bls from "../data/bls.ts";

</script>

# Sort transform

* **sort** - sorts data according to the specified comparator, accessor, or values
* **reverse** - reverses the sorted (or if not sorted, the input) data order

Together the **sort** and **reverse** transforms allow control over *z*-order, which can be important when addressing overplotting. If the sort option is a function but does not take exactly one argument, it is assumed to be a [comparator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description); otherwise, the sort option is interpreted as a channel value definition and thus may be either a column name, accessor function, or array of values.

:::plot
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

## sort(*order*, *options*)

```js
Plot.sort("body_mass_g", options) // show data in ascending body mass order
```

Sorts the data by the specified *order*, which can be an accessor function, a comparator function, or a channel value definition such as a field name. See also [index sorting](../features/scales.md#sort-options), which allows marks to be sorted by a named channel, such as *r* for radius.

## shuffle(*options*)

```js
Plot.shuffle(options) // show data in random order
```

Shuffles the data randomly. If a *seed* option is specified, a linear congruential generator with the given seed is used to generate random numbers deterministically; otherwise, Math.random is used.

## reverse(*options*)

```js
Plot.reverse(options) // reverse the input order
```

Reverses the order of the data.
