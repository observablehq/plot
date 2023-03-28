import type {GeoPermissibleObjects, GeoStreamWrapper} from "d3";
import type {InsetOptions} from "./inset.js";

/**
 * The built-in projection implementations; one of:
 *
 * - *albers-usa* - a U.S.-centric composite projection with insets for Alaska and Hawaii
 * - *albers* - a U.S.-centric *conic-equal-area* projection
 * - *azimuthal-equal-area* - the azimuthal equal-area projection
 * - *azimuthal-equidistant* - the azimuthal equidistant projection
 * - *conic-conformal* - the conic conformal projection
 * - *conic-equal-area* - the conic equal-area projection
 * - *conic-equidistant* - the conic equidistant projection
 * - *equal-earth* - the Equal Earth projection Šavrič et al., 2018
 * - *equirectangular* - the equirectangular (plate carrée) projection
 * - *gnomonic* - the gnomonic projection
 * - *identity* - the identity projection
 * - *reflect-y* - the identity projection, but flipping *y*
 * - *mercator* - the spherical Mercator projection
 * - *orthographic* - the orthographic projection
 * - *stereographic* - the stereographic projection
 * - *transverse-mercator* - the transverse spherical Mercator projection
 */
export type ProjectionName =
  | "albers-usa"
  | "albers"
  | "azimuthal-equal-area"
  | "azimuthal-equidistant"
  | "conic-conformal"
  | "conic-equal-area"
  | "conic-equidistant"
  | "equal-earth"
  | "equirectangular"
  | "gnomonic"
  | "identity"
  | "reflect-y"
  | "mercator"
  | "orthographic"
  | "stereographic"
  | "transverse-mercator";

/** An instantiated projection, implementing a stream method.  */
export type ProjectionImplementation = GeoStreamWrapper;

/** A function returning an instantiated projection.  */
export type ProjectionFactory = (options: any) => ProjectionImplementation;

/** Options for projection. */
export interface ProjectionOptions extends InsetOptions {
  /**
   * The desired projection; one of:
   *
   * - a named built-in projection such as *albers-usa*
   * - a function that returns a projection implementation
   * - null, for no projection
   *
   * When specified as a name, the projection is scaled and translated to fit
   * the **domain** to the plot’s frame (minus insets). If a function, it
   * receives a configuration object ({width, height, ...options}) and must
   * return an object that implements the *projection*.stream method.
   *
   * For example, to use the [Bertin 1953 projection][1]:
   *
   * ```js
   * {type: ({width, height, domain}) => d3.geoBertin1953().fitSize([width, height], domain)}
   * ```
   *
   * [1]: https://observablehq.com/@d3/geo-bertin-1953
   */
  type?: ProjectionName | ProjectionFactory | null;

  /**
   * A GeoJSON object to fit to the plot’s frame (minus insets); defaults to a
   * Sphere for spherical projections (outline of the the whole globe).
   */
  domain?: GeoPermissibleObjects;

  /**
   * A rotation of the sphere before projection; defaults to [0, 0, 0].
   * Specified as Euler angles λ (yaw, or reference longitude), φ (pitch, or
   * reference latitude), and optionally γ (roll), in degrees.
   */
  rotate?: [x: number, y: number, z?: number];

  /**
   * The [standard parallels][1]. For conic projections only.
   *
   * [1]: https://github.com/d3/d3-geo/blob/main/README.md#conic_parallels
   */
  parallels?: [y1: number, y2: number];

  /**
   * The projection’s [sampling threshold][1].
   *
   * [1]: https://github.com/d3/d3-geo/blob/main/README.md#projection_precision
   */
  precision?: number;

  /**
   * The projection’s clipping method; one of:
   *
   * - *frame* or true (default) - clip to the plot’s frame (including margins but not insets)
   * - a number - clip to a circle of the given radius in degrees centered around the origin
   * - null or false - do not clip
   *
   * Some projections (such as [*armadillo*][1] and [*berghaus*][2]) require
   * spherical clipping: in that case set the marks’ **clip** option to
   * *sphere*.
   *
   * [1]: https://observablehq.com/@d3/armadillo
   * [2]: https://observablehq.com/@d3/berghaus-star
   */
  clip?: boolean | number | "frame" | null;
}
