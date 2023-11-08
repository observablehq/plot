<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {ref, shallowRef, onMounted} from "vue";

const shift = ref(365);
const aapl = shallowRef([]);

onMounted(() => {
  d3.csv("../data/aapl.csv", d3.autoType).then((data) => (aapl.value = data));
});

</script>

# Shift transform <VersionBadge pr="1896" />

The **shift transform** is a specialized [map transform](./map.md) that derives an output **x1** channel by shifting the **x** channel; it can be used with the [difference mark](../marks/difference.md) to show change over time. For example, the chart below shows the price of Apple stock. The <span style="border-bottom: solid #01ab63 3px;">green region</span> shows when the price went up over the given interval, while the <span style="border-bottom: solid #4269d0 3px;">blue region</span> shows when the price went down.

<p>
  <label class="label-input" style="display: flex;">
    <span style="display: inline-block; width: 7em;">Shift (days):</span>
    <input type="range" v-model.number="shift" min="0" max="1000" step="1">
    <span style="font-variant-numeric: tabular-nums;">{{shift}}</span>
  </label>
</p>

:::plot hidden
```js
Plot.differenceY(aapl, Plot.shiftX(`${shift} days`, {x: "Date", y: "Close"})).plot({y: {grid: true}})
```
:::

```js-vue
Plot.differenceY(aapl, Plot.shiftX("{{shift}} days", {x: "Date", y: "Close"})).plot({y: {grid: true}})
```

When looking at year-over-year growth, the chart is mostly green, implying that you would make a profit by holding Apple stock for a year. However, if you bought in 2015 and sold in 2016, you would likely have lost money. Try adjusting the slider to a shorter or longer interval: how does that affect the typical return?

## shiftX(*interval*, *options*) {#shiftX}

```js
Plot.shiftX("7 days", {x: "Date", y: "Close"})
```

Derives an **x1** channel from the input **x** channel by shifting values by the given *interval*. The *interval* may be specified as: a name (*second*, *minute*, *hour*, *day*, *week*, *month*, *quarter*, *half*, *year*, *monday*, *tuesday*, *wednesday*, *thursday*, *friday*, *saturday*, *sunday*) with an optional number and sign (*e.g.*, *+3 days* or *-1 year*); or as a number; or as an implementation — such as d3.utcMonth — with *interval*.floor(*value*), *interval*.offset(*value*), and *interval*.range(*start*, *stop*) methods.

The shiftX also transform aliases the **x** channel to **x2** and applies a domain hint to the **x2** channel such that by default the plot shows only the intersection of **x1** and **x2**. For example, if the interval is *+1 year*, the first year of the data is not shown.
