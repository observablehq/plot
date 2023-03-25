import type {ChannelValue} from "../channel.js";
import type {Transformed} from "./basic.js";

/**
 * A built-in stack offset method; one of:
 *
 * - *normalize* - rescale each stack to fill [0, 1]
 * - *center* - align the centers of all stacks
 * - *wiggle* - translate stacks to minimize apparent movement
 *
 * If a given stack has zero total value, the *normalize* offset will not adjust
 * the stack’s position. Both the *center* and *wiggle* offsets ensure that the
 * lowest element across stacks starts at zero for better default axes. The
 * *wiggle* offset is recommended for streamgraphs in conjunction with the
 * *inside-out* order. For more, see [Byron & Wattenberg][1].
 *
 * [1]: http://leebyron.com/streamgraph/
 */
export type StackOffsetName =
  | "center"
  | "normalize"
  | "wiggle"
  | ("expand" & Record<never, never>) // deprecated; use normalize
  | ("silhouette" & Record<never, never>); // deprecated; use center

/**
 * A stack offset implementation: given an *index* grouped by facet and **x**,
 * the output channel values *y1* and *y2*, and the channel values *z*, mutates
 * the values in *y1* and *y2* given by the *index* to translate and scale
 * stacks as desired. For the stackX transform, substitute *y* for *x*, and *x1*
 * & *x2* for *y1* & *y2*.
 */
export type StackOffsetFunction = (index: number[][][], y1: number[], y2: number[], z: any[]) => void;

/**
 * How the baseline of stacked layers may be offset; one of:
 *
 * - a named stack offset method such as *wiggle* or *center*
 * - a function to be passed an *index*, **y1**, **y2**, and **z** values
 */
export type StackOffset = StackOffsetName | StackOffsetFunction;

/**
 * The built-in stack order methods; one of:
 *
 * - *x* - alias of *value*; for stackX only
 * - *y* - alias of *value*; for stackY only
 * - *value* - ascending value (or descending with **reverse**)
 * - *sum* - total value per series
 * - *appearance* - position of maximum value per series
 * - *inside-out* (default with *wiggle*) - order the earliest-appearing series on the inside
 *
 * The *inside-out* order is recommended for streamgraphs in conjunction with
 * the *wiggle* offset. For more, see [Byron & Wattenberg][1].
 *
 * [1]: http://leebyron.com/streamgraph/
 */
export type StackOrderName = "value" | "x" | "y" | "z" | "sum" | "appearance" | "inside-out";

/**
 * How to order layers prior to stacking; one of:
 *
 * - a named stack order method such as *inside-out* or *sum*
 * - a field name, for natural order of the corresponding values
 * - a function of data, for natural order of the corresponding values
 * - an array of explicit **z** values in the desired order
 */
export type StackOrder = StackOrderName | (string & Record<never, never>) | ((d: any, i: number) => any) | any[];

/** Options for the stack transform. */
export interface StackOptions {
  /**
   * After stacking, an optional **offset** can be applied to translate and
   * scale stacks, say to produce a streamgraph; defaults to null for a zero
   * baseline (**y** = 0 for stackY, and **x** = 0 for stackX). If the *wiggle*
   * offset is used, the default **order** changes to *inside-out*.
   */
  offset?: StackOffset | null;

  /**
   * The order in which stacks are layered; one of:
   *
   * - null (default) for input order
   * - a named stack order method such as *inside-out* or *sum*
   * - a field name, for natural order of the corresponding values
   * - a function of data, for natural order of the corresponding values
   * - an array of explicit **z** values in the desired order
   *
   * If the *wiggle* **offset** is used, as for a streamgraph, the default
   * changes to *inside-out*.
   */
  order?: StackOrder | null;

  /** If true, reverse the effective order of the stacks. */
  reverse?: boolean;

  /**
   * The **z** channel defines the series of each value in the stack. Used when
   * the **order** is *sum*, *appearance*, *inside-out*, or an explicit array of
   * **z** values.
   */
  z?: ChannelValue;
}

/**
 * Transforms a length channel **x** into starting and ending position channels
 * **x1** and **x2** by “stacking” elements that share a given **y** position.
 * The starting position of each element equals the ending position of the
 * preceding element in the stack. Non-positive values are stacked to the left
 * of zero, with **x2** to the left of **x1**. A new **x** channel is derived
 * that represents the midpoint between **x1** and **x2**, for example to place
 * a label. If not specified, the input channel **x** defaults to the constant
 * one.
 */
export function stackX<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;
export function stackX<T>(options?: T & StackOptions): Transformed<T>;

/**
 * Like **stackX**, but returns the starting position **x1** as the **x**
 * channel, for example to position a dot on the left-hand side of each element
 * of a stack.
 */
export function stackX1<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;
export function stackX1<T>(options?: T & StackOptions): Transformed<T>;

/**
 * Like **stackX**, but returns the starting position **x2** as the **x**
 * channel, for example to position a dot on the right-hand side of each element
 * of a stack.
 */
export function stackX2<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;
export function stackX2<T>(options?: T & StackOptions): Transformed<T>;

/**
 * Transforms a length channel **y** into starting and ending position channels
 * **y1** and **y2** by “stacking” elements that share a given **x** position.
 * The starting position of each element equals the ending position of the
 * preceding element in the stack. Non-positive values are stacked below zero,
 * with **y2** below **y1**. A new **y** channel is derived that represents the
 * midpoint between **y1** and **y2**, for example to place a label. If not
 * specified, the input channel **y** defaults to the constant one.
 */
export function stackY<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;
export function stackY<T>(options?: T & StackOptions): Transformed<T>;

/**
 * Like **stackY**, but returns the starting position **y1** as the **y**
 * channel, for example to position a dot at the bottom of each element of a
 * stack.
 */
export function stackY1<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;
export function stackY1<T>(options?: T & StackOptions): Transformed<T>;

/**
 * Like **stackY**, but returns the ending position **y2** as the **y** channel,
 * for example to position a dot at the top of each element of a stack.
 */
export function stackY2<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;
export function stackY2<T>(options?: T & StackOptions): Transformed<T>;
