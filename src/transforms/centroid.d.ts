import type {ChannelTransform, ChannelValue} from "../channel.js";
import type {Initialized} from "./basic.js";

export interface CentroidOptions {
  geometry?: ChannelValue;
}

/**
 * The centroid initializer derives **x** and **y** channels representing the
 * planar (projected) centroids for the given GeoJSON geometry. If the
 * **geometry** option is not specified, the mark’s data is assumed to be
 * GeoJSON objects. See also Plot.geoCentroid.
 */
export function centroid<T>(options?: T & CentroidOptions): Initialized<T>;

/**
 * The geoCentroid transform derives **x** and **y** channels representing the
 * spherical centroids for the given GeoJSON geometry. If the **geometry**
 * option is not specified, the mark’s data is assumed to be GeoJSON objects.
 * See also Plot.centroid.
 */
export function geoCentroid<T>(options?: T & CentroidOptions): T & {x: ChannelTransform; y: ChannelTransform};
