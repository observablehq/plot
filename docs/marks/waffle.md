# Waffle mark

TODO

## Waffle options

For required channels, see the [bar mark](./bar.md). The waffle mark supports the [standard mark options](../features/marks.md). It does not support [insets](../features/marks.md#insets), [rounded corners](../features/marks.md#rounded-corners), or **stroke**. The **fill** defaults to *currentColor*.

## waffleY(*data*, *options*) {#waffleY}

```js
Plot.waffleY(olympians, Plot.groupX({y: "count"}, {x: "sport"}))
```

Returns a new vertical↑ waffle with the given *data* and *options*. The following channels are required:

* **y1** - the starting vertical position; bound to the *y* scale
* **y2** - the ending vertical position; bound to the *y* scale

The following optional channels are supported:

* **x** - the horizontal position; bound to the *x* scale, which must be *band*

If neither the **y1** nor **y2** option is specified, the **y** option may be specified as shorthand to apply an implicit [stackY transform](../transforms/stack.md); this is the typical configuration for a vertical waffle chart with columns aligned at *y* = 0. If the **y** option is not specified, it defaults to [identity](../features/transforms.md#identity). If *options* is undefined, then it defaults to **y2** as identity and **x** as the zero-based index [0, 1, 2, …]; this allows an array of numbers to be passed to waffleY to make a quick sequential waffle chart. If the **x** channel is not specified, the column will span the full horizontal extent of the plot (or facet).

If an **interval** is specified, such as d3.utcDay, **y1** and **y2** can be derived from **y**: *interval*.floor(*y*) is invoked for each *y* to produce *y1*, and *interval*.offset(*y1*) is invoked for each *y1* to produce *y2*. If the interval is specified as a number *n*, *y1* and *y2* are taken as the two consecutive multiples of *n* that bracket *y*. Named UTC intervals such as *day* are also supported; see [scale options](../features/scales.md#scale-options).
