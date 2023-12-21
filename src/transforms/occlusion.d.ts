import type {ChannelValueSpec} from "../channel.js";
import type {Initialized} from "./basic.js";

/** Options for the occlusion transform. */
export interface OcclusionOptions {
  /**
   * A constant in pixels describing the minimum distance between two nodes.
   * Defaults to 11.
   */
  minDistance?: number;
}

/** Options for the occlusionX transform. */
export interface OcclusionXOptions extends OcclusionOptions {
  /**
   * The vertical position. Nodes sharing the same vertical position will be
   * rearranged horizontally together.
   */
  y?: ChannelValueSpec;
}

/** Options for the occlusionY transform. */
export interface OcclusionYOptions extends OcclusionOptions {
  /**
   * The horizontal position. Nodes sharing the same horizontal position will be
   * rearranged vertically together.
   */
  x?: ChannelValueSpec;
}

/**
 * Given an **x** position channel, rearranges the values in such a way that the
 * horizontal distance between nodes is greater than or equal to the minimum
 * distance, and their visual order preserved. Nodes that share the same
 * position and text are fused together.
 *
 * If *occlusionOptions* is a number, it is shorthand for the occlusion
 * **minDistance**.
 */
export function occlusionX<T>(options?: T & OcclusionXOptions): Initialized<T>;
export function occlusionX<T>(
  occlusionOptions?: OcclusionXOptions | OcclusionXOptions["minDistance"],
  options?: T
): Initialized<T>;

/**
 * Given a **y** position channel, rearranges the values in such a way that the
 * vertical distance between nodes is greater than or equal to the minimum
 * distance, and their visual order preserved. Nodes that share the same
 * position and text are fused together.
 *
 * If *occlusionOptions* is a number, it is shorthand for the occlusion
 * **minDistance**.
 */
export function occlusionY<T>(options?: T & OcclusionYOptions): Initialized<T>;
export function occlusionY<T>(
  dodgeOptions?: OcclusionYOptions | OcclusionYOptions["minDistance"],
  options?: T
): Initialized<T>;
