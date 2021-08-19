# Observable Plot - Changelog

## 0.2.0

*Not yet released.* These notes are a work in progress.

[breaking] Plot is now published as an ES module.

[breaking] Plot now depends on D3 7 or higher.

[breaking] Plot now requires Node 12 or higher.

### Marks

The [*marks* option](https://github.com/observablehq/plot/blob/main/README.md#mark-options) now accepts render functions, null, and undefined as shorthand mark definitions. Nullish marks produce no output and are useful for conditional display (equivalent to the empty array). Render functions are invoked when plotting and may return an SVG element to insert into the plot, such as a legend or annotation.

The [Plot.marks(...*marks*)](https://github.com/observablehq/plot/blob/main/README.md#plotmarksmarks) function provides [*mark*.plot](https://github.com/observablehq/plot/blob/main/README.md#plotplotoptions) shorthand for array marks. This is useful for composite marks, such as [boxes](https://github.com/observablehq/plot/blob/8fef4fa52a4cca4135f5f964e3c328ef8f18f672/test/plots/morley-boxplot.js#L18-L23).

If its fill is not *none*, a line’s default stroke is now *none* rather than *currentColor*, making it consistent with dot and other marks.

All marks now support the [shapeRendering option](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering). (This is a constant option; it may not vary across marks.) All marks now allow strokeWidth to be specified as a channel. Text marks now also allow stroke and strokeOpacity to be specified as channels.

When a fill or fillOpacity channel is used with a link, or when a stroke or strokeOpacity channel is used with a rule, undefined values will now be filtered.

Marks that represent continuous intervals (rect, bar, and rule) now handle collapsed domains during rendering. A domain is considered collapsed when it contains only a single value. For example, a collapsed domain can occur when all input values to the bin transform are equal (*e.g.*, [1, 1, 1, …] produces a domain of [1, 1]). Previously a collapsed domain would result in an invisible zero-width mark; now the mark spans the full extent of the chart.

The link mark now supports *x* or *y* shorthand for one-dimensional links, equivalent to rule. The rect mark now supports one-dimensional (and zero-dimensional) rects: the *x1*, *x2*, *y1* and *y2* channels are now optional.

The text mark now uses attributes instead of styles for font rendering properties, improving compatibility with Firefox.

### Scales

The new [*sort* options](https://github.com/observablehq/plot/blob/main/README.md#sort-options) allow more convenient control over the order of ordinal domains, including the *fx* and *fy* facet domains. The sort options use the same aggregation methods as the group and bin transform, via the *reduce* option, defaulting to *max*. The *reverse* and *limit* options are also supported. For example, a bar chart can be sorted by descending value like so:

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", reverse: true}})
```

Color scales now support the *threshold* scale type, which allows you to specify a set of *n* - 1 discrete (typically numeric) thresholds to produce *n* discrete colors. The new *quantile* scale type will automatically compute *n* - 1 thresholds for *n* quantiles based on the data.

Diverging color scales now support transformations via four new scale types: *diverging-sqrt*, *diverging-pow*, *diverging-log*, and *diverging-symlog*. These correspond to the *sqrt*, *pow*, *log*, and *symlog* scale types. Diverging scales now support a *symmetric* option, which defaults to true, to ensure that differences above and below the pivot are equally apparent. (This assumes that the diverging scale’s interpolator is similarly symmetric; this is true of all the built-in diverging color schemes from ColorBrewer.)

The new axis *line* option, which defaults to false, can be used to show a continuous line along the *x* or *y* axis. Using a rule to annotate a meaningful value, such as zero, is generally preferred over the *line* option.

### Facets

When the facet *data* is null, a better error message is thrown.

The mark *facet* option can be used to control whether a mark is faceted. The new *exclude* facet mode shows all data that are *not* present in the current facet.

### Transforms

The *outputs* argument to the bin transforms is now optional. It defaults to the *count* reducer for *y*, *x* and *fill* for Plot.binX, Plot.binY, and Plot.bin respectively. TODO Should the group transforms have similar default outputs?

The bin and group transforms now support *filter*, *sort* and *reverse* options on the *outputs* object. One use case is to return empty bins (which are filtered out by default), when we want to render missing days in a temporal line chart as holes or zeroes, rather than interpolating across them. The *z*, *fill* or *stroke* channels, when used for grouping, are also propagated.

The bin and group transforms now support the *distinct* and *mode* reducers.

The default *thresholds* option for the bin transforms is now *auto* instead of *scott*, and applies a maximum limit of 200 bins to Scott’s rule. This avoids vanishing bars when they are too numerous and thin to be visible.

The normalize, window, and stack transforms can now accept a transform *options* argument in addition to an *inputs* argument that specifies the input channels. This allows makes these transforms more consistent with the other transforms, reduces ambiguity, and allows for additional shorthand.

The select transforms now throw better error messages when required input channels are missing.

The stack *offset* options have been renamed: *normalize* and *center* replace *expand* and *silhouette*, respectively. The old names are supported for backwards compatibility.

The window *shift* option has been renamed to *anchor*. The *centered*, *leading*, and *trailing* shifts and replaced with *middle*, *start*, and *end* respectively. The old *shift* option is supported for backwards compatibility.

The basic transforms are now available as explicit option transforms: Plot.filter, Plot.sort, and Plot.reverse. These are useful when you wish to control the order of these transforms with respect to other transforms such as Plot.bin and Plot.stack.

When mark *transform* option is null, it is considered equivalent to undefined and no transform is applied instead of throwing an error.

## 0.1.0

Released May 3, 2021.
