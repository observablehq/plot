<script setup>

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import bls from "../data/bls.ts";

</script>

# Transforms

:::danger TODO
This guide is still under construction. 🚧 Please come back when it’s finished.
:::

Transforms provide a convenient mechanism for deriving data while plotting. All marks support the following basic transforms:

* [filter](../transforms/filter.md)
* [sort](../transforms/sort.md)
* [reverse](../transforms/sort.md#plotreverseoptions)

The basic transforms are composable: the *filter* transform is applied first, then *sort*, *reverse*, and lastly the custom *transform*, if any.

For greater control, you can also implement a custom **transform** function. This function takes *data* and *facets* as arguments and returns the same, where *data* is the associated mark’s data and *facets* is an array of indexes into that data. If the mark is not faceted, then *facets* will contain a single facet representing the entire data: [0, 1, … *data*.length - 1].

:::plot
```js{16-23}
Plot.plot({
  y: {
    grid: true,
    label: "↑ Unemployment (%)"
  },
  color: {
    domain: [false, true],
    range: ["#ccc", "red"]
  },
  marks: [
    Plot.ruleY([0]),
    Plot.line(bls, {
      x: "date",
      y: "unemployment",
      z: "division",
      transform: (data, facets) => ({
        data,
        facets: facets.map((facet) => {
          return facet.filter((i) => {
            return /, MI /.test(data[i].division);
          });
        })
      })
    })
  ]
})
```
:::

Plot’s option transforms, listed below, do more than populate the **transform** function: they derive new mark options and channels. These transforms take a mark’s *options* object (and possibly transform-specific options as the first argument) and return a new, transformed, *options*. Option transforms are composable: you can pass an *options* objects through more than one transform before passing it to a mark. You can also reuse the same transformed *options* on multiple marks.

Plot’s built-in options transforms are:

* [group](../transforms/group.md) - group ordinal data and derive summary statistics, *e.g.* counts
* [bin](../transforms/bin.md) - bin quantitative data and derive summary statistics, *e.g.* counts
* [stack](../transforms/stack.md) - stack series, *e.g.* convert *y* to *y1* and *y2*
* [map](../transforms/map.md) - map values per series, *e.g.* for a cumulative sum
* [window](../transforms/window.md) - map values per windowed series, *e.g.* for a rolling average
* [select](../transforms/select.md) - extract a value per series, *e.g.* the last value
* [interval](../transforms/interval.md) - convert a single value to an interval [start, stop]
* [dodge](../transforms/dodge.md) - lift points from a one-dimensional layout to prevent occlusion
* [hexbin](../transforms/hexbin.md) - aggregate two-dimensional points into discrete hexagonal bins

When working with custom transforms, keep in mind that every transform needs to be compatible with the faceting system, which partitions the original dataset into discrete subsets.

## Transform options

Plot’s transforms provide a convenient mechanism for transforming data as part of a plot specification. All marks support the following basic transforms:

* **filter** - filters data according to the specified accessor or values
* **sort** - sorts data according to the specified comparator, accessor, or values
* **reverse** - reverses the sorted (or if not sorted, the input) data order

For example, to draw bars only for letters that commonly form vowels:

```js
Plot.barY(alphabet, {filter: d => /[aeiou]/i.test(d.letter), x: "letter", y: "frequency"})
```

The **filter** transform is similar to filtering the data with [*array*.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), except that it will preserve [faceting](./facets.md) and will not affect inferred [scale domains](./scales.md); domains are inferred from the unfiltered channel values.

```js
Plot.barY(alphabet.filter(d => /[aeiou]/i.test(d.letter)), {x: "letter", y: "frequency"})
```

Together the **sort** and **reverse** transforms allow control over *z* order, which can be important when addressing overplotting. If the sort option is a function but does not take exactly one argument, it is assumed to be a [comparator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description); otherwise, the sort option is interpreted as a channel value definition and thus may be either as a column name, accessor function, or array of values.

The sort transform can also be used to sort on channel values, including those derived by [initializers](#initializers). For example, to sort dots by descending radius:

```js
Plot.dot(earthquakes, {x: "longitude", y: "latitude", r: "intensity", sort: {channel: "r", order: "descending}})
```

In fact, sorting by descending radius is the default behavior of the dot mark when an *r* channel is specified. You can disable this by setting the sort explicitly to null:

```js
Plot.dot(earthquakes, {x: "longitude", y: "latitude", r: "intensity", sort: null})
```

For greater control, you can also implement a [custom transform function](#custom-transforms):

* **transform** - a function that returns transformed *data* and *index*

The basic transforms are composable: the *filter* transform is applied first, then *sort*, then *reverse*. If a custom *transform* option is specified directly, it supersedes any basic transforms (*i.e.*, the *filter*, *sort* and *reverse* options are ignored). However, the *transform* option is rarely used directly; instead an option transform is used. These option transforms automatically compose with the basic *filter*, *sort* and *reverse* transforms.

Plot’s option transforms, listed below, do more than populate the **transform** function: they derive new mark options and channels. These transforms take a mark’s *options* object (and possibly transform-specific options as the first argument) and return a new, transformed, *options*. Option transforms are composable: you can pass an *options* objects through more than one transform before passing it to a mark. You can also reuse the same transformed *options* on multiple marks.

The *filter*, *sort* and *reverse* transforms are also available as functions, allowing the order of operations to be specified explicitly. For example, sorting before binning results in sorted data inside bins, whereas sorting after binning results affects the *z* order of rendered marks.

# transforms

The **transform** option defines a custom transform function, allowing data, indexes, or channels to be derived prior to rendering. Custom transforms are rarely implemented directly; see the built-in transforms above. The transform function (if present) is passed two arguments, *data* and *facets*, representing the mark’s data and facet indexes; it must then return a {data, facets} object representing the resulting transformed data and facet indexes. The *facets* are represented as a nested array of arrays such as [[0, 1, 3, …], [2, 5, 10, …], …]; each element in *facets* specifies the zero-based indexes of elements in *data* that are in a given facet (*i.e.*, have a distinct value in the associated *fx* or *fy* dimension).

While transform functions often produce new *data* or *facets*, they may return the passed-in *data* and *facets* as-is, and often have a side-effect of constructing derived channels. For example, the count of elements in a [groupX transform](../transforms/group.md) might be returned as a new *y* channel. In this case, the transform is typically expressed as an options transform: a function that takes a mark options object and returns a new, transformed options object, where the returned options object implements a *transform* function option. Transform functions should not mutate the input *data* or *facets*. Likewise options transforms should not mutate the input *options* object.

Plot provides a few helpers for implementing transforms.

## valueof(*data*, *value*, *type*)

Given an iterable *data* and some *value* accessor, returns an array (a column) of the specified *type* with the corresponding value of each element of the data. The *value* accessor may be one of the following types:

* a string - corresponding to the field accessor (`d => d[value]`)
* an accessor function - called as *type*.from(*data*, *value*)
* a number, Date, or boolean — resulting in an array uniformly filled with the *value*
* an object with a transform method — called as *value*.transform(*data*)
* an array of values - returning the same
* null or undefined - returning the same

If *type* is specified, it must be Array or a similar class that implements the [Array.from](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from) interface such as a typed array. When *type* is Array or a typed array class, the return value of valueof will be an instance of the same (or null or undefined). When *type* is a typed array, values will be implicitly coerced numbers, and if *type* is Float64Array, Float32Array, or a subclass of the same, null values will be implicitly replaced with NaN. If *type* is not specified, valueof may return either an array or a typed array (or null or undefined).

Plot.valueof is not guaranteed to return a new array. When a transform method is used, or when the given *value* is an array that is compatible with the requested *type*, the array may be returned as-is without making a copy.

## transform(*options*, *transform*)

Given an *options* object that may specify some basic transforms (*filter*, *sort*, or *reverse*) or a custom *transform* function, composes those transforms if any with the given *transform* function, returning a new *options* object. If a custom *transform* function is present on the given *options*, any basic transforms are ignored. Any additional input *options* are passed through in the returned *options* object. This method facilitates applying the basic transforms prior to applying the given custom *transform* and is used internally by Plot’s built-in transforms.

## column(*source*)

This helper for constructing derived columns returns a [*column*, *setColumn*] array. The *column* object implements *column*.transform, returning whatever value was most recently passed to *setColumn*. If *setColumn* is not called, then *column*.transform returns undefined. If a *source* is specified, then *column*.label exposes the given *source*’s label, if any: if *source* is a string as when representing a named field of data, then *column*.label is *source*; otherwise *column*.label propagates *source*.label. This allows derived columns to propagate a human-readable axis or legend label.

Plot.column is typically used by options transforms to define new channels; the associated columns are populated (derived) when the **transform** option function is invoked.

## identity

This channel helper returns a source array as-is, avoiding an extra copy when defining a channel as being equal to the data:

```js
Plot.raster(await readValues(), {width: 300, height: 200, fill: Plot.identity})
```

## Initializers

Initializers can be used to transform and derive new channels prior to rendering. Unlike transforms which operate in abstract data space, initializers can operate in screen space such as pixel coordinates and colors. For example, initializers can modify a marks’ positions to avoid occlusion. Initializers are invoked *after* the initial scales are constructed and can modify the channels or derive new channels; these in turn may (or may not, as desired) be passed to scales.

You can specify a custom initializer by specifying a function as the mark **initializer** option. This function is called after the scales have been computed, and receives as inputs the (possibly transformed) array of *data*, the *facets* index of elements of this array that belong to each facet, the input *channels* (as an object of named channels), the *scales*, and the *dimensions*. The mark itself is the *this* context. The initializer function must return an object with *data*, *facets*, and new *channels*. Any new channels are merged with existing channels, replacing channels of the same name.

If an initializer desires a channel that is not supported by the downstream mark, additional channels can be declared using the mark **channels** option.

## initializer(*options*, *initializer*)

This helper composes the *initializer* function with any other transforms present in the *options*, and returns a new *options* object.
