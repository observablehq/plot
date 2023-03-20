import type {ChannelValueSpec} from "../channel.js";
import type {Initialized} from "./basic.js";

export type DodgeXAnchor = "right" | "left" | "middle";

export type DodgeYAnchor = "top" | "bottom" | "middle";

export interface DodgeOptions {
  /** The radius (area) of the mark. */
  r?: ChannelValueSpec;
  /** A number of pixels added to the radius of the mark. */
  padding?: number;
}

export interface DodgeXOptions extends DodgeOptions {
  /** The vertical position of the mark. */
  y?: ChannelValueSpec;
  /** The side of the frame used as an anchor; defaults to *left*. */
  anchor?: DodgeXAnchor;
}

export interface DodgeYOptions extends DodgeOptions {
  /** The horizontal position of the mark. */
  x?: ChannelValueSpec;
  /** The side of the frame used as an anchor; defaults to *bottom*. */
  anchor?: DodgeYAnchor;
}

/**
 * Given marks arranged along the *y* axis, the dodgeX transform piles them
 * horizontally by defining a *x* position channel that avoids overlapping. With
 * the *middle* anchor the piles will grow from the center in both directions;
 * with the *left* or *right* anchors, the piles will grow from the specified
 * anchor towards the opposite direction. The size of the mark is given by the
 * radius channel *r* plus an optional **padding**. The data is sorted by
 * descending radius by default; you can disable this behavior by setting the
 * **sort** or **reverse** option. The *y* position channel is unchanged.
 */
export function dodgeX<T>(options?: T & DodgeXOptions): Initialized<T>;
export function dodgeX<T>(dodgeOptions?: DodgeXOptions | DodgeXAnchor, options?: T): Initialized<T>;

/**
 * Given marks arranged along the *x* axis, the dodgeY transform piles them
 * vertically by defining a *y* position channel that avoids overlapping. With
 * the *middle* anchor the piles will grow from the center in both directions;
 * with the *top* or *bottom* anchors, the piles will grow from the specified
 * anchor towards the opposite direction. The size of the mark is given by the
 * radius channel *r* plus an optional **padding**. The data is sorted by
 * descending radius by default; you can disable this behavior by setting the
 * **sort** or **reverse** option. The *x* position channel is unchanged.
 */
export function dodgeY<T>(options?: T & DodgeYOptions): Initialized<T>;
export function dodgeY<T>(dodgeOptions?: DodgeYOptions | DodgeYAnchor, options?: T): Initialized<T>;
