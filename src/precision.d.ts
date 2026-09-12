import type {ScaleType} from "./scales.js";

/** Internal d3 scale with type, as produced by createScaleFunctions. */
export interface MaterializedScale {
  (value: any): number;
  type: ScaleType;
  domain(): any[];
  range(): number[];
  invert(value: number): any;
}

/**
 * Returns a function that rounds values in data space to the coarsest
 * precision that distinguishes neighboring pixels. For temporal scales, finds
 * the coarsest calendar interval that spans at most 1px; for linear scales,
 * uses a uniform step; for non-linear scales (where the data density varies),
 * computes the step locally.
 */
export function pixelRound(scale: MaterializedScale): (value: any) => any;
