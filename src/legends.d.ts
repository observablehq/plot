import type {ScaleName, ScaleOptions} from "./scales.js";

/** Options for generating a scale legend. */
export interface LegendOptions {
  /**
   * The desired legend type; one of:
   *
   * - *ramp* - place labels underneath with a connecting line, and no wrapping
   * - *swatches* - place labels to the right, and allow wrapping
   *
   * The legend type can currently only be configured for a discrete *color*
   * scale of type *ordinal*, *quantile*, *quantize*, or *threshold*; for other
   * *color* scale types, or for *opacity* or *symbol* scales, the legend type
   * cannot be changed.
   */
  legend?: "ramp" | "swatches";

  /**
   * How to format tick values sampled from the scale’s domain. This may be a
   * function, which will be passed the tick value *t* and zero-based index *i*
   * and must return the corresponding string. If the domain is numbers, the
   * tick format may also be expressed as a [d3-format string][1]; or if the
   * domain is dates, the tick format may also be expressed as a [d3-time-format
   * string][2].
   *
   * [1]: https://github.com/d3/d3-format/blob/main/README.md#locale_format
   * [2]: https://github.com/d3/d3-time-format/blob/main/README.md#locale_format
   */
  tickFormat?: ScaleOptions["tickFormat"];

  /**
   * The [CSS font-variant][1] for tick labels. For non-ordinal scales, or
   * ordinal scales without an interval, this defaults to *tabular-nums*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant
   */
  fontVariant?: ScaleOptions["fontVariant"];

  /** Custom styles to override Plot’s defaults. */
  style?: string | Partial<CSSStyleDeclaration> | null;

  /**
   * The generated element’s class name used for Plot’s default stylesheet; by
   * default, a random string prefixed with “plot-”.
   */
  className?: string | null;

  /** The constant color the ramp; defaults to black. For *ramp* *opacity* legends only. */
  color?: string;
  /** The desired fill color of symbols; use *color* for a redundant encoding. For *symbol* legends only. */
  fill?: string;
  /** The desired fill opacity of symbols. For *symbol* legends only. */
  fillOpacity?: number;
  /** The desired stroke color of symbols; use *color* for a redundant encoding. For *symbol* legends only. */
  stroke?: string;
  /** The desired stroke opacity of symbols. For *symbol* legends only. */
  strokeOpacity?: number;
  /** The desired stroke width of symbols. For *symbol* legends only. */
  strokeWidth?: number;
  /** The desired radius of symbols in pixels. For *symbol* legends only. */
  r?: number;

  /**
   * The width of the legend in pixels. For *ramp* legends, defaults to 240; for
   * *swatch* legends, defaults to undefined, allowing the swatches to wrap
   * based on content flow.
   */
  width?: number;

  /**
   * The height of the legend in pixels; defaults to 44 plus **tickSize**. For
   * *ramp* legends only.
   */
  height?: number;

  /** The top margin in pixels; defaults to 18. For *ramp* legends only. */
  marginTop?: number;
  /** The right margin in pixels; defaults to 0. For *ramp* legends only. */
  marginRight?: number;
  /** The bottom margin in pixels; defaults to 16 plus **tickSize**. For *ramp* legends only. */
  marginBottom?: number;
  /** The left margin in pixels; defaults to 0. For *ramp* legends only. */
  marginLeft?: number;

  /** A textual label to place above the legend. For *ramp* legends only. */
  label?: string | null;

  /**
   * The desired approximate number of axis ticks, or an explicit array of tick
   * values, or an interval such as *day* or *month*. For *ramp* legends only.
   */
  ticks?: ScaleOptions["ticks"];

  /**
   * The length of axis tick marks in pixels; negative values extend in the
   * opposite direction. For *ramp* legends only.
   */
  tickSize?: ScaleOptions["tickSize"];

  /**
   * If true, round the output value to the nearest integer (pixel); useful for
   * crisp edges when rendering. For *ramp* legends only.
   */
  round?: ScaleOptions["round"];

  /**
   * The [CSS columns property][1], for a multi-column layout. For *swatches*
   * legends only.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/columns
   */
  columns?: string;

  /** The swatch width and height in pixels; defaults to 15; For *swatches* legends only. */
  swatchSize?: number;
  /** The swatch width in pixels; defaults to **swatchSize**; For *swatches* legends only. */
  swatchWidth?: number;
  /** The swatch height in pixels; defaults to **swatchSize**; For *swatches* legends only. */
  swatchHeight?: number;
}

/** Scale definitions and options for a standalone legend. */
export type LegendScales = {[key in ScaleName]?: ScaleOptions | (key extends keyof LegendOptions ? LegendOptions[key] : never)} & Omit<LegendOptions, ScaleName>; // prettier-ignore

/**
 * Generates a standalone legend for the scale defined by the given *options*,
 * returning either an SVG or HTML element depending on the scale and the
 * desired legend type. Currently supports only *color*, *opacity*, and *symbol*
 * scales.
 */
export function legend(options?: LegendScales): SVGSVGElement | HTMLElement;
