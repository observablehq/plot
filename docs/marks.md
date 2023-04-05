<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import Render from "../components/Render.js";
import RenderSnippet from "../components/Render.js";

const sales = [
  {units: 10, fruit: "peach"},
  {units: 20, fruit: "pear"},
  {units: 40, fruit: "plum"},
  {units: 30, fruit: "plum"}
];

</script>

# Marks and channels

Plot doesn’t have chart types. Instead, it has marks: geometric shapes such as bars, dots, and lines. Yet unlike a conventional graphics system, Plot marks are not positioned in pixels or colored literally. You draw with abstract data!

To see how, let’s draw using a [dot mark](/dot). A Plot mark is a template for generating shapes from data rather than a single shape. Consider this toy tabular dataset recording fruit sales as an array of {*units*, *fruit*} objects. We’ll hard-code the data here, but more commonly you’d load a CSV file.

```js
sales = [
  {units: 10, fruit: "peach"},
  {units: 20, fruit: "pear"},
  {units: 40, fruit: "plum"},
  {units: 30, fruit: "plum"}
]
```

To make a plot, we bind columns of data to visual properties of marks. Since these visual properties encode abstract data, we call them *channels*. For example, we can encode the *units* column as the *x*-position and the *fruit* column as the *y*-position.

<RenderSnippet :mark='Plot.dot(sales, {x: "units", y: "fruit"})' />

```js
Plot.dot(sales, {x: "units", y: "fruit"}).plot()
```

:::tip
The above code uses Plot’s shorthand *dot*.plot. The longhand equivalent is to call Plot.plot and specify the **marks** option. The single-mark shorthand is useful for quick plots, while Plot.plot is better suited for layering multiple marks.
:::

The *x*-values {10, 20, …} are numbers representing units sold, not pixels. Under the hood, Plot constructs an implicit [linear scale](./scales) to map the minimum *x* = 10 to the left edge of the plot and the maximum *x* = 40 to the right edge. The *y*-values are strings representing categorical data. Plot therefore constructs an implicit ordinal (*point*) scale to divide the available vertical space evenly for the three distinct *y*-values.

Named columns are convenient for tabular data represented as an array of objects, but for greater flexibility we can use a function to feed abstract values to a channel. Channel functions are repeatedly invoked for each element in the data, being passed the datum (by convention *d*) and zero-based index (*i*). These functions can also perform data processing; for example, perhaps *units* is in thousands.

<RenderSnippet :mark='Plot.dot(sales, {x: (d) => d.units * 1000, y: (d) => d.fruit})' />

```js
Plot.dot(sales, {x: (d) => d.units * 1000, y: (d) => d.fruit}).plot()
```

Named columns are also nice because they allow Plot to label the axes automatically, making the meaning of the plot more apparent. These labels are lost above, but we could add them back if desired by using the *scale*.**label** option.

<RenderSnippet :mark='Plot.dot(sales, {x: (d) => d.units, y: (d) => d.fruit})' :options='{x: {label: "units →"}}' />

```js{3}
Plot.dot(sales, {x: (d) => d.units, y: (d) => d.fruit}).plot({
  x: {
    label: "units →"
  }
})
```

An equivalent (and more efficient) way to specify channel values is with parallel arrays. Here it doesn’t really matter what’s in the data as long as each channel has an array of values of the same length as the data. This approach is well-suited to columnar data structures such as [Arquero](/@uwdata/introducing-arquero?collection=@uwdata/arquero).

<RenderSnippet :mark='Plot.dot([0, 1, 2, 3], {
  x: [10, 20, 40, 30],
  y: ["peach", "pear", "plum", "plum"]
})' />

```js
Plot.dot([0, 1, 2, 3], {
  x: [10, 20, 40, 30],
  y: ["peach", "pear", "plum", "plum"]
}).plot()
```

Many marks provide default channel definitions for even more concise shorthand. If we pass [[*x₁*, *y₁*], [*x₂*, *y₂*], [*x₃*, *y₃*], [*x₄*, *y₄*]] as data, we can use the dot’s default *x* and *y* channel definitions.

<RenderSnippet :mark='Plot.dot([
  [10, "peach"],
  [20, "pear"],
  [40, "plum"],
  [30, "plum"]
])' />

```js
Plot.dot([
  [10, "peach"],
  [20, "pear"],
  [40, "plum"],
  [30, "plum"]
]).plot()
```

Plots can have multiple marks. Marks are layered such that the last mark is drawn on top. Each mark has its own data, channels, and options. However, marks share scales. Hence, multiple marks can be used to combine datasets: the scales’ domains are inferred from the *union* of associated data. For example, if you *want* to draw each dot using a separate mark, you can, though it’s less efficient and more verbose.

```js
Plot.plot({
  marks: [
    Plot.dot([[10, "peach"]]), // x₁, y₁
    Plot.dot([[20, "pear"]]), // x₂, y₂
    Plot.dot([[40, "plum"]]), // etc.
    Plot.dot([[30, "plum"]])
  ]
})
```

Marks can also be used as annotations for values with special meaning, such as the [rule](/@observablehq/plot-rule?collection=@observablehq/plot) at *x* = 0 below.

```js
Plot.plot({
  marks: [
    Plot.dot(sales, {x: "units", y: "fruit"}),
    Plot.ruleX([0]) // a rule at x = 0
  ]
})
```

Plot currently supports about a dozen mark types: [Area](/@observablehq/plot-area?collection=@observablehq/plot), [Bar](/@observablehq/plot-bar?collection=@observablehq/plot), [Cell](/@observablehq/plot-cell?collection=@observablehq/plot), [Dot](/@observablehq/plot-dot?collection=@observablehq/plot), [Frame](/@observablehq/plot-frame?collection=@observablehq/plot), [Line](/@observablehq/plot-line?collection=@observablehq/plot), [Link](/@observablehq/plot-link?collection=@observablehq/plot), [Rect](/@observablehq/plot-rect?collection=@observablehq/plot), [Rule](/@observablehq/plot-rule?collection=@observablehq/plot), [Text](/@observablehq/plot-text?collection=@observablehq/plot), and [Tick](/@observablehq/plot-tick?collection=@observablehq/plot). Mark types do not just determine shape — they also determine which channels and options are supported, and what scales are associated with each channel, if any. Both bar and dot support *x* and *y* position.

```js
Plot.barX(sales, {x: "units", y: "fruit"}).plot() // bars extends from x = 0
```

The [bar mark](/@observablehq/plot-bar?collection=@observablehq/plot) is closely related to the [rect mark](/@observablehq/plot-rect?collection=@observablehq/plot). Both generate a rectangle; the difference is in how the coordinates of the rectangle are specified. For a bar, one side is a quantitative interval (*e.g.*, from 0 to a number of units sold) while the other is an ordinal (or categorical) value (*e.g.*, a fruit name); whereas for a rect, both sides are quantitative intervals. Hence a bar is used for a bar chart but a rect is needed for a histogram.

The barX’s *x* channel is shorthand for an implicit [stack transform](/@observablehq/plot-stack?collection=@observablehq/plot) on *x*, producing *x1* and *x2* channels. You can define these channels explicitly if preferred.

```js
Plot.barX(sales, {x1: 0, x2: "units", y: "fruit"}).plot()
```

Note that since there are two data points for plums, and because we explicitly set *x1* to zero instead of stacking, there are two overlapping bars hidden above. We can reveal them by setting the *fillOpacity* option. Whereas mark channels vary with data, mark options are shared by all instances of a mark. Both channels and options are specified in the same object (the second argument to the mark constructor, after data). See the mark type reference to know what channels and options are available.

```js
Plot.barX(sales, {x1: 0, x2: "units", y: "fruit", fillOpacity: 0.5}).plot()
```

If our goal is to show the total units sold, we could [group](/@observablehq/plot-group?collection=@observablehq/plot) to sum the values for each fruit instead of stacking. This aggregates the mark’s data along with its *x* and *y* channels, producing a single bar per fruit.

```js
Plot.barX(sales, Plot.groupY({x: "sum"}, {x: "units", y: "fruit"})).plot()
```

Bars support a *fill* option, should we desire blue bars instead of inheriting the text color from the surrounding page. We can also add a [rule](/@observablehq/plot-rule?collection=@observablehq/plot) to denote *x* = 0.

```js
Plot.plot({
  marks: [
    Plot.barX(sales, {x: "units", y: "fruit", fill: "steelblue"}),
    Plot.ruleX([0])
  ]
})
```

The *fill* option can also be specified as a channel to encode abstract data as color. We can use a categorical color encoding to give each bar a distinct color.

```js
Plot.plot({
  marks: [
    Plot.barX(sales, {x: "units", y: "fruit", fill: "fruit"}),
    Plot.ruleX([0])
  ]
})
```

How did Plot know that “fruit” is a field name, while “steelblue” is a color, if both are strings? Plot checks whether the *fill* is a valid CSS color; if it is, it interprets it as an option, and otherwise, as a field name for a channel. To explicitly declare *fill* as a channel, pass a function or an array of values.

```js
Plot.plot({
  marks: [
    Plot.barX(sales, {x: "units", y: "fruit", fill: (d) => d.fruit}),
    Plot.ruleX([0])
  ]
})
```

If you define the *fill* channel as a function, the function might return literal colors—in the case where all the values are valid CSS colors, Plot passes them through:

```js
Plot.plot({
  marks: [
    Plot.barX(sales, {x: "units", y: "fruit", fill: (d) => d.units > 20 ? "black" : "red"}),
    Plot.ruleX([0])
  ]
})
```

However, instead of returning literal colors, you might prefer to return an abstract value and then set the scale’s domain and range as desired. As a benefit, this allows Plot to generate a meaningful color legend. Now you’re thinking with data!

```js
Plot.plot({
  color: {
    domain: ["small", "big"],
    range: ["red", "black"],
    legend: true
  },
  marks: [
    Plot.barX(sales, {x: "units", y: "fruit", fill: (d) => d.units > 20 ? "big" : "small"}),
    Plot.ruleX([0])
  ]
})
```

Next, let’s dive behind the scenes to take a look at scales.
