import type {ScaleName, ScaleOptions} from "./scales.js";

export interface SwatchesLegendOptions {
  /**
   * The width of the legend in pixels. Defaults to undefined, allowing swatches
   * to wrap based on content flow.
   */
  width?: number;

  /**
   * The [CSS columns property][1], for a multi-column layout.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/columns
   */
  columns?: string;

  /** The swatch width and height in pixels; defaults to 15. */
  swatchSize?: number;

  /** The swatch width in pixels; defaults to **swatchSize**. */
  swatchWidth?: number;

  /** The swatch height in pixels; defaults to **swatchSize**. */
  swatchHeight?: number;
}

export interface RampLegendOptions {
  /** The width of the legend in pixels; defaults to 240. */
  width?: number;
  /** The height of the legend in pixels; defaults to 44 plus **tickSize**. */
  height?: number;
  /** The top margin in pixels; defaults to 18. */
  marginTop?: number;
  /** The right margin in pixels; defaults to 0. */
  marginRight?: number;
  /** The bottom margin in pixels; defaults to 16 plus **tickSize**. */
  marginBottom?: number;
  /** The left margin in pixels; defaults to 0. */
  marginLeft?: number;

  /**
   * The desired approximate number of axis ticks, or an explicit array of tick
   * values, or an interval such as *day* or *month*.
   */
  ticks?: ScaleOptions["ticks"];

  /**
   * The length of axis tick marks in pixels; negative values extend in the
   * opposite direction.
   */
  tickSize?: ScaleOptions["tickSize"];

  /**
   * If true, round the output value to the nearest integer (pixel); useful for
   * crisp edges when rendering.
   */
  round?: ScaleOptions["round"];
}

export interface OpacityLegendOptions extends RampLegendOptions {
  /** The constant color the ramp; defaults to black. */
  color?: string;
}

export interface ColorLegendOptions extends SwatchesLegendOptions, RampLegendOptions {
  /** The desired opacity of the color swatches or ramp; defaults to 1. */
  opacity?: number;
}

export interface SymbolLegendOptions extends SwatchesLegendOptions {
  /** The desired fill color of symbols; use *color* for a redundant encoding. */
  fill?: string;
  /** The desired fill opacity of symbols; defaults to 1. */
  fillOpacity?: number;
  /** The desired stroke color of symbols; use *color* for a redundant encoding. */
  stroke?: string;
  /** The desired stroke opacity of symbols; defaults to 1. */
  strokeOpacity?: number;
  /** The desired stroke width of symbols; defaults to 1.5. */
  strokeWidth?: number;
  /** The desired radius of symbols in pixels; defaults to 4.5. */
  r?: number;
}

/** Options for generating a scale legend. */
export interface LegendOptions extends ColorLegendOptions, SymbolLegendOptions, OpacityLegendOptions {
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

  /** A textual label to place above the legend. */
  label?: string | null;

  /**
   * How to format tick values sampled from the scale’s domain. This may be a
   * function, which will be passed the tick value *t* and zero-based index *i*
   * and must return the corresponding string. If the domain is numbers, the
   * tick format may also be expressed as a [d3-format string][1]; or if the
   * domain is dates, the tick format may also be expressed as a [d3-time-format
   * string][2].
   *
   * [1]: https://d3js.org/d3-format#locale_format
   * [2]: https://d3js.org/d3-time-format#locale_format
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
