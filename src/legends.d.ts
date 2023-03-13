import type {ScaleOptions} from "./scales.js";

export type LegendType = "ramp" | "swatches";

export interface LegendOptions {
  legend?: LegendType;

  // scale definitions
  color?: ScaleOptions | string;
  opacity?: ScaleOptions;
  symbol?: ScaleOptions;

  // shared options
  tickFormat?: ScaleOptions["tickFormat"];
  fontVariant?: ScaleOptions["fontVariant"];
  style?: string | Partial<CSSStyleDeclaration> | null;
  className?: string | null;

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

export function legend(options?: LegendOptions): HTMLElement;
