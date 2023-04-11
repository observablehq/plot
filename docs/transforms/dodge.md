# Dodge

Given a position dimension (either *x* or *y*), the **dodge** transform computes the other position dimension such that dots are packed densely without overlapping. The **dodgeX** transform computes *x* (horizontal position) given *y* (vertical position), while the **dodgeY** transform computes *y* given *x*.

The dodge transform is commonly used to produce “beeswarm” plots, a way of showing a one-dimensional distribution that preserves the visual identity of individual data points. For example, the dots below represent the weights of cars; the rough shape of the pile gives a sense of the overall distribution (peaking around 2,100 pounds), and you can hover an individual dot to see which car it represents.

```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dotX(cars, Plot.dodgeY({x: "weight (lb)", title: "name", fill: "currentColor"}))
  ]
})
```

Compare this to a conventional histogram using a [rect mark](../marks/rect.md).

```js
Plot.plot({
  height: 180,
  marks: [
    Plot.rectY(cars, Plot.binX({y: "count"}, {x: "weight (lb)", thresholds: 40})),
    Plot.ruleY([0])
  ]
})
```

Beeswarm plots avoid the occlusion problem of one-dimensional scatterplots.

```js
Plot.plot({
  marks: [
    Plot.dotX(cars, {x: "weight (lb)", title: "name"})
  ]
})
```

Unlike a [force-directed beeswarm](https://observablehq.com/@harrystevens/force-directed-beeswarm), the dodge transform exactly preserves the input position dimension, resulting in a more accurate visualization. Also, the dodge transform tends to be faster than the iterative constraint relaxation used in the force-directed approach. We use Mikola Lysenko’s [interval-tree-1d library](https://github.com/mikolalysenko/interval-tree-1d) for fast intersection testing. (For previous work on accurate beeswarms, see Yuri Vishnevsky’s [“Building a Better Beeswarm”](https://observablehq.com/@yurivish/building-a-better-beeswarm), James Trimble’s [accurate-beeswarm-plot](https://github.com/jtrim-ons/accurate-beeswarm-plot), and Franck Lebeau’s [d3-beeswarm](https://github.com/Kcnarf/d3-beeswarm).)

The **anchor** option specifies the layout baseline: the optimal output position. For the dodgeX transform, the supported anchors are: _left_ (default), _middle_, _right_. For the dodgeY transform, the supported anchors are: _bottom_ (default), _middle_, _top_. When the _middle_ anchor is used, the dots are placed symmetrically around the baseline.

<!-- viewof anchor = Inputs.radio(["top", "middle", "bottom"], {label: "Anchor", value: "middle"}) -->

```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dot(cars, Plot.dodgeY({x: "weight (lb)", fill: "currentColor", anchor}))
  ]
})
```

When using dodgeY, you must typically specify the plot’s **height** to create suitable space for the layout. The dodge transform is not currently able to set the height automatically. For dodgeX, the default **width** of 640 is often sufficient, though you may need to adjust it as well depending on your data.

The dodge transform differs from the [stack transform](./stack.md) in that the dots do not need the exact same input position to avoid overlap; the dodge transform respects the radius of each dot. Try adjusting the radius below to see the effect.

<!-- viewof r = Inputs.range([0.5, 10], {label: "Radius (r)", step: 0.1}) -->

```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dot(cars, Plot.dodgeY({x: "weight (lb)", r, fill: "currentColor"}))
  ]
})
```

The dodge transform also supports a **padding** option (default 1), which specifies the minimum separating distance between dots. Increase it for more breathing room.

<!-- viewof padding = Inputs.range([-1, 5], {label: "Padding", value: 2, step: 0.1}) -->

```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dot(cars, Plot.dodgeY({x: "weight (lb)", padding, fill: "currentColor"}))
  ]
})
```

If an *r* input channel is specified, the dodge transform will position circles of varying radius. The chart below shows twenty years of IPO offerings leading up to Facebook’s $104B offering in 2012; each circle is sized proportionally to the associated company’s valuation at IPO. (This data comes from [“The Facebook Offering: How It Compares”](https://archive.nytimes.com/www.nytimes.com/interactive/2012/05/17/business/dealbook/how-the-facebook-offering-compares.html?hp) by Jeremy Ashkenas, Matthew Bloch, Shan Carter, and Amanda Cox.) Facebook’s valuation was nearly four times that of Google, the previous record. The 2000 [dot-com bubble](https://en.wikipedia.org/wiki/Dot-com_bubble) is also visible.

```js
Plot.plot({
  insetRight: 10,
  height: 400,
  width,
  marks: [
    Plot.dot(
      ipos,
      Plot.dodgeY({
        x: "date",
        r: "rMVOP",
        title: d => `${d.NAME}\n${(d.rMVOP / 1e3).toFixed(1)}B`,
        fill: "currentColor"
      })
    ),
    Plot.text(
      ipos,
      Plot.dodgeY({
        filter: (d) => d.rMVOP > 5e3,
        x: "date",
        r: "rMVOP",
        text: d => (d.rMVOP / 1e3).toFixed(),
        fill: "white",
        fontWeight: "bold"
      })
    )
  ]
})
```

<!-- ipos = (await FileAttachment("ipos.csv").csv({typed: true})).filter(d => d.date.getUTCFullYear() >= 1991) -->

The above example also demonstrates that the dodge transform can be composed not just with the [dot mark](../marks/dot.md), but with any mark that supports _x_ and _y_ position. Below, we use the [text mark](../marks/text.md) instead to show company valuations (in billions).

```js
Plot.plot({
  insetRight: 10,
  height: 400,
  width,
  marks: [
    Plot.text(
      ipos,
      Plot.dodgeY({
        x: "date",
        text: d => (d.rMVOP / 1e3).toFixed(1),
        title: "NAME",
        fontSize: d => Math.min(22, Math.cbrt(d.rMVOP / 1e3) * 6),
        r: "rMVOP"
      })
    )
  ]
})
```

The dodge transform places dots sequentially, each time finding the closest position to the baseline that avoids intersection with previously-placed dots. Because this is a [greedy algorithm](https://en.wikipedia.org/wiki/Greedy_algorithm), the resulting layout is highly dependent on the input data order. When the _r_ input channel is specified, dots are sorted by descending radius by default, such that the largest dots are placed closest to the baseline. Without an *r* channel, dots are placed in input order by default.

To adjust the dodge layout, use the **sort** and **reverse** option to change the input order. For example, if the **sort** option uses the same column as the _x_ dimension, the dots are arranged in piles leaning right.

```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dotX(cars, Plot.dodgeY({x: "weight (lb)", title: "name", fill: "currentColor", sort: "weight (lb)"}))
  ]
})
```

Reversing the sort order produces piles leaning left.

```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dotX(cars, Plot.dodgeY({x: "weight (lb)", title: "name", fill: "currentColor", sort: "weight (lb)", reverse: true}))
  ]
})
```

To avoid repeating a channel definition, you can also specify a named channel with the **sort** option.

```js
Plot.plot({
  height: 180,
  marks: [
    Plot.dotX(cars, Plot.dodgeY({x: "weight (lb)", title: "name", fill: "currentColor", sort: {channel: "x"}}))
  ]
})
```
