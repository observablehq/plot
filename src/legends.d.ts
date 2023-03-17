import type {ScaleName, ScaleOptions} from "./scales.js";

/** The supported legend types. */
export type LegendType = "ramp" | "swatches";

/** Options for generating a scale legend. */
export interface LegendOptions {
  /**
   * The desired legend type; currently supported only for a discrete *color*
   * scale of type *ordinal*, *quantile*, *quantize*, or *threshold*. One of:
   *
   * * *ramp* - place labels underneath with a connecting line, and no wrapping
   * * *swatches* - place labels to the right, and allow wrapping
   */
  legend?: LegendType;

  /**
   * How to format tick values sampled from the scale’s domain. This may be a
   * function, which will be passed the tick value *t* and zero-based index *i*
   * and must return the corresponding string. If the domain is numbers, the
   * tick format may also be expressed as a [d3-format
   * string](https://github.com/d3/d3-format/blob/main/README.md#locale_format);
   * or if the domain is dates, the tick format may also be expressed as a
   * [d3-time-format
   * string](https://github.com/d3/d3-time-format/blob/main/README.md#locale_format).
   */
  tickFormat?: ScaleOptions["tickFormat"];

  /**
   * The [CSS
   * font-variant](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant)
   * for tick labels. For non-ordinal scales, or ordinal scales without an
   * interval, this defaults to *tabular-nums*.
   */
  fontVariant?: ScaleOptions["fontVariant"];

  /** Custom styles to override Plot’s defaults. */
  style?: string | Partial<CSSStyleDeclaration> | null;

  /**
   * The generated element’s class name used for Plot’s default stylesheet; by
   * default, a random string prefixed with “plot-”.
   */
  className?: string | null;

  /** The constant color for *opacity* scales. Defaults to black. */
  color?: string;

  // symbol options
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  r?: number;

  // dimensions
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;

  // ramp options
  label?: string | null;
  ticks?: ScaleOptions["ticks"];
  tickSize?: ScaleOptions["tickSize"];
  round?: ScaleOptions["round"];

  // swatches options
  columns?: string;
  swatchSize?: number;
  swatchWidth?: number;
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
