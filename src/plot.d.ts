import type {ChannelValue} from "./channel.js";
import type {LegendOptions} from "./legends.js";
import type {Data, Markish} from "./mark.js";
import type {ProjectionFactory, ProjectionImplementation, ProjectionName, ProjectionOptions} from "./projection.js";
import type {Scale, ScaleDefaults, ScaleOptions} from "./scales.js";

export interface PlotOptions extends ScaleDefaults {
  // dimensions

  /**
   * The outer width of the plot in pixels, including margins. Defaults to 640.
   * On Observable, this can be set to the built-in
   * [width](https://github.com/observablehq/stdlib/blob/main/README.md#width)
   * for full-width responsive plots. Note: the default style has a max-width of
   * 100%; the plot will automatically shrink to fit even when a fixed width is
   * specified.
   */
  width?: number;

  /**
   * The outer height of the plot in pixels, including margins. The default
   * depends on the plot’s scales, and the plot’s {@link width} if an
   * {@link aspectRatio} is specified. For example, if {@link y} is linear and
   * there is no {@link fy} scale, it might be 396.
   */
  height?: number;

  /**
   * The desired aspect ratio of the *x* and *y* scales, affecting the default
   * {@link height}. Given an aspect ratio of *dx* / *dy*, and assuming that the
   * *x* and *y* scales represent equivalent units (say, degrees Celsius or
   * meters), computes a default {@link height} such that *dx* pixels along *x*
   * represents the same variation as *dy* pixels along *y*. Note: when
   * faceting, set the *fx* and *fy* scales’ **round** option to false for an
   * exact aspect ratio.
   */
  aspectRatio?: number | boolean | null;

  /**
   * Shorthand to set the same default for all four margins: {@link marginTop},
   * {@link marginRight}, {@link marginBottom}, and {@link marginLeft}.
   * Otherwise, the default margins depend on the maximum margins of the plot’s
   * {@link marks}. While most marks default to zero margins (because they are
   * drawn inside the chart area), Plot’s axis marks have non-zero default
   * margins.
   */
  margin?: number;

  /**
   * The top margin; the distance in pixels between the top edges of the inner
   * and outer plot area. Defaults to the maximum top margin of the plot’s
   * {@link marks}.
   */
  marginTop?: number;

  /**
   * The right margin; the distance in pixels between the right edges of the
   * inner and outer plot area. Defaults to the maximum right margin of the
   * plot’s {@link marks}.
   */
  marginRight?: number;

  /**
   * The bottom margin; the distance in pixels between the bottom edges of the
   * inner and outer plot area. Defaults to the maximum bottom margin of the
   * plot’s {@link marks}.
   */
  marginBottom?: number;

  /**
   * The left margin; the distance in pixels between the left edges of the inner
   * and outer plot area. Defaults to the maximum left margin of the plot’s
   * {@link marks}.
   */
  marginLeft?: number;

  // other top-level options

  /**
   * Custom styles to override Plot’s defaults. Styles may be specified either
   * as a string of inline styles (*e.g.*, `"color: red;"`, in the same fashion
   * as assigning
   * [*element*.style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style))
   * or an object of properties (*e.g.*, `{color: "red"}`, in the same fashion
   * as assigning [*element*.style
   * properties](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration)).
   * Note that unitless numbers ([quirky
   * lengths](https://www.w3.org/TR/css-values-4/#deprecated-quirky-length))
   * such as `{padding: 20}` may not supported by some browsers; you should
   * instead specify a string with units such as `{padding: "20px"}`. By
   * default, the returned plot has a white background, a max-width of 100%, and
   * the system-ui font. Plot’s marks and axes default to
   * [currentColor](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#currentcolor_keyword),
   * meaning that they will inherit the surrounding content’s color. For
   * example, a dark theme:
   *
   * ```js
   * Plot.plot({
   *   style: "background: black; color: white;",
   *   marks: …
   * })
   * ```
   */
  style?: string | Partial<CSSStyleDeclaration> | null;

  /**
   * The generated SVG element’s class name used for Plot’s default stylesheet;
   * by default, a random string prefixed with “plot-”.
   */
  className?: string;

  /**
   * The figure caption. If present, Plot wraps the generated SVG element in an
   * HTML figure element with a figcaption, returning the figure. To specify an
   * HTML caption, consider using the [`html` tagged template
   * literal](http://github.com/observablehq/htl); otherwise, the specified
   * string represents text that will be escaped as needed.
   *
   * ```js
   * Plot.plot({
   *   caption: html`Figure 1. This chart has a <i>fancy</i> caption.`,
   *   marks: …
   * })
   * ```
   */
  caption?: string | Node | null;

  /**
   * The [aria-label
   * attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label)
   * on the SVG root.
   */
  ariaLabel?: string | null;

  /**
   * The [aria-description
   * attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-description)
   * on the SVG root.
   */
  ariaDescription?: string | null;

  /**
   * The owner
   * [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document) used
   * to create DOM elements. Defaults to window.document, but can be changed to
   * another document, say when using a virtual DOM library for server-side
   * rendering in Node.
   */
  document?: Document;

  // scale, axis, and legend definitions

  /**
   * Options for the horizontal position *x* scale. The *x* scale defaults to
   * the *linear* type for quantitative (numeric) data, the *utc* type for
   * temporal (date) data, and the *point* type for ordinal (string or boolean)
   * data. Some marks require a specific *x*-scale type, affecting the default;
   * for example, the barY, cell, and tickY marks require the *band* type.
   *
   * If the *x* scale is present, and an *x*-axis mark is not included in
   * {@link marks}, an implicit *x*-axis will be rendered below other marks.
   */
  x?: ScaleOptions;

  /**
   * Options for the vertical position *y* scale. The *y* scale defaults to the
   * *linear* type for quantitative (numeric) data, the *utc* type for temporal
   * (date) data, and the *point* type for ordinal (string or boolean) data.
   * Some marks require a specific *y*-scale type, affecting the default; for
   * example, the barX, cell, and tickX marks require the *band* type.
   *
   * If the *y* scale is present, and a *y*-axis mark is not included in
   * {@link marks}, an implicit *y*-axis will be rendered below other marks.
   */
  y?: ScaleOptions;

  /**
   * Options for the radius (size) *r* scale for dots or Point geos. The *r*
   * scale defaults to a *sqrt* scale such that the area of marks is
   * proportional to the encoded quantitative value, and is typically used with
   * quantitative data; the domain and range should both start at zero for
   * accurate areal representation.
   *
   * Plot does not currently implement a radius legend; see
   * [#236](https://github.com/observablehq/plot/issues/236). We recommend
   * either implementing one manually or labeling points so that values can be
   * read directly from the plot.
   */
  r?: ScaleOptions;

  /**
   * Options for the *color* scale for fill or stroke. The *color* scale
   * defaults to a *linear* scale with the *turbo* scheme for quantitative
   * (numeric) or temporal (date) data, and an *ordinal* scale with the
   * *tableau10* scheme for categorical (string or boolean) data.
   *
   * Plot does not currently render a color legend by default; set the
   * **legend** *color* scale option to true to produce a color legend.
   *
   * Note: a channel bound to the *color* scale typically bypasses the scale if
   * all associated values are valid CSS color strings; the *color* scale can be
   * explicitly associated or disassociated with a particular channel by
   * specifying the channel value as a {value, scale} object.
   */
  color?: ScaleOptions;

  /**
   * Options for the *opacity* scale for fill or stroke opacity. The *opacity*
   * scale defaults to a *linear* scale, and is typically used with quantitative
   * data; the domain and range should both start at zero for an accurate
   * encoding.
   *
   * TODO Automatic opt-out for channels whose data are numbers in [0, 1].
   */
  opacity?: ScaleOptions;

  /**
   * Options for the categorical *symbol* scale for dots.
   *
   * TODO Automatic opt-out for channels whose data are symbols.
   */
  symbol?: ScaleOptions;

  /**
   * Options for the *length* scale for vectors.
   */
  length?: ScaleOptions;

  /**
   * Options for projection. A projection is an alternative to the *x* and *y*
   * scales for encoding position, and is typically used to convert polygonal
   * geometry in spherical coordinates to a planar visual representation.
   */
  projection?: ProjectionOptions | ProjectionName | ProjectionFactory | ProjectionImplementation | null;

  /** horizontal facet position scale; always a band scale */
  fx?: ScaleOptions;

  /** vertical facet position scale; always a band scale */
  fy?: ScaleOptions;

  /** plot facet options */
  facet?: PlotFacetOptions;

  /**
   * The marks to render. Each mark has its own data and options; see the
   * respective mark type for details.
   *
   * Each mark (or “markish”) may also be a nested array of marks, allowing
   * composition. Marks may also be a function which returns an SVG element, to
   * insert arbitrary content into the plot. And marks may be null or undefined
   * to produce no output; this is useful for showing marks conditionally
   * (*e.g.*, when a box is checked).
   *
   * Marks are drawn in *z* order, last on top. For example, here a single rule
   * at *y* = 0 is drawn on top of blue bars for the [*alphabet*
   * dataset](./test/data/alphabet.csv).
   *
   * ```js
   * Plot.plot({
   *   marks: [
   *     Plot.barY(alphabet, {x: "letter", y: "frequency", fill: "steelblue"}),
   *     Plot.ruleY([0])
   *   ]
   * })
   * ```
   */
  marks?: Markish[];
}

export interface PlotFacetOptions {
  /** data for top-level faceting */
  data?: Data;

  /** x channel for top-level faceting; implies fx scale */
  x?: ChannelValue;

  /** y channel for top-level faceting; implies fy scale */
  y?: ChannelValue;

  /**
   * Shorthand to set the same default for all four facet margins:
   * {@link marginTop}, {@link marginRight}, {@link marginBottom}, and
   * {@link marginLeft}.
   */
  margin?: number;

  /**
   * The top facet margin; the (minimum) distance in pixels between the top
   * edges of the inner and outer plot area.
   */
  marginTop?: number;

  /**
   * The right facet margin; the (minimum) distance in pixels between the right
   * edges of the inner and outer plot area.
   */
  marginRight?: number;

  /**
   * The bottom facet margin; the (minimum) distance in pixels between the
   * bottom edges of the inner and outer plot area.
   */
  marginBottom?: number;

  /**
   * The left facet margin; the (minimum) distance in pixels between the left
   * edges of the inner and outer plot area.
   */
  marginLeft?: number;

  /**
   * default axis grid for fx and fy scales; typically set to true to enable
   */
  grid?: ScaleOptions["grid"];

  /**
   * default axis label for fx and fy scales; typically set to null to disable
   */
  label?: ScaleOptions["label"];
}

/**
 * The SVG or HTML figure element returned by {@link plot} is decorated with
 * additional methods to allow sharing of scales and legends across plots.
 */
export interface Plot {
  scale(name: string): Scale | undefined;
  legend(name: string, options?: LegendOptions): HTMLElement | undefined;
}

/**
 * Renders a new plot given the specified *options* and returns the
 * corresponding SVG element, or an HTML figure element if a caption or legend
 * is requested.
 */
export function plot(options?: PlotOptions): (SVGSVGElement | HTMLElement) & Plot;
