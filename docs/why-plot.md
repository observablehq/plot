<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import aapl from "./data/aapl.ts";
import penguins from "./data/penguins.ts";

function arealineY(data, {color, fillOpacity = 0.1, ...options} = {}) {
  return Plot.marks(
    Plot.ruleY([0]),
    Plot.areaY(data, {fill: color, fillOpacity, ...options}),
    Plot.lineY(data, {stroke: color, ...options})
  );
}

</script>

# Why Plot?

<!-- To be clear, we still love D3—and we’re still actively developing D3, and indeed using D3 to build Plot. But D3’s popularity obscures the fact that it was designed for a fairly niche application: *bespoke* data visualization. And with Plot, we think we now have a tool that is better suited for many, even most, visualization needs. -->

Plot is for exploratory data visualization. It’s for finding insights quickly. Its API, while expressive and configurable, optimizes for conciseness and memorability. We want the time to first chart to be as fast as possible.

And the speed doesn’t stop there: Plot helps you quickly pivot and refine your views of data. Our hope with Plot is that you’ll spend less time reading the docs, searching for code to copy-paste, and debugging—and more time asking questions of data.

Compared to other visualization tools, including low-level tools such as D3 and less expressive high-level tools such as chart templates, we think you’ll be more productive exploring data with Plot. You’ll spend more time [“using vision to think”](https://www.amazon.com/Readings-Information-Visualization-Interactive-Technologies/dp/1558605339) and less time wrangling the machinery of programming.

Or put more simply: **with Plot, you’ll see more charts.**

## Plot and D3

Observable Plot is informed by more than [ten years’ experience](https://observablehq.com/@mbostock/10-years-of-open-source-visualization) developing [D3](https://d3js.org), the web’s most popular library for data visualization.

We’ve long said that *D3 makes things possible, not necessarily easy.* And that’s true regardless of the task at hand. D3 makes hard and amazing things *possible*, yes, but even simple things that should be easy are often not. To paraphrase Amanda Cox: “Use D3 if you think it’s perfectly normal to write a hundred lines of code for a bar chart.”

**Plot’s goal is to make the easy things easy, and fast, and then some.**

:::tip
Whether or not Plot succeeds at this goal is up to you—so we’d love [your feedback](https://talk.observablehq.com/c/site-feedback/3) on what you find easy or hard to do with Plot. And we encourage you to [ask for help](https://talk.observablehq.com/c/help/6) when you get stuck. We learn a lot from helping!
:::

Since Plot and D3 have different goals, they make different trade-offs. Plot is more efficient: you can make charts quickly. But it is also necessarily less expressive: bespoke visualizations with extensive animation and interaction, advanced techniques like force-directed graph layout, or even developing your own charting library, are better done with D3’s low-level API.

We recommend D3 for *bespoke* data visualizations, if you decide the extra expressiveness of D3 is worth the time and effort. D3 makes sense for media organizations such as *The New York Times* or *The Pudding*, where a single graphic may be seen by a million readers, and where a team of editors can work together to advance the state of the art in visual communication; but is it the best tool for building your team’s private dashboard, or a one-off analysis? And you may be surprised how far you can get with Plot.

## Plot is concise

You can make a meaningful chart in Plot with as little as one line of code.

:::plot
```js
Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "species"}).plot()
```
:::

What makes Plot concise? In a word: *defaults*. If you specify the semantics—your data and the desired encodings—Plot will figure out the rest.

The beauty of defaults is that you can override them as needed. This is ideal for exploratory analysis: you can invest very little in an initial chart, but as you start to see something interesting, you can progressively customize the chart to make it better.

Also: [transforms](./transforms.md). Munging data, not assigning visual encodings, is most of the work of data analysis. Plot’s transforms let you aggregate and derive data within your plot specification, reducing the time spent preparing data. For example, if you have an array of categorical values (penguin species), you can quickly count them with the group transform.

:::plot
```js
Plot.barX(penguins.map((d) => d.species), Plot.groupY()).plot()
```
:::

## Plot is composable

Simple components can gain power through composition, such as layering multiple [marks](./marks.md) into a single plot. Take the traditional *grammar of graphics* approach to a new level with custom compound marks, such as this one comprising a rule, area, and line:

```js
function arealineY(data, {color, fillOpacity = 0.1, ...options} = {}) {
  return Plot.marks(
    Plot.ruleY([0]),
    Plot.areaY(data, {fill: color, fillOpacity, ...options}),
    Plot.lineY(data, {stroke: color, ...options})
  );
}
```

You can now use this compound mark like any built-in mark:

:::plot
```js
arealineY(aapl, {x: "Date", y: "Close", color: "steelblue"}).plot()
```
:::

Plot uses this technique internally: the [box mark](./marks/box.md) and [axis mark](./marks/axis.md) are both compound marks.

:::plot
```js
Plot.boxX(penguins, {x: "body_mass_g", y: "species"}).plot()
```
:::

Plot’s transforms are composable, too. For example, to combine the [group transform](./transforms/group.md) with the [stack transform](./transforms/stack.md), simply pass the result of the group transform to the stack transform.

:::plot
```js
Plot.plot({
  color: {
    legend: true
  },
  marks: [
    Plot.barX(penguins, Plot.stackX(Plot.groupY({x: "count"}, {y: "species", fill: "sex"})))
  ]
})
```
:::

Mark options are plain JavaScript objects, so you can also share (possibly transformed) options across multiple marks.

## Plot is extensible

Plot isn’t a new language; it’s “just” vanilla JavaScript. Plot embraces JavaScript, letting you plug in your own functions for accessors, reducers, transforms… and even custom marks! Plot is *intended* to be *extended*—we can’t wait to see where you take it.

And Plot generates SVG, so you can style it with CSS and manipulate it just like you do with D3. (See [Mike Freeman’s tooltip plugin](https://observablehq.com/@mkfreeman/plot-tooltip) for a great example of extending Plot this way.)

<!-- ## Plot understands data types

Plot encourages you to do type coercion and parsing *outside* of the Plot. For example if you provide strings, Plot interprets the data as ordinal, whereas if you provide numbers, Plot interprets the data as quantitative.

We’ve made some concessions to perform coercion within Plot, but in general we encourage you to do that elsewhere—say using Observable’s data table cell—so that you use consistent types throughout your analysis. This is better for performance since the type coercion is only done once, but more importantly, it elevates it to an explicit step, so that you can confirm that the types are what you expect. No more genes be interpreted as dates! -->

<!-- ## Plot looks good

Even though Plot has a minimalist aesthetic, we want it too look good. -->

## Plot powers Observable

We designed Plot to pair beautifully with Observable: to leverage [Observable’s reactive dataflow](https://observablehq.com/@observablehq/how-observable-runs) for fluid exploration and interaction. However, Plot does not depend on Observable; use it wherever you like.

Chart cell integration, snippets.
