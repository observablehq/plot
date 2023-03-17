import type {ChannelValue} from "../channel.js";
import type {Transformed} from "./basic.js";

export type StackOffsetName =
  | "center"
  | "normalize"
  | "wiggle"
  | ("expand" & Record<never, never>) // deprecated; use normalize
  | ("silhouette" & Record<never, never>); // deprecated; use center

export type StackOffsetFunction = (stacks: number[][][], y1: number[], y2: number[], z: any[]) => void;

export type StackOffset = StackOffsetName | StackOffsetFunction;

export type StackOrderName = "value" | "x" | "y" | "z" | "sum" | "appearance" | "inside-out";

export type StackOrder =
  | StackOrderName
  | (string & Record<never, never>) // field name; see also https://github.com/microsoft/TypeScript/issues/29729
  | ((d: any, i: number) => any) // function of data
  | any[]; // explicit ordinal values

export interface StackOptions {
  /**
   * After all values have been stacked from zero, an optional **offset** can be
   * applied to translate or scale the stacks:
   *
   * - null (default) - a zero baseline
   * - *normalize* (or *expand*) - rescale each stack to fill [0, 1]
   * - *center* (or *silhouette*) - align the centers of all stacks
   * - *wiggle* - translate stacks to minimize apparent movement
   * - a function to be passed a nested index, and start, end, and *z* values
   *
   * If a given stack has zero total value, the *expand* offset will not adjust
   * the stack’s position. Both the *center* and *wiggle* offsets ensure that
   * the lowest element across stacks starts at zero for better default axes.
   * The *wiggle* offset is recommended for streamgraphs, and if used, changes
   * the default order to *inside-out*.
   */
  offset?: StackOffset | null;

  /**
   * The order in which stacks are layered:
   *
   * - null (default) - input order
   * - *value* - ascending value order (or descending with **reverse**)
   * - *sum* - order series by their total value
   * - *appearance* - order series by the position of their maximum value
   * - *inside-out* - order the earliest-appearing series on the inside
   *   (recommended for the *wiggle* offset)
   * - a named field or function of data - order data by priority
   * - an array enumerating all the *z* values in the desired order
   *
   * The **reverse** option reverses the effective order. For the *value* order,
   * Plot.stackY uses the *y* value while Plot.stackX uses the *x* value. For
   * the *appearance* order, Plot.stackY uses the *x* position of the maximum
   * *y* value while Plot.stackX uses the *y* position of the maximum *x* value.
   */
  order?: StackOrder | null;

  /**
   * If true, reverse the effective order of the stacks.
   */
  reverse?: boolean;

  /**
   * The *z* channel defines the series of each value in the stack. Used when
   * the *order* is sum, appearance, inside-out, or an explicit array of z
   * values.
   */
  z?: ChannelValue;
}

export function stackX<T>(options?: T & StackOptions): Transformed<T>;

export function stackX<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackX1<T>(options?: T & StackOptions): Transformed<T>;

export function stackX1<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackX2<T>(options?: T & StackOptions): Transformed<T>;

export function stackX2<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackY<T>(options?: T & StackOptions): Transformed<T>;

export function stackY<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackY1<T>(options?: T & StackOptions): Transformed<T>;

export function stackY1<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackY2<T>(options?: T & StackOptions): Transformed<T>;

export function stackY2<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;
