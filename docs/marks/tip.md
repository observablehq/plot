<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import {computed, shallowRef, onMounted} from "vue";

const aapl = shallowRef([]);
const us = shallowRef(null);
const states = computed(() => us.value ? topojson.feature(us.value, us.value.objects.states).features : []);

const olympians = shallowRef([
  {weight: 31, height: 1.21, sex: "female"},
  {weight: 170, height: 2.21, sex: "male"}
]);

onMounted(() => {
  d3.csv("../data/aapl.csv", d3.autoType).then((data) => (aapl.value = data));
  d3.csv("../data/athletes.csv", d3.autoType).then((data) => (olympians.value = data));
  d3.json("../data/us-counties-10m.json").then((data) => (us.value = data)); // TODO us-states?
});

</script>

# Tip mark <VersionBadge version="0.6.7" />

The **tip mark** displays text, or several name-value pairs, in a floating box anchored to a given position in **x** and **y**. The tip mark is often paired with the [pointer transform](../interactions/pointer.md) to reveal details on demand when hovering over a chart, as in this line chart of Apple stock price:

:::plot defer https://observablehq.com/@observablehq/plot-line-chart-interactive-tip
```js
Plot.lineY(aapl, {x: "Date", y: "Close", tip: true}).plot({y: {grid: true}})
```
:::

The above code uses the **tip** [mark option](../features/marks.md#mark-options); the code can be written more explicitly with a tip mark and a pointer transform.

```js
Plot.plot({
  y: {grid: true},
  marks: [
    Plot.lineY(aapl, {x: "Date", y: "Close"}),
    Plot.tip(aapl, Plot.pointerX({x: "Date", y: "Close"}))
  ]
})
```

The tip mark can also be used for static annotations, say to draw attention to elements of interest or to add context. The tip text is supplied via the **title** channel. If the tip mark‘s data is an array of strings, the **title** channel defaults to [identity](../features/transforms.md#identity).

:::plot defer https://observablehq.com/@observablehq/plot-static-annotations
```js
Plot.plot({
  y: {grid: true},
  marks: [
    Plot.lineY(aapl, {x: "Date", y: "Close"}),
    Plot.tip(
      [`Apple stock reaches a new high of $133 on Feb. 23, 2015. The release of the first Apple Watch, slated for April, is hotly anticipated.`],
      {x: new Date("2015-02-23"), y: 133, dy: -3, anchor: "bottom"}
    ),
    Plot.tip(
      [`Apple stock drops 8% after the company misses Q2 revenue targets and reports declining iPhone sales. It reaches a two-year low of $90.34 on May 12.`],
      {x: new Date("2016-05-12"), y: 90.34, dy: 3, anchor: "top"}
    )
  ]
})
```
:::

When using the **title** channel, the tip mark wraps text to 20 ems by default, and preserves newlines in the provided text. Use the **lineWidth** option to adjust the width, along with other text options such as **lineHeight**, **textOverflow**, **fontFamily**, and **fontSize**; see the [text mark](../marks/text.md) for more details.

The **title** channel can be used with interactive tips, too. If you have a few moments, hover the chart below to read about various athletes who competed at Rio 2016.

:::plot defer https://observablehq.com/@observablehq/plot-tips-longer-text
```js
Plot.plot({
  grid: true,
  marks: [
    Plot.dot(olympians, {
      x: "weight",
      y: "height",
      fy: "sex",
      sort: (d) => !!d.info,
      stroke: (d) => d.info ? "currentColor" : "#aaa"
    }),
    Plot.tip(olympians, Plot.pointer({
      x: "weight",
      y: "height",
      fy: "sex",
      filter: (d) => d.info,
      title: (d) => [d.name, d.info].join("\n\n")
    }))
  ]
})
```
:::

If no **title** channel is supplied, the tip mark displays all channel values. You can supply additional name-value pairs by registering extra channels using the **channels** mark option. In the scatterplot of Olympic athletes below, you can hover to see the *name* and *sport* of each athlete. This is helpful for noticing patterns — tall basketball players, giant weightlifters and judoka, diminutive gymnasts — and for seeing individuals.

:::plot defer https://observablehq.com/@observablehq/plot-tips-additional-channels
```js
Plot.dot(olympians, {
  x: "weight",
  y: "height",
  stroke: "sex",
  channels: {name: "name", sport: "sport"},
  tip: true
}).plot()
```
:::

:::info
The tallest athlete in this dataset, swimmer [Kevin Cordes](https://en.wikipedia.org/wiki/Kevin_Cordes), is likely an error: his official height is 1.96m (6′ 5″) not 2.21m (7′ 3″). Basketball player [Li Muhao](https://en.wikipedia.org/wiki/Li_Muhao) is likely the true tallest.
:::

If a channel is bound to the *color* or *opacity* scale, the tip mark displays a swatch to reinforce the encoding, such as female <span :style="{color: d3.schemeTableau10[0]}">■</span> or male <span :style="{color: d3.schemeTableau10[1]}">■</span>.

The tip mark recognizes that **x1** & **x2** and **y1** & **y2** are paired channels. Below, observe that the *weight* shown in the tip is a range such as 64–66 kg; however, the *frequency* is shown as the difference between the **y1** and **y2** channels. The latter is achieved by the stack transform setting a channel hint to indicate that **y1** and **y2** represent a length.

:::plot defer https://observablehq.com/@observablehq/plot-tips-paired-channels
```js
Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight", fill: "sex", tip: true})).plot()
```
:::

This even works when stacking negative values, say to mirror the histogram instead of stacking it. (The tip displays negative frequency, but this is consistent with the *y* axis.)

:::plot defer https://observablehq.com/@observablehq/plot-tips-paired-channels
```js
Plot.rectY(olympians, Plot.binX({y: "sum"}, {x: "weight", y: (d) => d.sex === "male" ? 1 : -1, fill: "sex", tip: true})).plot({y: {label: "Frequency"}})
```
:::

The order and formatting of channels in the tip can be customized with the **format** option <VersionBadge version="0.6.11" pr="1823" />, which accepts a key-value object mapping channel names to formats. Each [format](../features/formats.md) can be a string (for number or time formats), a function that receives the value as input and returns a string, true to use the default format, and null or false to suppress. The order of channels in the tip follows their order in the format object followed by any additional channels.

A channel’s label can be specified alongside its value as a {value, label} object; if a channel label is not specified, the associated scale’s label is used, if any; if there is no associated scale, or if the scale has no label, the channel name is used instead.

:::plot defer
```js
Plot.dot(olympians, {
  x: "weight",
  y: "height",
  stroke: "sex",
  channels: {
    name: "name",
    nationality: {
      value: "nationality",
      label: "country"
    },
    sport: "sport"
  },
  tip: {
    format: {
      name: true,
      sport: true,
      nationality: true,
      y: (d) => `${d}m`,
      x: (d) => `${d}kg`,
      stroke: false
    }
  }
}).plot()
```
:::

The tip mark supports nine different orientations specified by the **anchor** option: the four sides (*top*, *right*, *bottom*, *left*), the four corners (*top-left*, *top-right*, *bottom-right*, *bottom-left*), and *middle*. Note that when *middle* is used, the tip will obscure its anchor point.

:::plot defer
```js
Plot.plot({
  height: 160,
  marks: [
    Plot.frame({strokeOpacity: 0.2}),
    [
      "top", "right", "bottom", "left", // sides
      "top-left", "top-right", "bottom-right", "bottom-left", // corners
      "middle"
    ].map((anchor) => [
      Plot.dot({length: 1}, {frameAnchor: anchor, fill: "blue"}),
      Plot.tip([anchor], {frameAnchor: anchor, anchor})
    ])
  ]
})
```
:::

If you don’t specify an **anchor**, the tip mark will choose one automatically. It will prefer *top-left* if the tip fits; otherwise it will switch sides to try to contain the tip within the plot’s frame. When dynamically rendering the tip mark, say with the [pointer interaction](../interactions/pointer.md), the tip will also attempt to use the anchor it chose previously, making the tip more stable as you move the pointer and improving readability. In some cases, it may not be possible to fit the tip within the plot’s frame; consider setting the plot’s **style** to `overflow: visible;` to prevent the tip from being truncated.

The tip mark is compatible with transforms that derive **x** and **y** dynamically from data, such as the [centroid transform](../transforms/centroid.md) which computes polygon centroids. Below, a map of the United States shows state names. We reduce the size of the tips by setting the **textPadding** option to 3 pixels instead of the default 8.

:::plot defer https://observablehq.com/@observablehq/plot-maps-tips
```js
Plot.plot({
  projection: "albers-usa",
  marks: [
    Plot.geo(states),
    Plot.tip(states, Plot.geoCentroid({title: (d) => d.properties.name, anchor: "bottom", textPadding: 3}))
  ]
})
```
:::

:::tip
When multiple tips are visible simultaneously, some may collide; consider using the pointer interaction to show only the one closest to the pointer, or use multiple tip marks and adjust the **anchor** option for each to minimize occlusion.
:::

## Tip options

The following position options are supported:

- **x**, **x1**, or **x2** - the horizontal↔︎ position channel
- **y**, **y1**, or **y2** - the vertical↕︎ position channel
- **frameAnchor** - fallback position if *x* or *y* are otherwise unspecified

To resolve the anchor position, the tip mark applies the following order of precedence:

1. the midpoint of **x1** and **x2**, if both are present;
2. otherwise **x**, if present;
3. otherwise **x1**, if present;
4. and lastly the position given by the **frameAnchor**.

The same precedence applies to the **y**, **y1**, and **y2** channels.

These tip-specific options control the tip appearance:

- **anchor** - *top*, *right*, *bottom*, *left*, *top-left*, *top-right*, *bottom-right*, *bottom-left*, or *middle*
- **pointerSize** - the size of the tip’s pointer in pixels; defaults to 12
- **pathFilter** - the image filter for the tip’s box; defaults to a drop shadow
- **textPadding** - the padding around the text in pixels; defaults to 8

The tip mark does not support the [standard style channels](../features/marks.md#mark-options) such as varying **fill** or **stroke**; channels are used exclusively to control the displayed values rather than the tip’s appearance. You can however use the these options for a constant **fill**, **fillOpacity**, **stroke**, **strokeOpacity**, or **strokeWidth** on the path element surrounding the tip text.

:::plot defer
```js
Plot.tip(["Danger! This tip is red."], {
  anchor: "bottom",
  frameAnchor: "bottom",
  fill: "red"
}).plot()
```
:::

These [standard text options](./text.md#text-options) control the display of text within the tip:

- **monospace** - if true, changes the default **fontFamily** and metrics to monospace
- **fontFamily** - the font name; defaults to [*system-ui*](https://drafts.csswg.org/css-fonts-4/#valdef-font-family-system-ui)
- **fontSize** - the font size in pixels; defaults to 10
- **fontStyle** - the [font style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style); defaults to *normal*
- **fontVariant** - the [font variant](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant); defaults to *normal*
- **fontWeight** - the [font weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight); defaults to *normal*
- **textAnchor** - the [text anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) for horizontal position; *start*, *end*, or *middle*
- **lineHeight** - the line height in ems; defaults to 1
- **lineWidth** - the line width in ems, for wrapping; defaults to Infinity
- **textOverflow** - how to wrap or clip lines longer than the specified line width

## tip(*data*, *options*) {#tip}

```js
Plot.tip(aapl, {x: "Date", y: "Close"})
```

Returns a new tip mark with the given *data* and *options*.
