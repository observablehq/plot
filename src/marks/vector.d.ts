import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";

export type VectorShapeName = "arrow" | "spike";

/**
 * A custom vector shape implementation.
 */
export interface VectorShapeImplementation {
  draw(context: CanvasPath, length: number, radius: number): void;
}

export type VectorShape = VectorShapeName | VectorShapeImplementation;

export interface VectorOptions extends MarkOptions {
  /** A channel for the horizontal position. */
  x?: ChannelValueSpec;
  /** A channel for the vertical position. */
  y?: ChannelValueSpec;
  /**
   * The radius channel (in pixels) describes the mark’s secondary dimension
   * (typically the *arrow* head’s span, or the *spike*’s base).
   */
  r?: ChannelValueSpec;
  /**
   * The length of the shape, typically associated with a linear *length* scale.
   */
  length?: ChannelValueSpec;
  /** Vector rotation, in degrees; with rotate = 0, the shape points up. */
  rotate?: ChannelValue;
  /** Vector shape, as a name (*arrow* or *spike*), or as a custom implementation. */
  shape?: VectorShape;
  /** Vector anchor; by default a vector is anchored at its base (*start*). */
  anchor?: "start" | "middle" | "end";
  /**
   * The frame anchor, for vectors without a position, or positioned on a single
   * (*x* or *y*) dimension in a two-dimensional frame.
   */
  frameAnchor?: FrameAnchor;
}

/**
 * A vector of the given **length**, drawn in the **shape** of an arrow from its
 * **anchor** at the given [**x**, **y**] position, and an orientation indicated
 * by **rotate**. To create a vector field representing a wind map:
 *
 * ```js
 * Plot.vector(wind, {x: "longitude", y: "latitude", length: "speed", rotate: "direction"})
 * ```
 *
 * By default, accepts an array of coordinates pairs (tuples) as *data*.
 */
export function vector(data?: Data, options?: VectorOptions): Vector;

/**
 * The vector mark, but the **x** channel defaults to identity, positioning one
 * arrow for each horizontal position passed as *data*.
 */
export function vectorX(data?: Data, options?: VectorOptions): Vector;

/**
 * The vector mark, but the **y** channel defaults to identity, positioning one
 * arrow for each vertical position passed as *data*.
 */
export function vectorY(data?: Data, options?: VectorOptions): Vector;

/**
 * A variant of the vector mark where the **shape** defaults to *spike*, the
 * **stroke** defaults to *currentColor*, the **strokeWidth** defaults to 1, the
 * **fill** defaults to **stroke**, the **fillOpacity** defaults to 0.3, and the
 * **anchor** defaults to *start*. Typically used to create a spike map:
 *
 * ```js
 * Plot.spike(counties, {stroke: "red", length: "population"})
 * ```
 */
export function spike(data?: Data, options?: VectorOptions): Vector;

/** The vector mark */
export class Vector extends RenderableMark {}
