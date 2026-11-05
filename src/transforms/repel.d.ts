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
   * The vertical position. Nodes that share a vertical position form a series;
   * each series is repelled separately.
   */
  y?: ChannelValueSpec;
}

/** Options for the repelY transform. */
export interface RepelYOptions extends RepelOptions {
  /**
   * The horizontal position. Nodes that share a horizontal position form a
   * series; each series is repelled separately.
   */
  x?: ChannelValueSpec;
}

/**
 * Given an **x** position channel, moves nodes apart horizontally so that
 * adjacent nodes are at least **minDistance** pixels apart, keeping their
 * order. The **y** position, if any, is not changed.
 *
 * If *repelOptions* is a number, it is shorthand for the repel
 * **minDistance**.
 */
export function repelX<T>(options?: T & RepelXOptions): Initialized<T>;
export function repelX<T>(repelOptions?: RepelXOptions | RepelXOptions["minDistance"], options?: T): Initialized<T>;

/**
 * Given a **y** position channel, moves nodes apart vertically so that adjacent
 * nodes are at least **minDistance** pixels apart, keeping their order. The
 * **x** position, if any, is not changed.
 *
 * If *repelOptions* is a number, it is shorthand for the repel
 * **minDistance**.
 */
export function repelY<T>(options?: T & RepelYOptions): Initialized<T>;
export function repelY<T>(repelOptions?: RepelYOptions | RepelYOptions["minDistance"], options?: T): Initialized<T>;
