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

  // shared options
  tickFormat?: ScaleOptions["tickFormat"];
  fontVariant?: ScaleOptions["fontVariant"];

  /** Custom styles to override Plot’s defaults. */
  style?: string | Partial<CSSStyleDeclaration> | null;

  /**
   * The generated element’s class name used for Plot’s default stylesheet; by
   * default, a random string prefixed with “plot-”.
   */
  className?: string | null;

  // opacity options
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

export function legend(options?: LegendScales): HTMLElement;
