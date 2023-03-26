import type {GeoPermissibleObjects} from "d3";
import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the geo mark. */
export interface GeoOptions extends MarkOptions {
  /**
   * A channel for the geometry to render; defaults to identity, assuming *data*
   * is a GeoJSON object or an iterable of GeoJSON objects.
   */
  geometry?: ChannelValue;
  /**
   * The size of Point and MultiPoint geometries, defaults to 3 pixels. When
   * **r** is specified as a number, it is interpreted as a constant radius in
   * pixels; otherwise it is interpreted as a channel and the effective radius
   * is controlled by the *r* scale. As with the **dot** mark, the *r* scale
   * defaults to a *sqrt* scale such that the visual area of a point is
   * proportional to its associated value. Geometries with a nonpositive radius
   * are not drawn. If **r** is a channel, geometries will be sorted by
   * descending radius by default, to limit occlusion.
   */
  r?: ChannelValueSpec;
}

/**
 * Returns a new geo mark with the given *data* and *options*.
 *
 * ```js
 * Plot.geo(counties, {fill: d => d.properties.rate})
 * ```
 *
 * If *data* is a GeoJSON feature collection, then the mark’s data is
 * *data*.features; if *data* is a GeoJSON geometry collection, then the mark’s
 * data is *data*.geometries; if *data* is some other GeoJSON object, then the
 * mark’s data is the single-element array [*data*]. If the **geometry** option
 * is not specified, *data* is assumed to be a GeoJSON object or an iterable of
 * GeoJSON objects.
 *
 * The geometries are projected to the plane using the plot’s top-level
 * **projection**.
 *
 * In addition to the standard mark options, the **r** option controls the size
 * of Point and MultiPoint geometries. It can be specified as either a channel
 * or constant. When **r** is specified as a number, it is interpreted as a
 * constant radius in pixels; otherwise it is interpreted as a channel and the
 * effective radius is controlled by the *r* scale.
 *
 */
export function geo(data?: Data | GeoPermissibleObjects, options?: GeoOptions): Geo;

/**
 * The outline of the sphere on the projection’s plane. (Spherical projections
 * only.)
 */
export function sphere(options?: GeoOptions): Geo;

/**
 * Shorthand for a 10° global graticule. (Spherical projections only.) For more
 * control, use [d3.geoGraticule][1] with the **geo** mark.
 *
 * [1]: https://github.com/d3/d3-geo/blob/main/README.md#geoGraticule
 */
export function graticule(options?: GeoOptions): Geo;

/** The geo mark. */
export class Geo extends RenderableMark {}
