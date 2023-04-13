# Mark options

[Marks](https://observablehq.com/@observablehq/plot-marks) visualize data as geometric shapes such as bars, dots, and lines. An single mark can generate multiple shapes: for example, passing a [Plot.barY](#plotbarydata-options) to [Plot.plot](#plotplotoptions) will produce a bar for each element in the associated data. Multiple marks can be layered into [plots](#plotplotoptions).

Mark constructors take two arguments: **data** and **options**. Together these describe a tabular dataset and how to visualize it. Option values that must be the same for all of a mark’s generated shapes are known as *constants*, whereas option values that may vary across a mark’s generated shapes are known as *channels*. Channels are typically bound to [scales](#scale-options) and encode abstract data values, such as time or temperature, as visual values, such as position or color. (Channels can also be used to order ordinal domains; see [sort options](#sort-options).)

A mark’s data is most commonly an array of objects representing a tabular dataset, such as the result of loading a CSV file, while a mark’s options bind channels (such as *x* and *y*) to columns in the data (such as *units* and *fruit*).

```js
sales = [
  {units: 10, fruit: "peach"},
  {units: 20, fruit: "pear"},
  {units: 40, fruit: "plum"},
  {units: 30, fruit: "plum"}
]
```
```js
Plot.dot(sales, {x: "units", y: "fruit"}).plot()
```

While a column name such as `"units"` is the most concise way of specifying channel values, values can also be specified as functions for greater flexibility, say to transform data or derive a new column on the fly. Channel functions are invoked for each datum (*d*) in the data and return the corresponding channel value. (This is similar to how D3’s [*selection*.attr](https://github.com/d3/d3-selection/blob/main/README.md#selection_attr) accepts functions, though note that Plot channel functions should return abstract values, not visual values.)

```js
Plot.dot(sales, {x: d => d.units * 1000, y: d => d.fruit}).plot()
```

Plot also supports columnar data for greater efficiency with bigger datasets; for example, data can be specified as any array of the appropriate length (or any iterable or value compatible with [Array.from](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)), and then separate arrays of values can be passed as *options*.

```js
index = [0, 1, 2, 3]
```
```js
units = [10, 20, 40, 30]
```
```js
fruits = ["peach", "pear", "plum", "plum"]
```
```js
Plot.dot(index, {x: units, y: fruits}).plot()
```

Channel values can also be specified as numbers for constant values, say for a fixed baseline with an [area](#area).

```js
Plot.area(aapl, {x1: "Date", y1: 0, y2: "Close"}).plot()
```

Missing and invalid data are handled specifically for each mark type and channel. In most cases, if the provided channel value for a given datum is null, undefined, or (strictly) NaN, the mark will implicitly filter the datum and not generate a corresponding output. In some cases, such as the radius (*r*) of a dot, the channel value must additionally be positive. Plot.line and Plot.area will stop the path before any invalid point and start again at the next valid point, thus creating interruptions rather than interpolating between valid points. Titles will only be added if they are non-empty.

All marks support the following style options:

* **fill** - fill color
* **fillOpacity** - fill opacity (a number between 0 and 1)
* **stroke** - stroke color
* **strokeWidth** - stroke width (in pixels)
* **strokeOpacity** - stroke opacity (a number between 0 and 1)
* **strokeLinejoin** - how to join lines (*bevel*, *miter*, *miter-clip*, or *round*)
* **strokeLinecap** - how to cap lines (*butt*, *round*, or *square*)
* **strokeMiterlimit** - to limit the length of *miter* joins
* **strokeDasharray** - a comma-separated list of dash lengths (typically in pixels)
* **strokeDashoffset** - the [stroke dash offset](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset) (typically in pixels)
* **opacity** - object opacity (a number between 0 and 1)
* **mixBlendMode** - the [blend mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode) (*e.g.*, *multiply*)
* **shapeRendering** - the [shape-rendering mode](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering) (*e.g.*, *crispEdges*)
* **paintOrder** - the [paint order](https://developer.mozilla.org/en-US/docs/Web/CSS/paint-order) (*e.g.*, *stroke*)
* **dx** - horizontal offset (in pixels; defaults to 0)
* **dy** - vertical offset (in pixels; defaults to 0)
* **target** - link target (e.g., “_blank” for a new window); for use with the **href** channel
* **ariaDescription** - a textual description of the mark’s contents
* **ariaHidden** - if true, hide this content from the accessibility tree
* **pointerEvents** - the [pointer events](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events) (*e.g.*, *none*)
* **clip** - whether and how to clip the mark

If the **clip** option is *frame* (or equivalently true), the mark is clipped to the frame’s dimensions; if the **clip** option is null (or equivalently false), the mark is not clipped. If the **clip** option is *sphere*, then a [geographic projection](#projection-options) is required and the mark will be clipped to the projected sphere (_e.g._, the front hemisphere when using the orthographic projection).

For all marks except [text](#plottextdata-options), the **dx** and **dy** options are rendered as a transform property, possibly including a 0.5px offset on low-density screens.

All marks support the following optional channels:

* **fill** - a fill color; bound to the *color* scale
* **fillOpacity** - a fill opacity; bound to the *opacity* scale
* **stroke** - a stroke color; bound to the *color* scale
* **strokeOpacity** - a stroke opacity; bound to the *opacity* scale
* **strokeWidth** - a stroke width (in pixels)
* **opacity** - an object opacity; bound to the *opacity* scale
* **title** - an accessible, short-text description (a string of text, possibly with newlines)
* **href** - a URL to link to
* **ariaLabel** - a short label representing the value in the accessibility tree

The **fill**, **fillOpacity**, **stroke**, **strokeWidth**, **strokeOpacity**, and **opacity** options can be specified as either channels or constants. When the fill or stroke is specified as a function or array, it is interpreted as a channel; when the fill or stroke is specified as a string, it is interpreted as a constant if a valid CSS color and otherwise it is interpreted as a column name for a channel. Similarly when the fill opacity, stroke opacity, object opacity, stroke width, or radius is specified as a number, it is interpreted as a constant; otherwise it is interpreted as a channel.

The scale associated with any channel can be overridden by specifying the channel as an object with a *value* property specifying the channel values and a *scale* property specifying the desired scale name or null for an unscaled channel. For example, to force the **stroke** channel to be unscaled, interpreting the associated values as literal color strings:

```js
Plot.dot(data, {stroke: {value: "fieldName", scale: null}})
```

To instead force the **stroke** channel to be bound to the *color* scale regardless of the provided values, say:

```js
Plot.dot(data, {stroke: {value: "fieldName", scale: "color"}})
```

The color channels (**fill** and **stroke**) are bound to the *color* scale by default, unless the provided values are all valid CSS color strings or nullish, in which case the values are interpreted literally and unscaled.

In addition to functions of data, arrays, and column names, channel values can be specified as an object with a *transform* method; this transform method is passed the mark’s array of data and must return the corresponding array of channel values. (Whereas a channel value specified as a function is invoked repeatedly for each element in the mark’s data, similar to *array*.map, the transform method is invoked only once being passed the entire array of data.) For example, to pass the mark’s data directly to the **x** channel, equivalent to [Plot.identity](#plotidentity):

```js
Plot.dot(numbers, {x: {transform: data => data}})
```

The **title**, **href**, and **ariaLabel** options can *only* be specified as channels. When these options are specified as a string, the string refers to the name of a column in the mark’s associated data. If you’d like every instance of a particular mark to have the same value, specify the option as a function that returns the desired value, *e.g.* `() => "Hello, world!"`.

The rectangular marks ([bar](#bar), [cell](#cell), [frame](#frame), and [rect](#rect)) support insets and rounded corner constant options:

* **insetTop** - inset the top edge
* **insetRight** - inset the right edge
* **insetBottom** - inset the bottom edge
* **insetLeft** - inset the left edge
* **rx** - the [*x* radius](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx) for rounded corners
* **ry** - the [*y* radius](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/ry) for rounded corners

Insets are specified in pixels. Corner radii are specified in either pixels or percentages (strings). Both default to zero. Insets are typically used to ensure a one-pixel gap between adjacent bars; note that the [bin transform](#bin) provides default insets, and that the [band scale padding](#position-options) defaults to 0.1, which also provides separation.

For marks that support the <a name="frameanchor">**frameAnchor**</a> option, it may be specified as one of the four sides (*top*, *right*, *bottom*, *left*), one of the four corners (*top-left*, *top-right*, *bottom-right*, *bottom-left*), or the *middle* of the frame.

#### Plot.marks(...*marks*)

A convenience method for composing a mark from a series of other marks. Returns an array of marks that implements the *mark*.plot function. See the [box mark implementation](./src/marks/box.js) for an example.
