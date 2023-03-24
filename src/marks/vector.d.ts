import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";

/** The built-in vector shape implementations. */
export type VectorShapeName = "arrow" | "spike";

/** A vector shape implementation. */
export interface VectorShapeImplementation {
  /** Draws a shape of the given *length* and *radius* to the given *context*. */
  draw(context: CanvasPath, length: number, radius: number): void;
}

/** How to draw a vector. */
export type VectorShape = VectorShapeName | VectorShapeImplementation;

/** Options for the vector mark. */
export interface VectorOptions extends MarkOptions {
  /**
   * The horizontal position of the vector’s anchor point; an optional channel
   * bound to the *x* scale. Default depends on the **frameAnchor**.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position of the vector’s anchor point; an optional channel
   * bound to the *y* scale. Default depends on the **frameAnchor**.
   */
  y?: ChannelValueSpec;

  /**
   * The vector shape’s radius, such as half the width of the *arrow*’s head or
   * the *spike*’s base; a constant number in pixels. Defaults to 3.5 pixels.
   */
  r?: number;

  /**
   * The vector’s length; either an optional channel bound to the *length* scale
   * or a constant number in pixels. Defaults to 12 pixels.
   */
  length?: ChannelValueSpec;

  /**
   * The vector’s orientation (rotation angle); either a constant number in
   * degrees clockwise, or an optional channel (with no associated scale).
   * Defaults to 0 degrees with the vector pointing up; positive angles proceed
   * clockwise.
   */
  rotate?: ChannelValue;

  /** The shape of the vector; a constant. Defaults to *arrow*. */
  shape?: VectorShape;

  /**
   * The vector’s position along its orientation relative to its anchor point; a
   * constant. Assuming a default **rotate** angle of 0°, one of:
   *
   * - *start* - from [*x*, *y*] to [*x*, *y* - *l*]
   * - *middle* (default) - from [*x*, *y* + *l* / 2] to [*x*, *y* - *l* / 2]
   * - *end* - from [*x*, *y* + *l*] to [*x*, *y*]
   *
   * where [*x*, *y*] is the vector’s anchor point and *l* is the vector’s
   * (possibly scaled) length in pixels.
   */
  anchor?: "start" | "middle" | "end";

  /**
   * The vector’s frame anchor, to default **x** and **y** relative to the
   * frame; a constant representing one of the frame corners (*top-left*,
   * *top-right*, *bottom-right*, *bottom-left*), sides (*top*, *right*,
   * *bottom*, *left*), or *middle* (default). Has no effect if both **x** and
   * **y** are specified.
   */
  frameAnchor?: FrameAnchor;
}

/**
 * Returns a new vector mark for the given *data* and *options*. For example, to
 * create a vector field from spatial samples of wind observations:
 *
 * ```js
 * Plot.vector(wind, {x: "longitude", y: "latitude", length: "speed", rotate: "direction"})
 * ```
 *
 * If none of **frameAnchor**, **x**, and **y** are specified, then **x** and
 * **y** default to accessors assuming that *data* contains tuples [[*x₀*,
 * *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …]
 */
export function vector(data?: Data, options?: VectorOptions): Vector;

/**
 * Like vector, but **x** instead defaults to the identity function and **y**
 * defaults to null, assuming that *data* is an array of numbers [*x₀*, *x₁*,
 * *x₂*, …].
 */
export function vectorX(data?: Data, options?: VectorOptions): Vector;

/**
 * Like vector, but **y** instead defaults to the identity function and **x**
 * defaults to null, assuming that *data* is an array of numbers [*y₀*, *y₁*,
 * *y₂*, …].
 */
export function vectorY(data?: Data, options?: VectorOptions): Vector;

/**
 * Like vector, but with default *options* suitable for drawing a spike map. For
 * example, to show city populations:
 *
 * ```js
 * Plot.spike(cities, {x: "longitude", y: "latitude", stroke: "red", length: "population"})
 * ```
 */
export function spike(data?: Data, options?: VectorOptions): Vector;

/** The vector mark. */
export class Vector extends RenderableMark {}
