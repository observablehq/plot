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
   * The **style** option allows custom styles to override Plot’s defaults. It
   * may be specified either as a string of inline styles (*e.g.*, `"color:
   * red;"`, in the same fashion as assigning
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
   * The generated SVG element has a random class name which applies a default
   * stylesheet. Use the top-level **className** option to specify that class
   * name.
   */
  className?: string | null;

  /**
   * If a **caption** is specified, Plot wraps the generated SVG element in an
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

  /** horizontal facet position scale; always a band scale */
  fx?: ScaleOptions;

  /** vertical facet position scale; always a band scale */
  fy?: ScaleOptions;

  /** horizontal position scale */
  x?: ScaleOptions;

  /** vertical position scale */
  y?: ScaleOptions;

  /** radius (size) scale; for dots and Point geos */
  r?: ScaleOptions;

  /** color scale; for fill or stroke */
  color?: ScaleOptions;

  /** opacity scale; for fill or stroke opacity */
  opacity?: ScaleOptions;

  /** categorical symbol scale; for dots */
  symbol?: ScaleOptions;

  /** length scale; for vectors */
  length?: ScaleOptions;

  /** projection; alternative to the x and y scales */
  projection?: ProjectionOptions | ProjectionName | ProjectionFactory | ProjectionImplementation | null;

  /** plot facet options */
  facet?: PlotFacetOptions;

  /**
   * The array of marks to render. Each mark has its own data and options; see
   * the respective mark type for details.
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
