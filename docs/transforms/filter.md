<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import alphabet from "../data/alphabet.ts";
import metros from "../data/metros.ts";

</script>

# Filter transform

The **filter** transform filters data according to the specified accessor or values.

For example, to take the toy bar chart of English letter frequency and only draw bars for letters that commonly form vowels:

:::plot
```js{4}
Plot.plot({
  marks: [
    Plot.barY(alphabet, {
      filter: (d) => /[aeiou]/i.test(d.letter),
      x: "letter",
      y: "frequency"
    })
  ]
})
```
:::

The **filter** transform is similar to filtering the data with [*array*.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), except that it will preserve [faceting](../features/facets.md) and will not affect inferred [scale domains](../features/scales.md); domains are inferred from the unfiltered channel values.

:::plot
```js{4}
Plot.plot({
  marks: [
    Plot.barY(
      alphabet.filter((d) => /[aeiou]/i.test(d.letter)),
      {x: "letter", y: "frequency"}
    )
  ]
})
```
:::

Here’s another example using a filter transform to control which text labels are displayed in a dense scatterplot.

:::plot
```js{10}
Plot.plot({
  grid: true,
  x: {type: "log"},
  marks: [
    Plot.dot(metros, {
      x: "POP_2015",
      y: "R90_10_2015"
    }),
    Plot.text(metros, {
      filter: "highlight",
      x: "POP_2015",
      y: "R90_10_2015",
      text: "nyt_display",
      frameAnchor: "bottom",
      dy: -6
    })
  ]
})
```
:::

## filter(*test*, *options*)

```js
Plot.filter(d => d.body_mass_g > 3000, options) // show data whose body mass is greater than 3kg
```

Filters the data given the specified *test*. The test can be given as an accessor function (which receives the datum and index), or as a channel value definition such as a field name; truthy values are retained.
