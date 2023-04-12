# Text mark

The **text** mark draws text at the given *xy* position. It is often used to label other marks, such as to show the value of a bar; when space is available, this can allow faster and more accurate reading of values than an axis alone (or a tooltip).

```js
Plot.plot({
  x: {
    label: null
  },
  y: {
    grid: true,
    label: "↑ Frequency (%)",
    transform: d => d * 100
  },
  marks: [
    Plot.barY(alphabet, {x: "letter", y: "frequency"}),
    Plot.text(alphabet, {x: "letter", y: "frequency", text: d => (d.frequency * 100).toFixed(1), dy: -5}),
    Plot.ruleY([0])
  ]
})
```

If there are too many data points, labels may be hard to read due to occlusion. The [*filter* transform](../transforms.md) can be used to label only some data. In the connected scatterplot below (recreating Hannah Fairfield’s [“Driving Shifts Into Reverse”](http://www.nytimes.com/imagepages/2010/05/02/business/02metrics.html) from 2009), every fifth year is labeled. In the future, we expect Plot will have an automatic labeling transform, perhaps similar to Philippe Rivière’s [Occlusion](https://observablehq.com/@fil/occlusion).

```js
Plot.plot({
  grid: true,
  x: {
    label: "Miles driven (per capita per year) →"
  },
  y: {
    label: "↑ Price of gas (average per gallon, adjusted)"
  },
  marks: [
    Plot.line(driving, {x: "miles", y: "gas", curve: "catmull-rom"}),
    Plot.dot(driving, {x: "miles", y: "gas", fill: "currentColor"}),
    Plot.text(driving, {filter: d => d.year % 5 === 0, x: "miles", y: "gas", text: d => `${d.year}`, dy: -8})
  ]
})
```

For line charts with multiple series, you often wish to label only the start or end of the line. This can be done by slicing the data, as below (note this data is in reverse chronological order, so the first element in the data is the most recent), or by using the [select transform](../transforms/select.md).

```js
Plot.plot({
  y: {
    grid: true,
    nice: true,
    label: "↑ Travelers per day (millions)",
    transform: d => d / 1e6
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(travelers, {
      x: "date",
      y: "previous",
      stroke: "#bab0ab"
    }),
    Plot.line(travelers, {
      x: "date",
      y: "current"
    }),
    Plot.text(travelers.slice(0, 1), {
      x: "date",
      y: "previous",
      text: ["2019"],
      fill: "#8a817c",
      dy: "-0.5em"
    }),
    Plot.text(travelers.slice(0, 1), {
      x: "date",
      y: "current",
      text: ["2020"],
      dy: "1.2em"
    })
  ]
})
```

A text mark can also be used to visualize data directly, similar to a [dot mark](./dot.md) in a scatterplot. Below a “stem and leaf” plot of Caltrain’s Palo Alto station schedule uses [stacked](../transforms/stack.md) text. The *fill* channel provides a color encoding to distinguish local trains that make every stop (*N* in black), limited trains that make fewer stops (*L* in orange), and “baby bullet” trains that make the fewest stops (*B* in red).

```js
Plot.plot({
  width: 240,
  axis: null,
  y: {
    domain: d3.range(4, 25).map(String)
  },
  color: {
    domain: "NLB",
    range: ["currentColor", "peru", "brown"],
    legend: true
  },
  marks: [
    Plot.text([[1, "4"]], {
      text: ["Northbound"],
      textAnchor: "start"
    }),
    Plot.text([[-1, "4"]], {
      text: ["Southbound"],
      textAnchor: "end"
    }),
    Plot.text(new Set(caltrain.map(d => d.hours)), {
      x: 0,
      y: d => d,
      text: d => `${(d - 1) % 12 + 1}${(d % 24) >= 12 ? "p": "a"}`
    }),
    Plot.text(caltrain, Plot.stackX2({
      filter: d => d.orientation === "N",
      x: 1,
      y: "hours",
      text: d => d.minutes.padStart(2, "0"),
      title: d => `${d.time} ${d.line}`,
      fill: "type",
      textAnchor: "start"
    })),
    Plot.text(caltrain, Plot.stackX2({
      filter: d => d.orientation === "S",
      x: -1,
      y: "hours",
      text: d => d.minutes.padStart(2, "0"),
      title: d => `${d.time} ${d.line}`,
      fill: "type",
      textAnchor: "end"
    })),
    Plot.ruleX([-0.5, 0.5])
  ]
})
```

The *title* channel specifies a tooltip to be displayed when the user mouses over the text. This is used above to show the time and number of each train.

The text mark provides channels for *x*, *y*, *z* (for *z*-order), *text*, *title*, *fill*, and *rotate*. All other options are constants. So, if you want some labels to be left-aligned and others to be right-aligned, as above, use separate text marks with different *textAnchor* options.

The *x* and *y* channels are optional; a one-dimensional text mark can be produced by specifying only one of *x* or *y*. If both the *x* and *y* channels are not defined, the text mark assumes that the data is an iterable of points [[*x₁*, *y₁*], [*x₂*, *y₂*], …], allowing for shorthand. Furthermore, the default *text* channel is the associated datum’s index. (This is rarely what you want, but at least it gets something on the screen.)

```js
points = Array.from({length: 10}, (_, i) => [1.2 - Math.sin(1 + i / 5), Math.cos(i / 6)])
```

```js
Plot.plot({
  grid: true,
  x: {
    domain: [0, 1]
  },
  y: {
    domain: [0, 1]
  },
  marks: [
    Plot.line(points),
    Plot.dot(points, {fill: "white", r: 6}),
    Plot.text(points)
  ]
})
```

The text mark exposes the following SVG text attributes as options: [*textAnchor*](https://www.w3.org/TR/SVG11/text.html#TextAnchorProperty), [*fontFamily*](https://www.w3.org/TR/SVG11/text.html#FontFamilyProperty), [*fontSize*](https://www.w3.org/TR/SVG11/text.html#FontSizeProperty), [*fontStyle*](https://www.w3.org/TR/SVG11/text.html#FontStyleProperty), [*fontVariant*](https://www.w3.org/TR/SVG11/text.html#FontVariantProperty), [*fontWeight*](https://www.w3.org/TR/SVG11/text.html#FontWeightProperty), and [*rotate*](https://www.w3.org/TR/SVG11/text.html#TSpanElementRotateAttribute). The [*dx*](https://www.w3.org/TR/SVG11/text.html#TSpanElementDXAttribute) and [*dy*](https://www.w3.org/TR/SVG11/text.html#TSpanElementDYAttribute) attributes are supported, and must be specified in pixels. If the *x* or *y* channels are not specified, the *frameAnchor* option indicates where the text should go in the chart: top-left, middle, bottom-right, etc.

The text mark supports the creation of multiple lines of text with [tspan](https://www.w3.org/TR/SVG11/text.html#TSpanElement) elements, in two ways. First, you can provide the line information with newline characters:

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

Second, if the text is not already wrapped, the *lineWidth* option triggers a line wrapping algorithm. This option must be specified as a number in *em* (i.e. font-size) units. For performance and simplicity, Plot does not measure the text exactly, but instead uses a heuristic to evaluate the length of each character. When a word contains a [soft-hyphen](https://en.wikipedia.org/wiki/Soft_hyphen) (\\xad), it might be replaced by a dash and a line feed. Using the *monospace* option overrides that heuristic for fixed-width fonts, and counts the characters instead.

```js
Plot.plot({
  height: 200,
  marginBottom: 12,
  x: { type: "point", align: 0, axis: "top", tickSize: 0 },
  marks: [
    Plot.text(
      [
        "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before cof\xadfin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.",
        "There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water-gazers there.",
        "Circumambulate the city of a dreamy Sabbath afternoon. Go from Corlears Hook to Coenties Slip, and from thence, by Whitehall, northward. What do you see?—Posted like silent sentinels all around the town, stand thousands upon thousands of mortal men fixed in ocean reveries. Some leaning against the spiles; some seated upon the pier-heads; some looking over the bulwarks of ships from China; some high aloft in the rigging, as if striving to get a still better seaward peep. But these are all landsmen; of week days pent up in lath and plaster—tied to counters, nailed to benches, clinched to desks. How then is this? Are the green fields gone? What do they here?"
      ],
      {
        frameAnchor: "top",
        fontSize: 9,
        x: (d, i) => 1 + i, // paragraph number
        lineWidth: 20,
        textAnchor: "start",
        lineHeight: 1.3,
        // monospace: true,
        clip: true
      }
    )
  ]
})
```

The *lineAnchor* option controls the line anchor for vertical position; top, bottom, or middle; and the *lineHeight* option specifies the line height in ems.

## Text options

Draws a text label at the specified position.

The following channels are required:

* **text** - the text contents (a string, possibly with multiple lines)

If the **text** contains `\n`, `\r\n`, or `\r`, it will be rendered as multiple lines via tspan elements. If the **text** is specified as numbers or dates, a default formatter will automatically be applied, and the **fontVariant** will default to tabular-nums instead of normal. For more control over number and date formatting, consider [*number*.toLocaleString](https://observablehq.com/@mbostock/number-formatting), [*date*.toLocaleString](https://observablehq.com/@mbostock/date-formatting), [d3-format](https://github.com/d3/d3-format), or [d3-time-format](https://github.com/d3/d3-time-format). If **text** is not specified, it defaults to the identity function for primitive data (such as numbers, dates, and strings), and to the zero-based index [0, 1, 2, …] for objects (so that something identifying is visible by default).

In addition to the [standard mark options](#marks), the following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale
* **y** - the vertical position; bound to the *y* scale
* **fontSize** - the font size in pixels
* **rotate** - the rotation angle in degrees clockwise

If either of the **x** or **y** channels are not specified, the corresponding position is controlled by the **frameAnchor** option.

The following text-specific constant options are also supported:

* **textAnchor** - the [text anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) for horizontal position; start, end, or middle
* **lineAnchor** - the line anchor for vertical position; top, bottom, or middle
* **lineHeight** - the line height in ems; defaults to 1
* **lineWidth** - the line width in ems, for wrapping; defaults to Infinity
* **textOverflow** - how to wrap or clip lines longer than the specified line width
* **monospace** - if true, changes the default fontFamily and metrics to monospace
* **fontFamily** - the font name; defaults to [system-ui](https://drafts.csswg.org/css-fonts-4/#valdef-font-family-system-ui)
* **fontSize** - the font size in pixels; defaults to 10
* **fontStyle** - the [font style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style); defaults to normal
* **fontVariant** - the [font variant](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant); defaults to normal
* **fontWeight** - the [font weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight); defaults to normal
* **frameAnchor** - the [frame anchor](#frameanchor); defaults to *middle*
* **rotate** - the rotation angle in degrees clockwise; defaults to 0

If a **lineWidth** is specified, input text values will be wrapped as needed to fit while preserving existing newlines. The line wrapping implementation is rudimentary: it replaces the space before the word that overflows with a line feed (\n). Lines might also be split on words that contain a soft-hyphen (\xad), replacing it with a dash (-) and a line feed. For non-ASCII, non-U.S. English text, or for when a different font is used, you may get better results by hard-wrapping the text yourself (by supplying line feeds in the input). If the **monospace** option is truthy, the default **fontFamily** changes to “ui-monospace, monospace”, and the **lineWidth** option is interpreted as characters (ch) rather than ems.

The **textOverflow** option can be used to truncate lines of text longer than the given **lineWidth**. If the mark does not have a **title** channel, a title with the non-truncated text is also added. The following **textOverflow** values are supported:

* null (default) - preserve overflowing characters
* *clip* or *clip-end* - remove characters from the end
* *clip-start* - remove characters from the start
* *ellipsis* or *ellipsis-end* - replace characters from the end with an ellipsis (…)
* *ellipsis-start* - replace characters from the start with an ellipsis (…)
* *ellipsis-middle* - replace characters from the middle with an ellipsis (…)

The **fontSize** and **rotate** options can be specified as either channels or constants. When fontSize or rotate is specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel.

If the **frameAnchor** option is not specified, then **textAnchor** and **lineAnchor** default to middle. Otherwise, **textAnchor** defaults to start if **frameAnchor** is on the left, end if **frameAnchor** is on the right, and otherwise middle. Similarly, **lineAnchor** defaults to top if **frameAnchor** is on the top, bottom if **frameAnchor** is on the bottom, and otherwise middle.

The **paintOrder** option defaults to “stroke” and the **strokeWidth** option defaults to 3. By setting **fill** to the foreground color and **stroke** to the background color (such as black and white, respectively), you can surround text with a “halo” which may improve legibility against a busy background.

## text(*data*, *options*)

Returns a new text mark with the given *data* and *options*. If neither the **x** nor **y** nor **frameAnchor** options are specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].

## textX(*data*, *options*)

Equivalent to [Plot.text](#plottextdata-options), except **x** defaults to the identity function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …].

If an **interval** is specified, such as d3.utcDay, **y** is transformed to (*interval*.floor(*y*) + *interval*.offset(*interval*.floor(*y*))) / 2. If the interval is specified as a number *n*, *y* will be the midpoint of two consecutive multiples of *n* that bracket *y*.

## textY(*data*, *options*)

Equivalent to [Plot.text](#plottextdata-options), except **y** defaults to the identity function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …].

If an **interval** is specified, such as d3.utcDay, **x** is transformed to (*interval*.floor(*x*) + *interval*.offset(*interval*.floor(*x*))) / 2. If the interval is specified as a number *n*, *x* will be the midpoint of two consecutive multiples of *n* that bracket *x*.
