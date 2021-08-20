# Observable Plot - Changelog

## 0.2.0

*Not yet released.* These notes are a work in progress.

[breaking] Plot is now published as an ES module and requires Node 12 or higher. For more, please read [Sindre Sorhus’s FAQ](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

[breaking] Plot now depends on [D3 7.0](https://github.com/d3/d3/releases/tag/v7.0.0) or higher.

### Marks

The [*marks* option](https://github.com/observablehq/plot/blob/main/README.md#mark-options) now accepts render functions, null, and undefined as shorthand mark definitions. Nullish marks produce no output and are useful for conditional display (equivalent to the empty array). Render functions are invoked when plotting and may return an SVG element to insert into the plot, such as a legend or annotation.

<img width="636" alt="a line chart of Apple, Inc.’s daily closing stock price from 2013 to 2018, with a red ‘hello world’ label" src="https://user-images.githubusercontent.com/230541/130157120-8cbf8052-aa31-44ed-a650-d081c4a21d69.png">

```js
Plot.marks(
  Plot.line(aapl, {x: "Date", y: "Close"}),
  () => svg`<text x=20% y=20% fill=red>Hello, world!</text>`
).plot()
```

The [Plot.marks(...*marks*)](https://github.com/observablehq/plot/blob/main/README.md#plotmarksmarks) function provides [*mark*.plot](https://github.com/observablehq/plot/blob/main/README.md#plotplotoptions) shorthand for array marks. This is useful for composite marks, such as [boxes](https://github.com/observablehq/plot/blob/8fef4fa52a4cca4135f5f964e3c328ef8f18f672/test/plots/morley-boxplot.js#L18-L23).

All marks now support the [shapeRendering option](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering). (This is a constant; it may not vary across marks.) All marks now allow strokeWidth to be specified as a channel. (The strokeWidth channel is unscaled; values are specified in literal pixels.) Text marks now also allow stroke and strokeOpacity to be specified as channels. If its fill is not *none*, a line’s default stroke is now *none* rather than *currentColor*, making it consistent with dot and other marks. When a fill or fillOpacity channel is used with a link, or when a stroke or strokeOpacity channel is used with a rule, undefined values will now be filtered. The text mark now uses attributes instead of styles for font rendering properties, improving compatibility with Firefox.

<img width="640" alt="a series of dots with an increasing stroke width" src="https://user-images.githubusercontent.com/7001/130228992-eb2452f1-8822-4239-87b7-07f79e5a2ccb.png">

```js
Plot.dotX(d3.range(41), {strokeWidth: d => (1 + d) / 15}).plot()
```

Marks that represent continuous intervals (rect, bar, and rule) now handle collapsed domains during rendering. A domain is considered collapsed when it contains only a single value. A collapsed domain can occur when all input values to the bin transform are equal (*e.g.*, [1, 1, 1, …] produces a domain of [1, 1]). Previously a collapsed domain would result in an invisible zero-width mark; now the mark spans the full extent of the chart.

<img width="640" alt="a histogram with a collapsed domain showing a single bar that represents the value 1 with frequency 3" src="https://user-images.githubusercontent.com/230541/130156841-d888e397-0040-4aef-bbb5-9ff19e1e3389.png">

```js
Plot.rectY([1, 1, 1], Plot.binX()).plot()
```

The link mark now supports *x* or *y* shorthand for one-dimensional links, equivalent to rule. The rect mark now supports one-dimensional (and zero-dimensional) rects: the *x1*, *x2*, *y1* and *y2* channels are now optional.

### Scales

The new [*sort* options](https://github.com/observablehq/plot/blob/main/README.md#sort-options) allow convenient control over the order of ordinal domains, including the *fx* and *fy* facet domains. The aggregation method can be controlled via the *reduce* option, which defaults to *max*. The *reverse* and *limit* options are also supported. For example, a bar chart can be sorted by descending value like so:

<img width="640" alt="a bar chart showing the frequency of letters in the English language in order of descending frequency, starting with E at 13% and ending with Z at almost 0%" src="https://user-images.githubusercontent.com/230541/130157414-be9cbc86-8a0c-40e7-8cfb-999881482691.png">

```js
Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", reverse: true}})
```

Color scales now support the *threshold* scale type, allowing you to specify a set of *n* - 1 discrete (typically numeric) thresholds to produce *n* discrete colors. The new *quantile* color scale type will automatically compute *n* - 1 thresholds for *n* quantiles based on the data.

<img width="640" alt="a histogram showing the forecast probabilities of Democratic electoral votes in the 2016 U.S. presidential election, with outcomes of 270 votes highlighted in blue" src="https://user-images.githubusercontent.com/230541/130157825-0624447b-f39d-4a2a-9363-e18129d6f20e.png">

```js
Plot.plot({
  y: {
    percent: true
  },
  color: {
    type: "threshold",
    domain: [270]
  },
  marks: [
    Plot.ruleX(data, {x: "dem_electoral_votes", y: "probability", stroke: "dem_electoral_votes", strokeWidth: 1.5}),
    Plot.ruleX([270])
  ]
})
```

Diverging scales now support a *symmetric* option, which defaults to true, to ensure that differences above and below the pivot are equally apparent. For example, the choropleth below gives equal visual weight to West Virginia’s population decline of −3% and Alaska’s gain of +3%. If *symmetric* is false, as before, then −3% is mapped to the darkest purple. (Diverging scales should always use balanced interpolators where the negative and positive extremes have equal weight; this is true of Plot’s built-in diverging color schemes from ColorBrewer.)

<img width="641" alt="a choropleth with symmetric diverging scale, showing the change in population of the fifty U.S. states between 2010 and 2019; the change in negative values is commensurate with the change in positive values" src="https://user-images.githubusercontent.com/230541/129834634-2617a895-5040-4135-b015-0aa4b812c262.png">

Diverging color scales now also support transformations via four new scale types: *diverging-sqrt*, *diverging-pow*, *diverging-log*, and *diverging-symlog*, corresponding to the *sqrt*, *pow*, *log*, and *symlog* quantitative scale types respectively. (The above choropleth uses a *diverging-log* scale to show relative change.)

The new axis *line* option, which defaults to false, can be used to show a continuous line along the *x* or *y* axis to denote the extent. This is most useful when the opposite axis is ordinal and thus a rule cannot annotate a meaningful value such as zero; if the opposite axis is quantitative, a rule is generally preferred.

<img width="640" alt="an empty plot showing a vertical line along the quantitative y-axis; the opposite x-axis is categorical" src="https://user-images.githubusercontent.com/230541/130247773-d868d261-9744-4d57-855a-61a2a870655b.png">

```js
Plot.plot({
  grid: true,
  inset: 6,
  x: {
    domain: "ABCDEFGH"
  },
  y: {
    line: true,
    domain: [0, 1]
  }
})
```

### Facets

The mark *facet* option can be used to control whether or not a mark is faceted. The supported values are *auto*, *include*, *exclude*, and null. True is an alias for *include* and false is an alias for null. The default is *auto*, which facets a mark if and only if its data is strictly equal to the facet data. The *include* facet mode allows a mark with different data to be faceted; however, it requires that the mark’s data be parallel with the facet data (*i.e.*, have the same length and order). The *exclude* facet mode shows all data that are not present in the current facet; this can provide shared context across facets without overdrawing. The null mode disables faceting, replicating the mark across all facets.

<img width="640" alt="a faceted scatterplot showing the correlation between culmen depth and length across sex and species; each facet shows the current sex and species with black dots and all other penguins as pale gray dots" src="https://user-images.githubusercontent.com/7001/130275538-ec33aaa4-73e2-4fb3-862a-8fdd47a788d6.png">

```js
Plot.plot({
  facet: {
    data: penguins,
    x: "sex",
    y: "species",
    marginRight: 80
  },
  marks: [
    Plot.frame(),
    Plot.dot(penguins, {
      facet: "exclude",
      x: "culmen_depth_mm",
      y: "culmen_length_mm",
      r: 2,
      fill: "#ddd"
    }),
    Plot.dot(penguins, {
      x: "culmen_depth_mm",
      y: "culmen_length_mm"
    })
  ]
})
```

Empty facets, which can occur when faceting in both *x* and *y*, or when the specified *fx* or *fy* domain includes values not present in the data, are no longer rendered. When the facet *data* is null, a better error message is thrown.

### Transforms

The bin and group transforms now support new *filter*, *sort* and *reverse* options on the *outputs* object. By setting the *filter* to null, the bin transform will now return all bins, even if empty; this is useful with marks such as lines and areas that require zeroes to be present, rather than interpolating across the missing bins. (The *z*, *fill* or *stroke* channels, when used for grouping, are propagated to empty bins.)

<img width="641" alt="a stacked area chart showing the count of covid cases resulting in deaths over time for San Francisco, broken down by transmission category; if empty bins were not present, this chart would render incorrectly" src="https://user-images.githubusercontent.com/230541/130282717-01fb2979-0c8b-415b-8a67-bef169b9c6b5.png">

```js
Plot.plot({
  marks: [
    Plot.areaY(cases, Plot.binX({y: "sum", filter: null}, {
      x: "specimen_collection_date",
      y: "case_count",
      filter: d => d.case_disposition === "Death",
      fill: "transmission_category",
      curve: "step",
      thresholds: d3.utcWeek
    })),
    Plot.ruleY([0])
  ]
})
```

The *outputs* argument to the bin and group transforms is now optional; it defaults to the *count* reducer for *y*, *x* and *fill* for Plot.binX, Plot.binY, and Plot.bin respectively, and the same for the group transforms.

The bin and group transforms now support new *distinct*, *mode*, *min-index*, and *max-index* reducers. The *distinct* reducer counts the number of distinct values in each group, while the *mode* reducer returns the most frequent value in each group. The *min-index* and *max-index* reducers are similar to *min* and *max*, except they return the zero-based index of the minimum and maximum value, respectively; for example, this is useful to sort time series by the date of each series’ peak.

The default *thresholds* option for the bin transforms is now *auto* instead of *scott*. The *auto* option applies a maximum limit of 200 bins to Scott’s rule. This reduces the risk of producing vanishing rects when they are too numerous and thin to be visible. (Note, however, that it is still possible to produce invisible rects if the insets are larger than the width.)

The normalize, window, and stack transforms can now accept a transform *options* argument in addition to an *inputs* argument that specifies the input channels. This allows makes these transforms more consistent with the other transforms, reduces ambiguity, and allows for additional shorthand. For example, you can pass *k* as the first argument to the window transform, here for a 12-month moving average:

```js
Plot.line(data, Plot.windowY(12, {x: "date", y: "unemployment", z: "division"}))
```

The *offset* = {*expand*, *silhouette*} stack option has been renamed to *offset* = {*normalize*, *center*}, respectively. The *shift* = {*centered*, *leading*, *trailing*} window option has been renamed to *anchor* = {*middle*, *start*, *end*} respectively. The old names are supported for backwards compatibility.

The basic transforms are now available as explicit option transforms: Plot.filter, Plot.sort, and Plot.reverse. These are useful when you wish to control the order of these transforms with respect to other transforms such as Plot.bin and Plot.stack.

The select transforms now throw better error messages when required input channels are missing. When mark *transform* option is null, it is considered equivalent to undefined and no transform is applied instead of throwing an error.

## 0.1.0

Released May 3, 2021.
