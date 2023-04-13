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

## Plot.sort(*compare*, *options*)

…

## Plot.shuffle(*options*)

…

## Plot.reverse(*options*)

…
