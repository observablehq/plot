import type {GeoPermissibleObjects, GeoStreamWrapper} from "d3";
import type {InsetOptions} from "./inset.js";

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

export interface ProjectionOptions extends InsetOptions {
  /**
   * When specified as a name, the projection is automatically scaled and
   * translated to make its **domain** fit the frame’s size (with any insets
   * discounted). If specified as a function, it receives a configuration object
   * ({width, height, ...options}) that must return an instantiated projection.
   *
   * For example, to use the [Bertin 1953 projection](https://observablehq.com/@d3/geo-bertin-1953):
   *
   * ```js
   * {type: ({width, height, domain}) => d3.geoBertin1953().fitSize([width, height], domain)}
   * ```
   */
  type?: ProjectionName | ProjectionFactory | null;

  /**
   * A GeoJSON object to fit to the frame’s dimensions (width and height, minus
   * any insets). The default for spherical projections is the Sphere (outline
   * of the the whole globe).
   */
  domain?: GeoPermissibleObjects;

  /**
   * A rotation of the sphere before projection. Specified as Euler angles λ
   * (yaw, or reference longitude), φ (pitch, or reference latitude), and
   * optionally γ (roll), in degrees.
   */
  rotate?: [x: number, y: number, z?: number];

  /**
   * The [standard
   * parallels](https://github.com/d3/d3-geo/blob/main/README.md#conic_parallels)
   * (for conic projections only).
   */
  parallels?: [y1: number, y2: number];

  /**
   * The projection’s [sampling threshold](https://github.com/d3/d3-geo/blob/main/README.md#projection_precision).
   */
  precision?: number;

  /**
   * The projection’s clipping method. One of:
   *
   * * *frame* or true (default) - clip to the extent of the frame (including
   *   margins but not insets)
   * * a number - clip to a great circle of the given radius in degrees centered
   *   around the origin
   * * null or false - do not clip
   *
   * Some projections (such as
   * [armadillo](https://observablehq.com/@d3/armadillo) or
   * [berghaus](https://observablehq.com/@d3/berghaus-star))) additionally
   * require path clipping: in that case set the marks’ **clip** option to
   * *sphere*.
   */
  clip?: boolean | number | "frame" | null;
}
