import type {ChannelValueSpec} from "../channel.js";
import type {Initialized} from "./basic.js";

/** Options for the dodge transform. */
export interface DodgeOptions {
  /**
   * The radii of dodged circles; either a constant radius in pixels or a
   * channel bound to the *r* scale (by default a *sqrt* scale, hence encoding
   * effective area); defaults to 3 pixels. The minimum distance between two
   * dodge circles is their combined radii plus any optional **padding**.
   */
  r?: ChannelValueSpec;

  /**
   * The minimum additional separation between dodged circles, in pixels, added
   * to their combined radii **r**; defaults to 1. When stroking circles, the
   * padding can be set to same value as the **strokeWidth** to avoid
   * overlapping strokes.
   */
  padding?: number;
}

/** Options for the dodgeX transform. */
export interface DodgeXOptions extends DodgeOptions {
  /** The vertical position of the dodged circle centers. */
  y?: ChannelValueSpec;

  /**
   * How to orient piles of dodged circles; one of:
   *
   * - *left* (default) - grow from the left to the right
   * - *middle* - grow from the center out, in both horizontal directions
   * - *right* - grow from the right to the left
   */
  anchor?: "right" | "left" | "middle";
}

/** Options for the dodgeY transform. */
export interface DodgeYOptions extends DodgeOptions {
  /** The horizontal position of the dodged circle centers. */
  x?: ChannelValueSpec;

  /**
   * How to orient piles of dodged circles; one of:
   *
   * - *bottom* (default) - grow from the bottom up
   * - *middle* - grow from the center out, in both vertical directions
   * - *top* - grown from the top down
   */
  anchor?: "top" | "bottom" | "middle";
}

/**
 * Given a **y** position channel, derives a new **x** position channel that
 * places circles of the given radius **r** to avoid overlap. The order in which
 * circles are placed, which defaults to descending radius **r** to place the
 * largest circles first, significantly affects the overall layout; use the
 * **sort** or **reverse** mark options to change the order.
 *
 * If *dodgeOptions* is a string, it is shorthand for the dodge **anchor**.
 */
export function dodgeX<T>(dodgeOptions?: DodgeXOptions | DodgeXOptions["anchor"], options?: T): Initialized<T>;
export function dodgeX<T>(options?: T & DodgeXOptions): Initialized<T>;

/**
 * Given an **x** position channel, derives a new **y** position channel that
 * places circles of the given radius **r** to avoid overlap. The order in which
 * circles are placed, which defaults to descending radius **r** to place the
 * largest circles first, significantly affects the overall layout; use the
 * **sort** or **reverse** mark options to change the order.
 *
 * If *dodgeOptions* is a string, it is shorthand for the dodge **anchor**.
 */
export function dodgeY<T>(dodgeOptions?: DodgeYOptions | DodgeYOptions["anchor"], options?: T): Initialized<T>;
export function dodgeY<T>(options?: T & DodgeYOptions): Initialized<T>;
