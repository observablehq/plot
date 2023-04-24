<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {computed, ref, shallowRef, onMounted} from "vue";
import alphabet from "../data/alphabet.ts";
import metros from "../data/metros.ts";

const filtered = ref(true);

</script>

# Filter transform

The **filter transform** filters a mark’s index to show a subset of the data. For example, below the **filter** option controls which text labels are displayed in a dense scatterplot.

<p>
  <label class="label-input">
    Use filter:
    <input type="checkbox" v-model="filtered">
  </label>
</p>

:::plot https://observablehq.com/@observablehq/plot-filter-demo
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
      filter: filtered ? "highlight" : null,
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

:::tip
As an alternative to the filter transform here, you could set the **text** channel value to null using a function: `text: (d) => d.highlight ? d.nyt_display : null`.
:::

The filter transform can be applied either via the **filter** [mark option](../features/marks.md#mark-options), as above, or as an explicit [filter transform](#filter-test-options). The latter is generally only needed when composing multiple transforms.

To highlight the vowels in a bar chart of English letter frequency, you can use a filtered bar with a <span style="border-bottom: solid 2px var(--vp-c-red);">red</span> stroke. A filtered mark allows you to set options on a subset of the data, even if those options—such as mark insets—are not expressible as a channels.

:::plot https://observablehq.com/@observablehq/plot-filtered-bars
```js{8}
Plot.plot({
  marks: [
    Plot.barY(alphabet, {
      x: "letter",
      y: "frequency"
    }),
    Plot.barY(alphabet, {
      filter: (d) => /[aeiouy]/i.test(d.letter),
      x: "letter",
      y: "frequency",
      stroke: "red",
      strokeWidth: 3,
      inset: -3 // expand the bars
    })
  ]
})
```
:::

Since the filter transform only affects the mark’s index and not the channel values, it does not affect the default scale domains. Below, the *x* scale contains every English letter, even though the only the bars for the vowels are shown.

:::plot https://observablehq.com/@observablehq/plot-filtered-bars
```js
Plot.plot({
  marks: [
    Plot.barY(alphabet, {
      filter: (d) => /[aeiouy]/i.test(d.letter),
      x: "letter",
      y: "frequency"
    })
  ]
})
```
:::

If you want to drop values completely, you can filter the data with [*array*.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

:::plot https://observablehq.com/@observablehq/plot-filtered-bars
```js{4}
Plot.plot({
  marks: [
    Plot.barY(
      alphabet.filter((d) => /[aeiouy]/i.test(d.letter)),
      {x: "letter", y: "frequency"}
    )
  ]
})
```
:::

## filter(*test*, *options*)

```js
Plot.filter((d) => /[aeiouy]/i.test(d.letter), {x: "letter", y: "frequency"})
```

Filters the data given the specified *test*. The test can be given as an accessor function (which receives the datum and index), or as a channel value definition such as a field name; truthy values are retained.
