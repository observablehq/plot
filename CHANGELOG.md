# Observable Plot - Changelog

## 0.2.0

*Not yet released.* These notes are a work in progress.

[breaking] Plot is now published as an ES module.

[breaking] Plot now depends on D3 7 or higher.

[breaking] Plot now requires Node 12 or higher.

### Marks

The Plot.marks function provides *mark*.plot shorthand for array marks.

The plot *marks* option now accepts render functions and nullish values as shorthand mark definitions. Nullish marks produce no output and are useful for conditional display (equivalent to the empty array).

Marks now support more style options, including shapeRendering.

Marks now support fill and stroke defaults more consistently.

Marks now filter undefined values more consistently.

Marks now handle collapsed domains.

The link mark now supports shorthand for one-dimensional links.

The rect mark now supports one-dimensional (and zero-dimensional) rects: the *x1*, *x2*, *y1* and *y2* channels are now optional.

The text mark now uses attributes instead of styles for font rendering properties, improving compatibility with Firefox.

### Scales

New diverging scale types: *diverging-sqrt*, *diverging-pow*, *diverging-log*, *diverging-symlog*.

New *quantile* scale type.

New *threshold* scale type.

The axis *line* option can be used to show a line along the *x* or *y* axis.

### Facets

When the facet *data* is null, a better error message is thrown.

The mark *facet* option can be used to control whether a mark is faceted. The new *exclude* facet mode shows all data that are *not* present in the current facet.

### Transforms

The *outputs* argument to the bin transforms is now optional. It defaults to the *count* reducer for *y*, *x* and *fill* for Plot.binX, Plot.binY, and Plot.bin respectively. TODO Should the group transforms have similar default outputs?

The bin and group transforms now support *filter*, *sort* and *reverse* options on the *outputs* object.

The bin and group transforms now support the *distinct* and *mode* reducers.

The bin and group transforms now propagate *z*, *fill*, and *stroke* channel values correctly on empty bins when the this channel is used for grouping.

The default *thresholds* option for the bin transforms is now *auto* instead of *scott*, and applies a maximum limit of 200 bins to Scott’s rule.

The normalize, window, and stack transforms can now accept a transform *options* argument in addition to an *inputs* argument that specifies the input channels. This allows makes these transforms more consistent with the other transforms, reduces ambiguity, and allows for additional shorthand.

The select transforms now throw better error messages when required input channels are missing.

The stack *offset* options have been renamed: *normalize* and *center* replace *expand* and *silhouette*, respectively. The old names are supported for backwards compatibility.

The window *shift* option has been renamed to *anchor*. The *centered*, *leading*, and *trailing* shifts and replaced with *middle*, *start*, and *end* respectively. The old *shift* option is supported for backwards compatibility.

The basic transforms are now available as explicit option transforms: Plot.filter, Plot.sort, and Plot.reverse. These are useful when you wish to control the order of these transforms with respect to other transforms such as Plot.bin and Plot.stack.

When mark *transform* option is null, it is considered equivalent to undefined and no transform is applied instead of throwing an error.

## 0.1.0

Released May 3, 2021.
