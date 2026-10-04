# Warnings

Plot emits warnings when it detects a common mistake in your specification—typically data whose type doesn’t match the [scale](./scales.md) you implied, or an option that conflicts with another. Warnings are Plot telling you that the chart you’re looking at is probably not the chart you meant to make.

Warnings are written to the browser’s developer console, and summarized in the top-right corner of the plot with a ⚠️ indicator. Hover over the indicator to see how many warnings were generated; open the console to read them. The [0.4.1 release notes](https://github.com/observablehq/plot/blob/main/CHANGELOG-2022.md#041) show the original example with a screenshot.

```js
Plot.line(aapl, {x: "Date", y: "Close"}) // 🌶 Oops, Date is a string!
```

The message for the chart above is:

> `Warning: some data associated with the x scale are strings that appear to be dates (e.g., YYYY-MM-DD). If these strings represent dates, you should parse them to Date objects. Dates are typically associated with a "utc" or "time" scale rather than a "point" scale. If you are using a bar mark, you probably want a rect mark with the interval option instead; if you are using a group transform, you probably want a bin transform instead. If you want to treat this data as ordinal, you can suppress this warning by setting the type of the x scale to "point".`

Each warning is specific about the channel it applies to, explains the likely intent, and says how to silence it if the current behavior is intentional.

## Seeing warnings

The ⚠️ indicator is only shown when the most recent call to [plot](./plots.md) produced at least one warning; the count is reset on every render, so re-rendering a plot with the same mistake shows the same number, not a running total. The indicator is drawn by the same code path as the plot’s title and caption, so it is included in the returned figure element.

If the indicator is missing, no warning was generated for the current plot.

## Silencing warnings

Many warnings end with an instruction for suppressing them, usually by setting the type of a scale, setting an explicit value for a channel, or by fixing the data. For example, parsing the strings above to dates removes the warning entirely:

```js
Plot.line(aapl, {x: "Date", y: "Close"}) // parse with d3.autoType instead
```

There is no global “quiet” option. If a warning is unhelpful, [let us know](https://github.com/observablehq/plot/discussions); we may add a warning, refine one, or reconsider whether it should fire at all.

## Warnings Plot emits

Data type mismatches on [ordinal scales](./scales.md), for the *x*, *y*, and *color* channels:

- values are dates, which usually want a *utc* or *time* scale;
- values are strings that look like dates (`YYYY-MM-DD`), which should be parsed to `Date` objects;
- values are strings that look like numbers, which should be parsed or coerced to numbers.

In each case the message names the offending channel and says how to keep the data ordinal if that is what you want.

Scale and mark configuration:

- the *x*- or *y*-axis *ticks* are entirely outside the scale domain, so no ticks are drawn;
- the implicit *z* channel has high cardinality, which usually means a quantitative channel is being used for *fill* or *stroke*;
- a [diverging scale](./scales.md) domain has more than two elements;
- a [projection](./projections.md) could not be fit to the specified domain, so the default scale is used instead;
- a mark’s data has the same length as the facet data but the mark is not faceted, which usually means the **facet** option should be set explicitly;
- the **shift** option of a [window transform](../transforms/window.md) is deprecated in favor of **anchor**.

Warnings are added over time; the list above reflects Plot as currently released.
