import type {ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/**
 * The built-in spatial interpolation methods; one of:
 *
 * - *nearest* - assign each pixel to the closest sample’s value (Voronoi diagram)
 * - *barycentric* - apply barycentric interpolation over the Delaunay triangulation
 * - *random-walk* - apply a random walk from each pixel, stopping when near a sample
 */
export type RasterInterpolateName = "nearest" | "barycentric" | "random-walk";

/**
 * A spatial interpolation implementation function that receives samples’
 * positions and values and returns a flat array of *width*×*height* values.
 * *x*[*index*[0]] represents the *x*-position of the first sample,
 * *y*[*index*[0]] its *y*-position, and *value*[*index*[0]] its value (*e.g.*,
 * the observed height for a topographic map).
 */
export type RasterInterpolateFunction = (
  /** An array of numeric indexes into the channels *x*, *y*, *value*. */
  index: number[],
  /** The width of the raster grid in pixels; a positive integer. */
  width: number,
  /** The height of the raster grid in pixels; a positive integer. */
  height: number,
  /** An array of values representing the *x*-position of samples. */
  x: number[],
  /** An array of values representing the *y*-position of samples. */
  y: number[],
  /** An array of values representing the sample’s observed value. */
  values: any[]
) => any[];

/**
 * A spatial interpolation method; either a named built-in interpolation method,
 * or a custom interpolation function.
 */
export type RasterInterpolate = RasterInterpolateName | RasterInterpolateFunction;

/**
 * A source of pseudo-random numbers in [0, 1). The default source is seeded to
 * ensure reproducibility.
 */
export type RandomSource = () => number;

/**
 * A sampler function, which returns a value for the given *x* and *y* values in
 * the current *facet*.
 */
export type RasterSampler = (
  /** The horizontal position. */
  x: number,
  /** The vertical position. */
  y: number,
  /** The current facet index, and corresponding *fx* and *fy* value. */
  facet: number[] & {fx: any; fy: any}
) => any;

/** Options for the raster mark. */
export interface RasterOptions extends Omit<MarkOptions, "fill" | "fillOpacity"> {
  /** The horizontal position channel, typically bound to the *x* scale. */
  x?: ChannelValueSpec;
  /** The vertical position channel, typically bound to the *y* scale. */
  y?: ChannelValueSpec;

  /**
   * The starting horizontal position (typically the left edge) of the raster
   * domain; the lower bound of the *x* scale.
   *
   * If **width** is specified, defaults to 0; otherwise, if *data* is
   * specified, defaults to the frame’s left coordinate in *x*. If *data* is not
   * specified (as when **value** is a function of *x* and *y*), you must
   * specify **x1** explicitly.
   */
  x1?: number;

  /**
   * The ending horizontal position (typically the right edge) of the raster
   * domain; the upper bound of the *x* scale.
   *
   * If **width** is specified, defaults to **width**; otherwise, if *data* is
   * specified, defaults to the frame’s right coordinate in *x*. If *data* is
   * not specified (as when **value** is a function of *x* and *y*), you must
   * specify **x2** explicitly.
   */
  x2?: number;

  /**
   * The starting vertical position (typically the bottom edge) of the raster
   * domain; the lower bound of the *y* scale.
   *
   * If **height** is specified, defaults to 0; otherwise, if *data* is
   * specified, defaults to the frame’s top coordinate in *y*. If *data* is not
   * specified (as when **value** is a function of *x* and *y*), you must
   * specify **y1** explicitly.
   */
  y1?: number;

  /**
   * The ending vertical position (typically the bottom edge) of the raster
   * domain; the lower bound of the *y* scale.
   *
   * If **height** is specified, defaults to **height**; otherwise, if *data* is
   * specified, defaults to the frame’s bottom coordinate in *y*. If *data* is
   * not specified (as when **value** is a function of *x* and *y*), you must
   * specify **y2** explicitly.
   */
  y2?: number;

  /** The width (number of columns) of the raster grid, in actual pixels. */
  width?: number;

  /** The height (number of rows) of the raster grid, in actual pixels. */
  height?: number;

  /**
   * The effective screen size of a raster pixel, used to determine the height
   * and width of the raster from the frame’s dimensions; defaults to 1.
   */
  pixelSize?: number;

  /**
   * A non-negative pixel radius for smoothing; defaults to 0. Note that
   * blurring is applied on the values (before the color scale is applied) if
   * quantitative, and after (on the materialized pixels), if ordinal.
   */
  blur?: number;

  /**
   * The spatial interpolation method, when using *data* samples. One of:
   *
   * - *none* (or null, default) - assign each sample to the containing pixel
   * - a named interpolation method, such as *nearest*, *barycentric*, or *random-walk*
   * - a custom interpolation function
   */
  interpolate?: RasterInterpolate | "none" | null;

  /**
   * The [image-rendering attribute][1]; defaults to *auto* (bilinear). The
   * option may be set to *pixelated* to disable bilinear interpolation for a
   * sharper image; however, note that this is not supported in WebKit.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/image-rendering
   */
  imageRendering?: string;

  /**
   * The fill, typically bound to the *color* scale. Can be specified as a
   * constant, a channel based on the sample *data*, or as a function *f*(*x*,
   * *y*) to be evaluated at each pixel if the *data* is not provided.
   */
  fill?: ChannelValueSpec | RasterSampler;

  /**
   * The opacity, typically bound to the *opacity* scale. Can be specified as a
   * constant, a channel based on the sample *data*, or as a function *f*(*x*,
   * *y*) to be evaluated at each pixel if the *data* is not provided.
   */
  fillOpacity?: ChannelValueSpec | RasterSampler;
}

/**
 * Returns a raster mark which renders a raster image from spatial samples. If
 * *data* is provided, it represents discrete samples in abstract coordinates
 * **x** and **y**; the **fill** and **fillOpacity** channels specify further
 * abstract values (_e.g._, height in a topographic map) to be spatially
 * interpolated to produce an image.
 *
 * ```js
 * Plot.raster(volcano.values, {width: volcano.width, height: volcano.height})
 * ```
 *
 * The **fill** and **fillOpacity** channels may alternatively be specified as
 * functions *f*(*x*, *y*) to be evaluated at each pixel centroid of the raster
 * grid (without interpolation).
 *
 * ```js
 * Plot.raster({x1: -1, x2: 1, y1: -1, y2: 1, fill: (x, y) => Math.atan2(y, x)})
 * ```
 *
 * If **width** is specified, **x1** defaults to 0 and **x2** defaults to
 * **width**; likewise, if **height** is specified, **y1** defaults to 0 and
 * **y2** defaults to **height**. Otherwise, if *data* is specified, **x1**,
 * **y1**, **x2**, and **y2** respectively default to the frame’s left, top,
 * right, and bottom coordinates. Lastly, if *data* is not specified (as when
 * **value** is a function of *x* and *y*), you must specify all of **x1**,
 * **x2**, **y1**, and **y2** to define the raster domain.
 */
export function raster(data?: Data, options?: RasterOptions): Raster;
export function raster(options?: RasterOptions): Raster;

/**
 * Applies a simple forward mapping of samples, binning them into pixels in the
 * raster grid without any blending or interpolation. If multiple samples map to
 * the same pixel, the last one wins; this can introduce bias if the points are
 * not in random order, so use Plot.shuffle to randomize the input if needed.
 */
export const interpolateNone: RasterInterpolateFunction;

/**
 * Constructs a Delaunay triangulation of the samples, and then for each pixel
 * in the raster grid, determines the triangle that covers the pixel’s centroid
 * and interpolates the values associated with the triangle’s vertices using
 * [barycentric coordinates][1]. If the interpolated values are ordinal or
 * categorical (_i.e._, anything other than numbers or dates), then one of the
 * three values will be picked randomly weighted by the barycentric coordinates;
 * the given *random* number generator will be used, which defaults to a [linear
 * congruential generator][2] with a fixed seed (for deterministic results).
 *
 * [1]: https://en.wikipedia.org/wiki/Barycentric_coordinate_system
 * [2]: https://github.com/d3/d3-random/blob/main/README.md#randomLcg
 */
export function interpolatorBarycentric(options?: {random?: RandomSource}): RasterInterpolateFunction;

/**
 * Assigns each pixel in the raster grid the value of the closest sample;
 * effectively a Voronoi diagram.
 */
export const interpolateNearest: RasterInterpolateFunction;

/**
 * For each pixel in the raster grid, initiates a random walk, stopping when
 * either the walk is within a given distance (**minDistance**) of a sample or
 * the maximum allowable number of steps (**maxSteps**) have been taken, and
 * then assigning the current pixel the closest sample’s value. The random walk
 * uses the “walk on spheres” algorithm in two dimensions described by [Sawhney
 * and Crane][1], SIGGRAPH 2020.
 *
 * [1]: https://www.cs.cmu.edu/~kmcrane/Projects/MonteCarloGeometryProcessing/index.html
 */
export function interpolatorRandomWalk(options?: {
  /**
   * An optional source of pseudo-random numbers in [0, 1). Called at each step
   * of the random walk algorithm with arguments *x*, *y*, and *step*. If not
   * specified, defaults to a seeded random number generator.
   */
  random?: RandomSource;

  /**
   * The random walk ends by “snapping” to the closest sample if closer than
   * this distance (in pixels).
   */
  minDistance?: number;

  /**
   * After this number of steps, which defaults to 3, lift the **minDistance**
   * requirement and snap to the closest sample.
   */
  maxSteps?: number;
}): RasterInterpolateFunction;

/** The raster mark. */
export class Raster extends RenderableMark {}
