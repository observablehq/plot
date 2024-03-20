import type {Initialized} from "./basic.js";

/** Options for the decimate transform. */
export interface DecimateOptions {
  /**
   * The size of the decimation pixel. Defaults to 0.5, taking into account
   * high-density displays.
   */
  pixelSize?: number;
}

/**
 * Decimates a series by grouping consecutive points that share the same
 * horizontal position (quantized by **pixelSize**), then retaining in each
 * group a subset that includes the first and last points, and any other point
 * necessary to cover the minimum and the maximum scaled values of the **x** and
 * **y** channels. Additionally, the second and penultimate points are retained
 * when the options specify a **curve** that is not guaranteed to behave
 * monotonically.
 *
 * Decimation simplifies grouped marks by filtering out most of the points that
 * do not bring any visual change to the generated path. This enables the
 * rendering of _e.g._ time series with potentially millions of points as a path
 * with a moderate size.
 *
 * ```js
 * Plot.lineY(d3.cumsum({ length: 1_000_000 }, d3.randomNormal()), Plot.decimateX())
 * ```
 *
 * The decimateX transform can be applied to any mark that consumes **x** and
 * **y**, and is applied by default to the areaY, differenceY and lineY marks.
 */
export function decimateX<T>(options?: T & DecimateOptions): Initialized<T>;

/**
 * Decimates a series by grouping consecutive points that share the same
 * vertical position (quantized by **pixelSize**), then retaining in each group
 * a subset that includes the first and last points, and any other point
 * necessary to cover the minimum and the maximum scaled values of the **x** and
 * **y** channels. Additionally, the second and penultimate points are retained
 * when the options specify a **curve** that is not guaranteed to behave
 * monotonically.
 *
 * Decimation simplifies grouped marks by filtering out most of the points that
 * do not bring any visual change to the generated path. This enables the
 * rendering of _e.g._ time series with potentially millions of points as a path
 * with a moderate size.
 *
 * ```js
 * Plot.lineX(d3.cumsum({ length: 1_000_000 }, d3.randomNormal()), Plot.decimateY())
 * ```
 *
 * The decimateY transform can be applied to any mark that consumes **x** and
 * **y**, and is applied by default to the areaX and lineX marks.
 */
export function decimateY<T>(options?: T & DecimateOptions): Initialized<T>;
