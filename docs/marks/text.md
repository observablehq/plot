<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {shallowRef, onMounted} from "vue";
import alphabet from "../data/alphabet.ts";
import caltrain from "../data/caltrain.ts";
import driving from "../data/driving.ts";

const travelers = shallowRef([]);

onMounted(() => {
  d3.csv("../data/travelers.csv", d3.autoType).then((data) => (travelers.value = data));
});

</script>

# Text mark

The **text mark** draws text at the given position in **x** and **y**. It is often used to label other marks, such as to show the value of a [bar](./bar.md). When space is available, direct labeling can allow faster and more accurate reading of values than an axis alone (or a tooltip).

:::plot https://observablehq.com/@observablehq/plot-labeled-bars
```js
Plot.plot({
  label: null,
  y: {
    grid: true,
    label: "↑ Frequency (%)",
    percent: true
  },
  marks: [
    Plot.barY(alphabet, {x: "letter", y: "frequency"}),
    Plot.text(alphabet, {x: "letter", y: "frequency", text: (d) => (d.frequency * 100).toFixed(1), dy: -6, lineAnchor: "bottom"}),
    Plot.ruleY([0])
  ]
})
```
:::

:::tip
For formatting numbers and dates, consider [*number*.toLocaleString](https://observablehq.com/@mbostock/number-formatting), [*date*.toLocaleString](https://observablehq.com/@mbostock/date-formatting), [d3-format](https://github.com/d3/d3-format), or [d3-time-format](https://github.com/d3/d3-time-format).
:::

If there are too many data points, labels may overlap, making them hard to read. Use the [filter transform](../transforms/filter.md) to choose which points to label. In the connected scatterplot below, recreating Hannah Fairfield’s [“Driving Shifts Into Reverse”](http://www.nytimes.com/imagepages/2010/05/02/business/02metrics.html) from 2009, every fifth year is labeled.

:::plot https://observablehq.com/@observablehq/plot-connected-scatterplot
```js
Plot.plot({
  inset: 10,
  grid: true,
  x: {label: "Miles driven (per person-year) →"},
  y: {label: "↑ Cost of gasoline ($ per gallon)"},
  marks: [
    Plot.line(driving, {x: "miles", y: "gas", curve: "catmull-rom", marker: true}),
    Plot.text(driving, {filter: (d) => d.year % 5 === 0, x: "miles", y: "gas", text: (d) => `${d.year}`, dy: -6, lineAnchor: "bottom"})
  ]
})
```
:::

:::tip
If you’d like automatic labeling, please upvote [#27](https://github.com/observablehq/plot/issues/27).
:::

For line charts with multiple series, you may wish to label only the start or end of each series; this can be done using the [select transform](../transforms/select.md), as shown in the chart below comparing the number of daily travelers at airports in the U.S. between 2019 and 2020. The impact of the COVID-19 pandemic is dramatic.

:::plot defer https://observablehq.com/@observablehq/plot-labeled-line-chart
```js
Plot.plot({
  y: {
    grid: true,
    label: "↑ Travelers per day (millions)",
    transform: (d) => d / 1e6 // convert to millions
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(travelers, {x: "date", y: "previous", strokeOpacity: 0.5}),
    Plot.line(travelers, {x: "date", y: "current"}),
    Plot.text(travelers, Plot.selectFirst({x: "date", y: "previous", text: ["2019"], fillOpacity: 0.5, lineAnchor: "bottom", dy: -6})),
    Plot.text(travelers, Plot.selectFirst({x: "date", y: "current", text: ["2020"], lineAnchor: "top", dy: 6}))
  ]
})
```
:::

:::warning CAUTION
The select transform uses input order, not natural order by value, to determine the meaning of *first* and *last*. Since this dataset is in reverse chronological order, the first element is the most recent.
:::

A text mark can also be used to visualize data directly, similar to a [dot mark](./dot.md) in a scatterplot. Below a “stem and leaf” plot of Caltrain’s Palo Alto station schedule uses [stacked](../transforms/stack.md) text. The **fill** channel provides a color encoding to distinguish trains that make every stop (<span style="border-bottom: solid currentColor 3px;">N</span>), limited trains that make fewer stops (<span style="border-bottom: solid peru 3px;">L</span>), and “baby bullet” trains that make the fewest stops (<span style="border-bottom: solid brown 3px;">B</span>).

:::plot https://observablehq.com/@observablehq/plot-caltrain-schedule
```js
Plot.plot({
  width: 240,
  axis: null,
  x: {type: "point"},
  y: {type: "point", domain: d3.range(4, 25)},
  color: {domain: "NLB", range: ["currentColor", "peru", "brown"], legend: true},
  marks: [
    Plot.text([[0.5, 4]], {text: ["Northbound"], textAnchor: "start", dx: 16}),
    Plot.text([[-0.5, 4]], {text: ["Southbound"], textAnchor: "end", dx: -16}),
    Plot.text(d3.range(5, 25), {x: 0, y: Plot.identity, text: (y) => `${y % 12 || 12}${y % 24 >= 12 ? "p": "a"}`}),
    Plot.text(caltrain, Plot.stackX2({x: (d) => d.orientation === "N" ? 1 : -1, y: "hours", fill: "type", text: "minutes"})),
    Plot.ruleX([-0.5, 0.5])
  ]
})
```
:::

:::info
Since the **textAnchor** option is a constant rather than a channel, separate text marks are used for the *Northbound* and *Southbound* labels.
:::

The **x** and **y** channels are optional; a one-dimensional text mark can be produced by specifying only one position dimension. If both **x** and **y** are not defined, the text mark assumes that the data is an iterable of points [[*x₁*, *y₁*], [*x₂*, *y₂*], …], allowing for [shorthand](../features/shorthand.md). Furthermore, the default **text** channel is the associated datum’s index. (This is rarely what you want, but at least it gets something on the screen.)

:::plot https://observablehq.com/@observablehq/plot-text-spiral
```js
Plot.plot({
  aspectRatio: 1,
  inset: 10,
  grid: true,
  marks: [
    Plot.text(d3.range(151).map((i) => [
      Math.sqrt(i) * Math.sin(i / 10),
      Math.sqrt(i) * Math.cos(i / 10)
    ]))
  ]
})
```
:::

The text mark will generate multiple lines if the **text** contains newline characters (`\n`). This may be useful for longer annotations.

:::plot https://observablehq.com/@observablehq/plot-this-is-just-to-say
```js
Plot.plot({
  height: 200,
  marks: [
    Plot.frame(),
    Plot.text([`This Is Just To Say
William Carlos Williams, 1934

I have eaten
the plums
that were in
the icebox

and which
you were probably
saving
for breakfast

Forgive me
they were delicious
so sweet
and so cold`], {frameAnchor: "middle"})
  ]
})
```
:::

Alternatively, the **lineWidth** option enables automatic line wrapping. This option must be specified as a number in [ems](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units). When a word contains a [soft-hyphen](https://en.wikipedia.org/wiki/Soft_hyphen) (`\xad`), it may be replaced by a hyphen when wrapping. The **textOverflow** option can also be used to truncate lines that exceed the specified line width, like in the incipit of Herman Melville’s *Moby-Dick* (1851).

:::plot https://observablehq.com/@observablehq/plot-moby-dick
```js
Plot.plot({
  height: 320,
  x: {type: "point", align: 0, axis: "top", tickSize: 0},
  marks: [
    Plot.text(
      [
        "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before cof\xadfin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.",
        "There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water-gazers there.",
        "Circumambulate the city of a dreamy Sabbath afternoon. Go from Corlears Hook to Coenties Slip, and from thence, by Whitehall, northward. What do you see?—Posted like silent sentinels all around the town, stand thousands upon thousands of mortal men fixed in ocean reveries. Some leaning against the spiles; some seated upon the pier-heads; some looking over the bulwarks of ships from China; some high aloft in the rigging, as if striving to get a still better seaward peep. But these are all landsmen; of week days pent up in lath and plaster—tied to counters, nailed to benches, clinched to desks. How then is this? Are the green fields gone? What do they here?"
      ],
      {
        x: (d, i) => 1 + i, // paragraph number
        lineWidth: 20,
        frameAnchor: "top",
        textAnchor: "start"
      }
    )
  ]
})
```
:::

:::warning CAUTION
For performance and simplicity, Plot does not measure text exactly and instead uses an approximate heuristic. If Plot’s automatic wrapping is not doing what you want, consider hard wrapping with manual newlines (`\n`) instead. There is also a **monospace** option suitable for fixed-width fonts.
:::

## Text options

The following channels are required:

* **text** - the text contents (a string, possibly with multiple lines)

If the **text** contains `\n`, `\r\n`, or `\r`, it will be rendered as multiple lines. If the **text** is specified as numbers or dates, a default formatter will automatically be applied, and the **fontVariant** will default to *tabular-nums* instead of *normal*. If **text** is not specified, it defaults to [identity](../features/transforms.md#identity) for primitive data (such as numbers, dates, and strings), and to the zero-based index [0, 1, 2, …] for objects (so that something identifying is visible by default).

In addition to the [standard mark options](../features/marks.md#mark-options), the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale
* **y** - the vertical position; bound to the *y* scale
* **fontSize** - the font size in pixels
* **rotate** - the rotation angle in degrees clockwise

If either of the **x** or **y** channels are not specified, the corresponding position is controlled by the **frameAnchor** option.

The following text-specific constant options are also supported:

* **textAnchor** - the [text anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) for horizontal position; *start*, *end*, or *middle*
* **lineAnchor** - the line anchor for vertical position; *top*, *bottom*, or *middle*
* **lineHeight** - the line height in ems; defaults to 1
* **lineWidth** - the line width in ems, for wrapping; defaults to Infinity
* **textOverflow** - how to wrap or clip lines longer than the specified line width
* **monospace** - if true, changes the default **fontFamily** and metrics to monospace
* **fontFamily** - the font name; defaults to [*system-ui*](https://drafts.csswg.org/css-fonts-4/#valdef-font-family-system-ui)
* **fontSize** - the font size in pixels; defaults to 10
* **fontStyle** - the [font style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style); defaults to *normal*
* **fontVariant** - the [font variant](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant); defaults to *normal*
* **fontWeight** - the [font weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight); defaults to *normal*
* **frameAnchor** - how to position the text within the frame; defaults to *middle*
* **rotate** - the rotation angle in degrees clockwise; defaults to 0

If a **lineWidth** is specified, input text values will be wrapped as needed to fit while preserving existing newlines. The line wrapping implementation is rudimentary: it replaces the space before the word that overflows with a line feed (`\n`). Lines might also be split on words that contain a soft-hyphen (`\xad`), replacing it with a hyphen (-). For non-ASCII, non-U.S. English text, or for when a different font is used, you may get better results by hard-wrapping the text yourself (by supplying line feeds in the input). If the **monospace** option is truthy, the default **fontFamily** changes to monospace and the **lineWidth** option is interpreted as characters (ch) rather than ems.

The **textOverflow** option can be used to truncate lines of text longer than the given **lineWidth**. If the mark does not have a **title** channel, a title with the non-truncated text is also added. The following **textOverflow** values are supported:

* null (default) - preserve overflowing characters
* *clip* or *clip-end* - remove characters from the end
* *clip-start* - remove characters from the start
* *ellipsis* or *ellipsis-end* - replace characters from the end with an ellipsis (…)
* *ellipsis-start* - replace characters from the start with an ellipsis (…)
* *ellipsis-middle* - replace characters from the middle with an ellipsis (…)

The **fontSize** and **rotate** options can be specified as either channels or constants. When fontSize or rotate is specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel.

If the **frameAnchor** option is not specified, then **textAnchor** and **lineAnchor** default to middle. Otherwise, **textAnchor** defaults to start if **frameAnchor** is on the left, end if **frameAnchor** is on the right, and otherwise middle. Similarly, **lineAnchor** defaults to top if **frameAnchor** is on the top, bottom if **frameAnchor** is on the bottom, and otherwise middle.

The **paintOrder** option defaults to *stroke* and the **strokeWidth** option defaults to 3. By setting **fill** to the foreground color and **stroke** to the background color (such as *black* and *white*, respectively), you can surround text with a “halo” which may improve legibility against a busy background.

## text(*data*, *options*)

```js
Plot.text(driving, {x: "miles", y: "gas", text: "year"})
```

Returns a new text mark with the given *data* and *options*. If neither the **x** nor **y** nor **frameAnchor** options are specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

## textX(*data*, *options*)

```js
Plot.textX(alphabet.map((d) => d.frequency))
```

Equivalent to [text](#text-data-options), except **x** defaults to [identity](../features/transforms.md#identity) and assumes that *data* = [*x₀*, *x₁*, *x₂*, …].

If an **interval** is specified, such as d3.utcDay, **y** is transformed to (*interval*.floor(*y*) + *interval*.offset(*interval*.floor(*y*))) / 2. If the interval is specified as a number *n*, *y* will be the midpoint of two consecutive multiples of *n* that bracket *y*. Named UTC intervals such as *day* are also supported; see [scale options](../features/scales#scale-options).

## textY(*data*, *options*)

```js
Plot.textY(alphabet.map((d) => d.frequency))
```

Equivalent to [text](#text-data-options), except **y** defaults to [identity](../features/transforms.md#identity) and assumes that *data* = [*y₀*, *y₁*, *y₂*, …].

If an **interval** is specified, such as d3.utcDay, **x** is transformed to (*interval*.floor(*x*) + *interval*.offset(*interval*.floor(*x*))) / 2. If the interval is specified as a number *n*, *x* will be the midpoint of two consecutive multiples of *n* that bracket *x*. Named UTC intervals such as *day* are also supported; see [scale options](../features/scales#scale-options).
