# The lifecycle of a chart

:::warning
This documents how Plot builds a chart from its marks option. It is intended to give a high-level view of the lifecycle of a chart to advanced users—in particular developers who want to write custom marks and transforms. Please refer to our TypeScript declarations for precise details.
:::

## Gathering the marks

The **marks** option is an explicit list of [marks](./marks.md). Marks can be nested, nullish, Mark objects or bare functions. Plot flattens this into an array of instances of the Mark class: it filters out nullish marks, promotes bare functions to marks, and throws an error if any mark does not have a render method. It then appends an interactive tip mark for any mark passed with the **tip** option. (After the scales are derived, any implicit axis mark will also be prepended to the array of marks.)

The following methods of each Mark will be called as part of the lifecycle:

* initialize - compute the channel values
* initializer - second pass, using scales
* filter - determine valid data points
* project - apply a (geographic) projection to pairs of ⟨x,y⟩ channels
* render - returns a SVG element to insert in the chart

They are described below.

## Faceting

Facets are determined based on the top-level **facet**, **fx** and **fy** options and the mark’s **fx** and **fy** channels. Any mark explicitly faceted or using the same data as the top-level facet gets a faceted index.

The facet scales (*fx* and *fy*) are then computed, subdividing the global frame into as many frames where marks will be rendered with a subset of the data.

## Initializing marks

The **initialize** method is called on each mark, which computes its channels as (unscaled) values, possibly after transforming the data and facets (_e.g._ by grouping).

The initialize method materializes the marks’s data, calls the mark’s transform and sort functions, computes the mark’s channels and index, etc.

## Setting scales

Once all marks are initialized, all the scales associated to any of the marks’ channels are computed, based on the top-level options and the values in those channels. For example, the default domain of the *x* scale will include all the values from channels associated to *x* in any mark (typically *x*, *x1* and *x2*).

This stage sets the geometries of the chart, including default height, margins and the dimensions of the frame. (It also calls the mark’s **project** method, if any—this is used by the line mark to skip the point-based projection and render the lines with a proper geographic interpolation algorithm.)

The channels are scaled, meaning that any value *x* that was in data space is now also available as a scaled value in pixel space. Likewise, any *fill* or *stroke* value is now available as an actual color (like "red" or "#ff0000").

## Re-initializing marks

In a second pass, any mark’s *initializer* method is called, giving it a chance to derive secondary channels from the current values *and scales*. For instance, this is where the voronoi mark derives its geometry, based on the scaled channels (in pixel coordinates) of the data.

The initializer method is called with the following arguments: data, facets, channels, scales, dimensions, and context.

For details on each of these arguments see [below](#rendering-marks). It is worth noting here that a mark (for instance, the grid and the axis marks) can call the *context*.filterFacets function in the initializer to derive its default data from the scales.

Note that this order of operations implies that it is impossible to run a **transform** after an **initializer**—Plot will throw an error if you try.

## Additional scales

Marks are not allowed to mutate or reset existing scales through their initializer; however, those might return new channels that need additional scales—for instance, the hexbin transform which operates on scaled *x* and *y* values might generate bins with a varying radius or fill color. The corresponding *r* and *color* scales, if they were not already set, can be set from these new channels.

## Rendering the chart

Plot creates an SVG element with the proper dimensions, adds the style, then proceeds to draw the visual representation of each mark as described below. If the chart has additional elements such as a title, a subtitle, a caption or legends, Plot wraps the SVG with a figure element. The chart’s value (for interactions), scale and legend method are then added as properties. Plot then returns the chart.

## Rendering marks

To render a mark, Plot calls its **render** method, and inserts and positions the returned SVG element (if any) in the chart SVG.

The render method receives five arguments:

* *index*: the index of data to draw
* *scales*: the scale functions and descriptors
* *values*: the scaled and raw channels
* *dimensions*: the dimensions of the facet
* *context*: the context

The render method must return a single SVG node—or a nullish value if there is no output. For a typical mark, like dot, it might return a [G element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g), with common properties reflecting, say, a constant stroke or fill color; this group will have children [circle](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle) elements for each data point, with individual properties reflecting, say, a variable radius.

You can override or extend this method by specifying a function as the mark’s **render** option. In that case, Plot calls it with the mark as *this* and, in addition to the five arguments listed above, a sixth argument:

* *next*: the next render method in the chain

The first argument, *index*, is an array of indices representing the points to be drawn in the current facet (if the mark is faceted), with invalid values filtered out by the mark’s **filter** method.

The *scales* object contains the scale functions, indexed by name, and an additional scales property with the scale descriptors, also indexed by name.

For example, the following code will log the color associated with the Torgersen category ("#e15759") and the [instantiated color scale object](./plots.md#plot_scale); as it returns undefined, it will not render anything to the chart.

```js
Plot.dot(penguins, {
  x: "culmen_length_mm",
  y: "culmen_depth_mm",
  fill: "island",
  render(index, scales) {
    console.log(scales.color("Torgersen")); // "#e15759"
    console.log(scales.scales.color); // {type: "ordinal", …}
  }
}).plot()
```

The *values* object contains the scaled channels, indexed by name, and an additional channels property with the unscaled channels, also indexed by name. For example:

```js
Plot.dot(penguins, {
  x: "culmen_length_mm",
  y: "culmen_depth_mm",
  fx: "species",
  fill: "island",
  render(index, scales, values) {
    const i = index[0];
    console.log(i, values.fill[i], values.channels.fill.value[i]);
  }
}).plot()
```

will output the following three lines to the console, with each line containing the index of the first penguin in the current facet, its fill color, and the underlying (unscaled) category:

```js
0 '#e15759' 'Torgersen'
152 '#f28e2c' 'Dream'
220 '#4e79a7' 'Biscoe'
```

The *dimensions* object contains the marginTop, marginRight, marginLeft,marginBottom, and width and height of the chart. For example, to draw an ellipse that extends to the edges:

```js
Plot.plot({
  marks: [
    function (index, scales, values, dimensions, context) {
      const e = context.document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
      e.setAttribute("rx", (dimensions.width - dimensions.marginLeft - dimensions.marginRight) / 2);
      e.setAttribute("ry", (dimensions.height - dimensions.marginTop - dimensions.marginBottom) / 2);
      e.setAttribute("cx", (dimensions.width + dimensions.marginLeft - dimensions.marginRight) / 2);
      e.setAttribute("cy", (dimensions.height + dimensions.marginTop - dimensions.marginBottom) / 2);
      e.setAttribute("fill", "red");
      return e;
    }
  ]
})
```

The *context* contains several useful globals:
* document - the [document object](https://developer.mozilla.org/en-US/docs/Web/API/Document)
* ownerSVGElement - the chart’s bare svg element
* className - the [class name](./plots.md#other-options) of the chart (*e.g.*, "plot-d6a7b5")
* clip - the top-level [clip](./plots.md#other-options) option (to use when the mark’s clip option is undefined)
* projection - the [projection](./projections.md) stream, if any
* dispatchValue - sets the chart’s value and dispatches an input event if the value has changed; useful for interactive marks
* getMarkState - read a mark’s index and channels
* filterFacets - compute the facets for arbitrary data (for use in an [initializer](#re-initializing-marks))

:::tip
When you write a custom mark, use *context*.document to allow your code to run in different environments, such as a server-side rendering with jsdom.
:::

The sixth argument, *next*, is a function that can be called to continue the render chain. For example, if you wish to animate a mark to fade in, you can set the render option to a function that calls next to render the mark as usual, then immediately sets its opacity to 0, and brings it to life with a [D3 transition](https://d3js.org/d3-transition):

```js
Plot.dot(penguins, {
  x: "culmen_length_mm",
  y: "culmen_depth_mm",
  fill: "island",
  render(index, scales, values, dimensions, context, next) {
    const g = next(index, scales, values, dimensions, context);
    d3.select(g)
      .selectAll("circle")
        .style("opacity", 0)
      .transition()
      .delay(() => Math.random() * 5000)
        .style("opacity", 1);
    return g;
  }
}).plot()
```

:::info
Note that Plot’s marks usually set the attributes of the nodes. As styles have precedence over attributes, it is much simpler to customize the output with [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS), when possible, than with a custom render function.
:::

In this chart, we render the dots one by one:
```js
Plot.dot(penguins, {
  x: "culmen_length_mm",
  y: "culmen_depth_mm",
  fill: "island",
  render(index, scales, values, dimensions, context, next) {
    let node = next(index, scales, values, dimensions, context);
    let k = 0;
    requestAnimationFrame(function draw() {
      const newNode = next(index.slice(0, ++k), scales, values, dimensions, context);
      node.replaceWith(newNode);
      node = newNode;
      if (node.isConnected && k < index.length) {
        requestAnimationFrame(draw);
      }
    });
    return node;
  }
}).plot()
```

:::tip
If you have any question about this documentation, please open a [GitHub discussion](https://github.com/observablehq/framework/discussions/categories/q-a).
:::