import type {ChannelTransform, ChannelValue} from "../channel.js";
import type {Initialized} from "./basic.js";

/** Options for the centroid and geoCentroid transforms. */
export interface CentroidOptions {
  /**
   * A channel supplying GeoJSON geometry; defaults to the identity transform,
   * assuming that the data is GeoJSON geometry.
   */
  geometry?: ChannelValue;
}

/**
 * Given a **geometry** input channel of GeoJSON geometry, derives **x** and
 * **y** output channels representing the planar (projected) centroids of the
 * geometry. The centroids are computed in screen coordinates according to the
 * plot’s associated **projection** (or *x* and *y* scales), if any.
 *
 * For centroids of spherical geometry, see Plot.geoCentroid.
 */
export function centroid<T>(options?: T & CentroidOptions): Initialized<T>;

/**
 * Given a **geometry** input channel of spherical GeoJSON geometry, derives
 * **x** and **y** output channels representing the spherical centroids of the
 * geometry.
 *
 * For planar (projected) centroids, see Plot.centroid.
 */
export function geoCentroid<T>(options?: T & CentroidOptions): T & {x: ChannelTransform; y: ChannelTransform};
