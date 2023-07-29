import type {CompoundMark, Data, MarkOptions} from "../mark.js";
import type {Map} from "../transforms/map.js";
import type {AreaXOptions, AreaYOptions} from "./area.js";
import type {LineXOptions, LineYOptions} from "./line.js";

/** Options for the bollinger marks. */
export interface BollingerOptions {
  /** The number of consecutive values in the window; defaults to 20. */
  n?: number;

  /** The number of standard deviations to offset the bands; defaults to 2. */
  k?: number;

  /**
   * Shorthand for setting both **fill** and **stroke**; affects the stroke of
   * the line and the fill of the area; defaults to *currentColor*.
   */
  color?: MarkOptions["stroke"];
}

/** Options for the bollingerBandX mark. */
export type BollingerXOptions = BollingerOptions & AreaXOptions & LineXOptions;

/** Options for the bollingerBandY mark. */
export type BollingerYOptions = BollingerOptions & AreaYOptions & LineYOptions;

/** TODO */
export function bollingerX(data?: Data, options?: BollingerXOptions): CompoundMark;

/** TODO */
export function bollingerY(data?: Data, options?: BollingerYOptions): CompoundMark;

/** TODO */
export function bollinger(n: number, k: number): Map;
