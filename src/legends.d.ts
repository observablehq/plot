import type {ScaleOptions} from "./scales.js";

export interface LegendOptions {
  color?: ScaleOptions | string;
  fill?: string;
  stroke?: string;
  opacity?: ScaleOptions;
  symbol?: ScaleOptions;
}

export function legend(options?: LegendOptions): HTMLElement;
