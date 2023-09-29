import type {ChannelReducers, ChannelValue} from "../channel.js";
import type {Initialized} from "./basic.js";

/** Options for the hexbin transform. */
export interface HexbinOptions {
  /**
   * The distance between centers of neighboring hexagons, in pixels; defaults
   * to 20.
   */
  binWidth?: number;

  /**
   * How to subdivide bins. If not specified, defaults to the *fill* channel, if
   * any, or the *stroke* channel, if any. If null, bins will not be subdivided.
   */
  z?: ChannelValue;
}

/**
 * Bins hexagonally on the scaled **x** and **y** channels; then subdivides bins
 * on the first channel of **z**, **fill**, or **stroke**, if any; and lastly
 * for each channel in the specified *outputs*, applies the corresponding
 * *reduce* method to produce new channel values from the binned input channel
 * values. Each *reduce* method may be one of:
 *
 * - a named reducer implementation such as *count* or *sum*
 * - a function that takes an array of values and returns the reduced value
 * - an object that implements the *reduceIndex* method
 *
 * For example, for a heatmap of observed culmen lengths and depths:
 *
 * ```js
 * Plot.dot(penguins, Plot.hexbin({fill: "count"}, {x: "culmen_depth_mm", y: "culmen_length_mm"}))
 * ```
 *
 * The hexbin transform can be applied to any mark that consumes **x** and
 * **y**, such as the dot, image, text, and vector marks; it is intended for
 * aggregating continuous quantitative or temporal data, such as temperatures or
 * times, into discrete hexagonal bins. For the dot mark, the **symbol** option
 * defaults to *hexagon*, and the *r* option defaults to half the **binWidth**.
 * If a **fill** output channel is declared, the **stroke** option defaults to
 * *none*.
 *
 * To draw empty hexagons, see the hexgrid mark.
 */
export function hexbin<T>(outputs?: ChannelReducers, options?: T & HexbinOptions): Initialized<T>;
