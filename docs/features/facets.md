# Facet options

Plot’s [faceting system](https://observablehq.com/@observablehq/plot-facets) produces small multiples by partitioning data in discrete sets and repeating the plot for each set. When faceting, two additional band scales may be configured:

* *fx* - the horizontal position, a *band* scale
* *fy* - the vertical position, a *band* scale

Faceting may either be specified at the top level of the plot or on individual marks. When specified at the top level, the following options indicate which data should be faceted, and how:

* facet.**data** - the data to be faceted
* facet.**x** - the horizontal position; bound to the *fx* scale, which must be *band*
* facet.**y** - the vertical position; bound to the *fy* scale, which must be *band*

With top-level faceting, any mark that uses the specified facet data will be faceted by default, whereas marks that use different data will be repeated across all facets. (See the *mark*.**facet** option below for more). When specified at the mark level, facets can be defined for each mark via the *mark*.**fx** or *mark*.**fy** channel options.

Here is an example of top-level faceting:

```js
Plot.plot({
  facet: {
    data: penguins,
    x: "sex",
    y: "island"
  },
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
  ]
})
```

And here is the equivalent mark-level faceting:

```js
Plot.plot({
  marks: [
    Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fx: "sex", fy: "island"})
  ]
})
```

Regardless of whether top- or mark-level faceting is used, the *fx* and *fy* channels are strictly ordinal or categorical (*i.e.*, discrete); each distinct channel value defines a facet. Quantitative data must be manually discretized for faceting, say by rounding or binning. (Automatic binning for quantitative data may be added in the future; see [#14](https://github.com/observablehq/plot/issues/14).) When mark-level faceting is used, the *fx* and *fy* channels are computed prior to the [mark’s transform](#transforms), if any (*i.e.*, facet channels are not transformed).

The following top-level facet constant options are also supported:

* facet.**marginTop** - the top margin
* facet.**marginRight** - the right margin
* facet.**marginBottom** - the bottom margin
* facet.**marginLeft** - the left margin
* facet.**margin** - shorthand for the four margins
* facet.**grid** - if true, draw grid lines for each facet
* facet.**label** - if null, disable default facet axis labels

Faceting can be explicitly enabled or disabled on a mark with the *mark*.**facet** option, which accepts the following values:

* *auto* (default) - automatically determine if this mark should be faceted
* *include* (or true) - draw the subset of the mark’s data in the current facet
* *exclude* - draw the subset of the mark’s data *not* in the current facet
* *super* - draw this mark in a single frame that covers all facets
* null (or false) - repeat this mark’s data across all facets (*i.e.*, no faceting)

When a mark uses *super* faceting, it is not allowed to use position scales (*x*, *y*, *fx*, or *fy*); *super* faceting is intended for decorations, such as labels and legends.

When top-level faceting is used, the default *auto* setting is equivalent to *include* when the mark data is strictly equal to the top-level facet data; otherwise it is equivalent to null. When the *include* or *exclude* facet mode is chosen, the mark data must be parallel to the top-level facet data: the data must have the same length and order. If the data are not parallel, then the wrong data may be shown in each facet. The default *auto* therefore requires strict equality (`===`) for safety, and using the facet data as mark data is recommended when using the *exclude* facet mode. (To construct parallel data safely, consider using [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) on the facet data.)

When mark-level faceting is used, the default *auto* setting is equivalent to *include*: the mark will be faceted if either the *mark*.**fx** or *mark*.**fy** channel option (or both) is specified. The null or false option will disable faceting, while *exclude* draws the subset of the mark’s data *not* in the current facet.

The <a name="facetanchor">*mark*.**facetAnchor**</a> option controls the placement of the mark with respect to the facets. It supports the following settings:

* null - display the mark on each non-empty facet (default for all marks, with the exception of axis marks)
* *top*, *right*, *bottom*, or *left* - display the mark on facets on the specified side
* *top-empty*, *right-empty*, *bottom-empty*, or *left-empty* - display the mark on facets that have an empty space on the specified side (the empty space being either the margin, or an empty facet); this is the default for axis marks
* *empty* - display the mark on empty facets only
