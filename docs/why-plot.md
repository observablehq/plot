<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import PlotRender from "./components/PlotRender.js";

</script>

# Why Plot?

Observable Plot is informed by more than [ten years’ experience](https://observablehq.com/@mbostock/10-years-of-open-source-visualization) developing [D3](https://d3js.org), the web’s most popular library for data visualization.

We have a longstanding maxim that *D3 makes things possible, not necessarily easy.* And that’s true regardless of the task at hand. D3 makes the hard things *possible*, yes, but even the easy things are often not *easy*.

**Plot’s goal is to make the easy things easy, and fast, and then some.**

:::tip
Whether or not Plot succeeds is determined solely by you—so we’d love [your feedback](https://talk.observablehq.com/c/site-feedback/3) on what you find easy or hard to do with Plot.
:::

Since Plot and D3 have different goals, they make different trade-offs. There’s no “one ring to rule them all.” 💍 Plot is more efficient: you can make charts much more quickly. But it is also necessarily less expressive: bespoke visualizations with extensive animation and interaction, advanced techniques like force-directed graph layout, or even developing your own charting library, are better done with D3’s low-level API. This is why we still develop and recommend both Plot and D3 for different use cases, and indeed why Plot itself uses D3.

Plot is for *exploratory* data visualization. We highly recommend Plot if you’re just starting out in visualization—and even if you’re not—because you’ll be more productive analyzing data with Plot’s high-level API. You can spend more time [“using vision to think”](https://www.amazon.com/Readings-Information-Visualization-Interactive-Technologies/dp/1558605339) and less time wrangling the machinery of programming. Ultimately we believe Plot will help you be more successful at finding and communicating insights.

We recommend D3 for *bespoke* data visualizations, and only if you decide the extra expressiveness of D3 is worth the corresponding time and effort. D3 makes a lot of sense for media organizations such as *The New York Times* or *The Pudding*, where a single graphic may be seen by a million readers, and where a team of editors can work together to advance the state of the art in visual communication; but is it the best tool for building your team’s private dashboard, or a one-off analysis? And you may be surprised how far you can get with Plot.

## Plot is concise

With its concise and (hopefully) memorable API, Observable Plot lets you try out ideas quickly. You can make a meaningful chart with as little as one line of code.

Plot’s aim is speed and convenience. Our hope is you’ll spend less time reading the docs, searching for snippets, and debugging—and more time asking questions of data. With faster iteration, you can see more of your data and find more insights.

It’s for exploring data quickly.

It’s designed to be memorable, even if you use Plot infrequently. If you can’t remember a complicated sequence of commands, it’ll slow you down.

What makes Plot concise? In a word: *defaults*.

It does a lot by default. Default options, default axes, accessibility.

Most extreme example is the mark shorthand and Plot.auto.

The beauty of defaults is that you can always override them. So even though Plot is concise, you can incrementally add to your plot specification if you decide you need to. This works well with data analysis: you can invest very little in your first few charts, but as you start to see something interesting, you can progressively customize the chart to make it communicate more effectively.

## Plot is composable

Yet Plot is still powerful and expressive when you need it—through composition. Plot is highly configurable.

Marks can be layered.

Creating compound marks using nested arrays or Plot.marks. Example of an arealine mark combining an area and a topline. Example of Plot’s boxplot mark and axis mark.

Also sharing options across marks by pulling them out into an object and then spreading them into multiple marks’ options.

Transforms are composable, too.

## Plot is extensible

Plot is “just” JavaScript. You can plug in your own functions for accessors, reducers, transforms… even custom marks!

It generates SVG, so you can style it with CSS and manipulate it just like you do with D3. People have written plugins this way.

And Plot is designed to be extended — we can’t wait to see where the community takes it.

We created Plot to better support exploratory data analysis in reactive, JavaScript notebooks like Observable. We continue to support D3 for bespoke explanatory visualization and recommend Vega-Lite for imperative, polyglot environments such as Jupyter.

## Plot understands data types

Plot encourages you to do type coercion and parsing *outside* of the Plot. For example if you provide strings, Plot interprets the data as ordinal, whereas if you provide numbers, Plot interprets the data as quantitative.

We’ve made some concessions to perform coercion within Plot, but in general we encourage you to do that elsewhere—say using Observable’s data table cell—so that you use consistent types throughout your analysis. This is better for performance since the type coercion is only done once, but more importantly, it elevates it to an explicit step, so that you can confirm that the types are what you expect. No more genes be interpreted as dates!

## Plot looks good

Even though Plot has a minimalist aesthetic, we want it too look good.

## Plot powers Observable

We designed Plot to pair beautifully with Observable: to leverage Observable dataflow for fluid exploration and interaction. However, Plot does not depend on Observable; use it wherever you like.

Plot supports interaction with minimal fuss through [Observable dataflow](https://observablehq.com/@observablehq/how-observable-runs).

Chart cell integration, snippets.
