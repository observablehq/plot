import type {GeoPermissibleObjects} from "d3";
import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the geo mark. */
export interface GeoOptions extends MarkOptions {
  /**
   * A required channel for the geometry to render; defaults to identity,
   * assuming *data* is a GeoJSON object or an iterable of GeoJSON objects.
   */
  geometry?: ChannelValue;

  /**
   * The size of Point and MultiPoint geometries, defaulting to a constant 3
   * pixels. If **r** is a number, it is interpreted as a constant radius in
   * pixels; otherwise it is interpreted as a channel and the effective radius
   * is controlled by the *r* scale, which defaults to a *sqrt* scale such that
   * the visual area of a point is proportional to its associated value.
   *
   * If **r** is a channel, geometries will be sorted by descending radius by
   * default, to limit occlusion; use the **sort** transform to control render
   * order. Geometries with a nonpositive radius are not drawn.
   */
  r?: ChannelValueSpec;
}

/**
 * Returns a new geo mark with the given *data* and *options*. The **geometry**
 * channel, which defaults to the identity function assuming that *data* is a
 * GeoJSON object or an iterable of GeoJSON objects, is projected to the plane
 * using the plot’s top-level **projection**. For example, for a choropleth map
 * of county polygons with a *rate* property:
 *
 * ```js
 * Plot.geo(counties, {fill: (d) => d.properties.rate})
 * ```
 *
 * If *data* is a GeoJSON feature collection, then the mark’s data is
 * *data*.features; if *data* is a GeoJSON geometry collection, then the mark’s
 * data is *data*.geometries; if *data* is some other GeoJSON object, then the
 * mark’s data is the single-element array [*data*].
 */
export function geo(data?: Data | GeoPermissibleObjects, options?: GeoOptions): Geo;

/**
 * Returns a new geo mark whose *data* is the outline of the sphere on the
 * projection’s plane. (For use with a spherical **projection** only.)
 */
export function sphere(options?: GeoOptions): Geo;

/**
 * Returns a new geo mark whose *data* is a 10° global graticule. (For use with
 * a spherical **projection** only.) For more control, use [d3.geoGraticule][1]
 * with the geo mark.
 *
 * [1]: https://github.com/d3/d3-geo/blob/main/README.md#geoGraticule
 */
export function graticule(options?: GeoOptions): Geo;

/** The geo mark. */
export class Geo extends RenderableMark {}
