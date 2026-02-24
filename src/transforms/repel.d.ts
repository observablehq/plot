import type {ChannelValueSpec} from "../channel.js";
import type {Initialized} from "./basic.js";

/** Options for the repel transform. */
export interface RepelOptions {
  /**
   * A constant in pixels describing the minimum distance between two nodes.
   * Defaults to 11.
   */
  minDistance?: number;
}

/** Options for the repelX transform. */
export interface RepelXOptions extends RepelOptions {
  /**
   * The vertical position. Nodes sharing the same vertical position will be
   * rearranged horizontally together.
   */
  y?: ChannelValueSpec;
}

/** Options for the repelY transform. */
export interface RepelYOptions extends RepelOptions {
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
 * If *repelOptions* is a number, it is shorthand for the repel
 * **minDistance**.
 */
export function repelX<T>(options?: T & RepelXOptions): Initialized<T>;
export function repelX<T>(repelOptions?: RepelXOptions | RepelXOptions["minDistance"], options?: T): Initialized<T>;

/**
 * Given a **y** position channel, rearranges the values in such a way that the
 * vertical distance between nodes is greater than or equal to the minimum
 * distance, and their visual order preserved. Nodes that share the same
 * position and text are fused together.
 *
 * If *repelOptions* is a number, it is shorthand for the repel
 * **minDistance**.
 */
export function repelY<T>(options?: T & RepelYOptions): Initialized<T>;
export function repelY<T>(dodgeOptions?: RepelYOptions | RepelYOptions["minDistance"], options?: T): Initialized<T>;
