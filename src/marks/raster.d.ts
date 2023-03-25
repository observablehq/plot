import type {ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {Interval} from "../interval.js";

/** The built-in spatial interpolation methods. */
export type RasterInterpolateName = "nearest" | "barycentric" | "random-walk";

/**
 * A spatial interpolation implementation. A function that returns a flat array
 * of *width* × *height* values, with the following arguments:
 *
 * - *index* - an array of numeric indexes into the channels *x*, *y*, *value*
 * - *width* - the width of the raster grid; a positive integer
 * - *height* - the height of the raster grid; a positive integer
 * - *x* - an array of values representing the *x*-position of samples
 * - *y* - an array of values representing the *y*-position of samples
 * - *value* - an array of values representing the sample’s observed value
 *
 * So, *x*[*index*[0]] represents the *x*-position of the first sample,
 * *y*[*index*[0]] its *y*-position, and *value*[*index*[0]] its value (*e.g.*,
 * the observed height for a topographic map).
 */
export type RasterInterpolateFunction = (
  index: number[],
  width: number,
  height: number,
  X: number[],
  Y: number[],
  V: any[]
) => any[];

/** A spatial interpolation method. */
export type RasterInterpolate = RasterInterpolateName | RasterInterpolateFunction;

/**
 * A source of pseudo-random numbers in [0, 1). The default source is seeded to
 * ensure reproducibility.
 */
export type RandomSource = () => number;

/**
 * A sampler function, which returns a value for the given *x* and *y* values in
 * the current *facet*. For example, to create side-by-side color plots of two
 * functions of *x* and *y*:
 *
 * ```js
 * Plot.raster({
 *   fill: (x, y, {fx}) => fx(x) * y,
 *   fx: [Math.sin, Math.cos],
 *   x1: 0,
 *   y1: 0,
 *   x2: 4 * Math.PI,
 *   y2: 2,
 *   interval: 0.2
 * });
 * ```
 */
export type RasterSampler = (x: number, y: number, facet: number[] & {fx: any; fy: any}) => any;

/** Options for the raster mark. */
export interface RasterOptions extends Omit<MarkOptions, "fill" | "fillOpacity"> {
  /** The horizontal coordinate of a sample. */
  x?: ChannelValueSpec;
  /** The vertical coordinate of a sample. */
  y?: ChannelValueSpec;
  /**
   * The lower value of *x*, on the left edge of the raster (right edge if
   * reversed).
   */
  x1?: number;
  /**
   * The higher value of *x*, on the right edge of the raster (left edge if
   * reversed).
   */
  x2?: number;
  /**
   * The lower value of *y*, on the top edge of the raster (bottom edge if
   * reversed).
   */
  y1?: number;
  /**
   * The higher value of *y*, on the bottom edge of the raster (top edge if
   * reversed).
   */
  y2?: number;
  /**
   * The width of the raster grid, in actual columns of pixels. The grid might
   * be scaled to the frame’s dimensions.
   */
  width?: number;
  /**
   * The height of the raster grid, in actual rows of pixels. The grid might be
   * scaled to the frame’s dimensions.
   */
  height?: number;
  /**
   * The screen size of a raster pixel, used to determine the height and width
   * of the raster from the frame’s dimensions; defaults to 1
   */
  pixelSize?: number;
  /**
   * The sampling interval, used to determine the height and width of the raster
   * from the frame’s dimensions and the *x* and *y* extents.
   */
  interval?: Interval;
  /**
   * A non-negative pixel radius for smoothing; defaults to 0. Note that
   * blurring is applied on the values (before the color scale is applied) if
   * quantitative, and after (on the materialized pixels), if ordinal.
   */
  blur?: number;
  /**
   * The spatial interpolation method, when using *data* samples. One of:
   *
   * - *none* (or null) - assign each sample to the containing pixel
   * - *nearest* - assign each pixel to the closest sample’s value (Voronoi
   *   diagram)
   * - *barycentric* - apply barycentric interpolation over the Delaunay
   *   triangulation
   * - *random-walk* - apply a random walk from each pixel, stopping when near a
   *   sample
   * - a function - custom interpolation
   */
  interpolate?: RasterInterpolate | "none" | null;
  /**
   * The [image-rendering
   * attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/image-rendering);
   * defaults to *auto* (bilinear). The option may be set to *pixelated* to
   * disable bilinear interpolation for a sharper image; however, note that this
   * is not supported in WebKit
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
 * Returns a raster mark, which renders a raster image from spatial samples. If
 * data is provided, it represents discrete samples in abstract coordinates *x*
 * and *y*; the **fill** and **fillOpacity** channels specify further abstract
 * values (_e.g._, height in a topographic map) to be spatially interpolated to
 * produce an image.
 *
 * ```js
 * Plot.raster(volcano.values, {width: volcano.width, height: volcano.height})
 * ```
 *
 * The **fill** and **fillOpacity** channels may alternatively be specified as
 * functions *f*(*x*, *y*) to be evaluated at each pixel centroid of the raster
 * grid (without interpolation).
 *
 * The resolution of the rectangular raster image may be specified with the following options:
 *
 * * **width** - the number of pixels on each horizontal line
 * * **height** - the number of lines; a positive integer
 *
 * The raster dimensions may also be imputed from the extent of *x* and *y* and a pixel size:
 *
 * * **x1** - the starting horizontal position; bound to the *x* scale
 * * **x2** - the ending horizontal position; bound to the *x* scale
 * * **y1** - the starting vertical position; bound to the *y* scale
 * * **y2** - the ending vertical position; bound to the *y* scale
 * * **pixelSize** - the screen size of a raster pixel; defaults to 1
 */
export function raster(options?: RasterOptions): Raster;
export function raster(data?: Data, options?: RasterOptions): Raster;

/**
 * Applies a simple forward mapping of samples, binning them into pixels in the
 * raster grid without any blending or interpolation. If multiple samples map to
 * the same pixel, the last one wins; this can introduce bias if the points are
 * not in random order, so use Plot.**shuffle** to randomize the input if
 * needed.
 */
export const interpolateNone: RasterInterpolateFunction;

/**
 * Constructs a Delaunay triangulation of the samples, and then for each pixel
 * in the raster grid, determines the triangle that covers the pixel’s centroid
 * and interpolates the values associated with the triangle’s vertices using
 * [barycentric
 * coordinates](https://en.wikipedia.org/wiki/Barycentric_coordinate_system). If
 * the interpolated values are ordinal or categorical (_i.e._, anything other
 * than numbers or dates), then one of the three values will be picked randomly
 * weighted by the barycentric coordinates; the given *random* number generator
 * will be used, which defaults to a [linear congruential
 * generator](https://github.com/d3/d3-random/blob/main/README.md#randomLcg)
 * with a fixed seed (for deterministic results).
 */
export function interpolatorBarycentric(options?: {random?: RandomSource}): RasterInterpolateFunction;

/**
 * Assigns each pixel in the raster grid the value of the closest sample;
 * effectively a Voronoi diagram.
 */
export const interpolateNearest: RasterInterpolateFunction;

/**
 * For each pixel in the raster grid, initiates a random walk, stopping when
 * either the walk is within a given distance (*minDistance*) of a sample or the
 * maximum allowable number of steps (*maxSteps*) have been taken, and then
 * assigning the current pixel the closest sample’s value. The random walk uses
 * the “walk on spheres” algorithm in two dimensions described by [Sawhney and
 * Crane](https://www.cs.cmu.edu/~kmcrane/Projects/MonteCarloGeometryProcessing/index.html),
 * SIGGRAPH 2020.
 */
export function interpolatorRandomWalk(options?: {
  random?: RandomSource;
  minDistance?: number;
  maxSteps?: number;
}): RasterInterpolateFunction;

/** The raster mark. */
export class Raster extends RenderableMark {}
