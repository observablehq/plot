# Auto mark

The special **auto** mark automatically selects a mark type that best represents the given dimensions of the data according to some simple heuristics. For example, two quantitative dimensions make a scatterplot:

```js
Plot.auto(penguins, {x: "body_mass_g", y: "flipper_length_mm"}).plot()
```

While Plot.auto will respect the options you provide, you shouldn’t rely on its behavior being stable over time; if you want to guarantee a specific chart type, you should specify the marks and transforms explicitly (like Plot.dot or Plot.bin). Plot.auto is intended to support fast exploratory analysis where the goal is to get a useful plot as quickly as possible.

A monotonically increasing dimension (here *Date*, as the data is ordered chronologically), paired with a numeric column (*Close*), makes a line chart:

```js
Plot.auto(aapl, {x: "Date", y: "Close"}).plot()
```

Given only one dimension of data, it makes a histogram:

```js
Plot.auto(olympians, {x: "height"}).plot()
```

```js
Plot.auto(penguins, {x: "island"}).plot()
```

This is easier than deciding whether to use bin and rect, or group and bar: Plot.auto chooses the right one based on whether the data is quantitative or ordinal.

If you’d like to explicitly avoid grouping the data, you can opt out of the reducer, and get a one-dimensional plot:

```js
Plot.auto(penguins, {x: "body_mass_g", y: {reduce: null}}).plot()
```

As you can see from that _reduce_ property, the auto mark has some special syntax that lets you specify a reducer without explicitly specifying a transform. For example, the scatterplot above can be made into a heatmap by adding a color reducer. You can pass the name of a reducer to that property, or pass a shorthand string:

```js
Plot.auto(olympians, {x: "height", y: "weight", color: "count"}).plot()
```

That’s equivalent to this:

```js
Plot.rect(olympians, Plot.bin({fill: "count"}, {x: "height", y: "weight"})).plot()
```

Notice that the code above makes you think about nested functions and two different options objects, which Plot.auto flattens. Plot.auto infers that it should use a _rect_; that it should _bin_ on x and y; that the kind of color should be a _fill_; and that fill is an “output” of the reducer, whereas x and y are “inputs”.

This saves you a little bit of typing, but, more importantly, it means that switching from showing one dimension to another only involves changing _one thing_. In the code above, if you change y from “weight” to “sex”, it’ll break, because sex is ordinal instead of quantitative. (You’d also have to change rect to barX, and bin to binX.) With Plot.auto, it just works:

```js
Plot.auto(olympians, {x: "height", y: "sex", color: "count"}).plot()
```

Similarly, with explicit marks and transforms, changing a vertical histogram to a horizontal histogram involves switching rectY to rectX, binX to binY, x to y, and y to x. With Plot.auto, just specify y instead of x:

```js
Plot.auto(penguins, {y: "island"}).plot()
```

For the sake of seamless switching, Plot.auto has just one color channel, which it assigns to either fill or stroke depending on the mark. We can see that clearly by overriding a line chart with the _mark_ property to make an area chart:

```js
Plot.auto(industries, {x: "date", y: "unemployed", color: "industry"}).plot()
```

```js
Plot.auto(industries, {x: "date", y: "unemployed", color: "industry", mark: "area"}).plot()
```

The _mark_ override option supports dot, line, area, rule, and bar (which automatically chooses among barX, barY, rectX, rectY, rect, and cell).

You can get a more elaborate aggregated chart by passing an object with both a _value_ (the input dimension) and a _reduce_ (the reducer). For example, here’s the average heights of Olympians over time by sex:

```js
Plot
  .auto(olympians, {x: "date_of_birth", y: {value: "height", reduce: "mean"}, color: "sex", mark: "line"})
  .plot({color: {legend: true}})
```

The reducer can be first, last, count, distinct, sum, proportion, proportion-facet, deviation, min, min-index, max, max-index, mean, median, variance, or mode.

You can similarly pass a *zero* option to indicate that zero is meaningful for either _x_ or _y_. This adds a corresponding rule to the returned mark.

```js
Plot.auto(industries, {x: "date", y: {value: "unemployed", zero: true}, color: "industry"}).plot()
```

Finally, Plot.auto has a _size_ channel, which (currently) always results in a dot mark. For now, it’s an alias for the dot’s _r_ channel; in the future it will also represent a vector’s _length_ channel.

```js
Plot.auto(aapl, {x: "Date", y: "Close", size: "Volume"}).plot()
```

Finally, like with any other mark, you can also use _fx_ or _fy_, and pass additional global options in the plot method.

```js
Plot.auto(penguins, {
  x: "body_mass_g",
  y: "culmen_length_mm",
  fx: "island",
  fy: "species"
}).plot({
  x: {label: "Body mass →", ticks: 5},
  y: {label: "↑ Culmen length (mm)"},
  marginRight: 70
})
```

You could combine the auto mark with other marks, but the combination may be brittle, because Plot.auto may pick encodings that don’t play well with the others.

Plot.auto is supposed to be fast and fluid, so don’t overthink it. If you need precise control, use the explicit marks.

## Options

Automatically selects a mark type that best represents the dimensions of the given data according to some simple heuristics. Plot.auto seeks to provide a useful initial plot as quickly as possible through opinionated defaults, and to accelerate exploratory analysis by letting you refine views with minimal changes to code. For example,

```js
Plot.auto(olympians, {x: "height", y: "weight"}).plot()
```

makes a scatterplot (equivalent to [dot](#dot));

```js
Plot.auto(aapl, {x: "Date", y: "Close"}).plot()
```

makes a line chart (equivalent to [lineY](#line); chosen because the selected *x* dimension *Date* is temporal and monotonic, _i.e._, the data is in chronological order);

```js
Plot.auto(penguins, {x: "body_mass_g"}).plot()
```

makes a histogram (equivalent to [rectY](#rect) and [binX](#bin); chosen because the _body_mass_g_ column is quantitative);

```js
Plot.auto(penguins, {x: "island"}).plot()
```

makes a bar chart (equivalent to [barY](#bar) and [groupX](#group); chosen because the _island_ column is categorical). Note that Plot.auto returns a [mark](#marks); to then generate a plot (SVG), call [*mark*.plot](#markplotoptions) on the returned mark as shown above. This allows passing plot options, such as to set the chart dimensions or to override a scale type. You can also combine the auto mark with other marks—even other auto marks.

The auto mark supports a subset of the standard [mark options](#mark-options). You must provide at least one position channel:

* **x** - horizontal position
* **y** - vertical position

You may also provide one or more visual encoding channels:

* **color** - corresponds to _stroke_ or _fill_ (depending on the chosen mark type)
* **size** - corresponds to _r_ (and in future, possibly _length_)

And you may specify the standard mark-level facet channels:

* **fx** - horizontal facet position (column)
* **fy** - vertical facet position (row)

In addition to channel values, the **x**, **y**, **color**, and **size** options may specify reducers. Setting a reducer on **x** implicitly groups or bins on **y**, and likewise setting a reducer on **y** implicitly groups or bins on **x**. Setting a reducer on **color** or **size** groups or bins in both **x** and **y**. Setting a reducer on both **x** and **y** throws an error. To specify a reducer, simply pass the reducer name to the corresponding option. For example:

```js
Plot.auto(penguins, {x: "body_mass_g", y: "count"})
```

To pass both a value and a reducer, or to disambiguate whether the given string represents a field name or a reducer name, the **x**, **y**, **color**, and **size** options can also be specified as an object with separate **value** and **reduce** properties. For example, to compute the total weight of the penguins in each bin:

```js
Plot.auto(penguins, {x: "body_mass_g", y: {value: "body_mass_g", reduce: "sum"}})
```

If the **color** channel is specified as a string that is also a valid CSS color, it is interpreted as a constant color. For example, for red bars:

```js
Plot.auto(penguins, {x: "body_mass_g", color: "red"})
```

This is shorthand for:

```js
Plot.auto(penguins, {x: "body_mass_g", color: {color: "red"}})
```

To reference a field name instead as a variable color encoding, specify the **color** option as an object with a **value** property:

```js
Plot.auto(penguins, {x: "body_mass_g", color: {value: "red"}})
```

Alternatively, you can specify a function of data or an array of values, as with a standard mark channel.

The auto mark chooses the mark type automatically based on several simple heuristics. These heuristics are not explicitly documented and are likely to evolve over time; see the [source code](./src/marks/auto.js) for details. For more control, you can specify the desired mark type using the **mark** option, which supports the following names:

* *area* - [areaY](#plotareaydata-options) or [areaX](#plotareaxdata-options) (or sometimes [area](#plotareadata-options))
* *bar* - [barY](#plotbarydata-options) or [barX](#plotbarxdata-options); or [rectY](#plotrectydata-options), [rectX](#plotrectxdata-options), or [rect](#plotrectdata-options); or [cell](#plotcelldata-options)
* *dot* - [dot](#plotdotdata-options)
* *line* - [lineY](#plotlineydata-options) or [lineX](#plotlinexdata-options) (or sometimes [line](#plotlinedata-options))
* *rule* - [ruleY](#plotruleydata-options) or [ruleX](#plotrulexdata-options)

The chosen mark type depends both on the options you provide (*e.g.*, whether you specified **x** or **y** or both) and the inferred type of the corresponding data values (whether the associated dimension of data is quantitative, categorical, monotonic, *etc.*). While the auto mark will respect the options you provide, you shouldn’t rely on its behavior being stable over time; to guarantee a specific chart type, specify the marks and transforms explicitly.

## auto(*data*, *options*)

```js
Plot.auto(athletes, {x: "height", y: "weight", color: "count"}) // equivalent to rect + bin, say
```

Returns an automatically-chosen mark with the given *data* and *options*, suitable for a quick view of the data.
