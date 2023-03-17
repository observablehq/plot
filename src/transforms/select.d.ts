import type {ChannelValue} from "../channel.js";
import type {Transformed} from "./basic.js";

export type SelectorName = "first" | "last" | "min" | "max"; // TODO restrict based on context

export type SelectorFunction = (index: number[], values: any[] | null) => number[];

export type SelectorChannel<T> = {[key in keyof T]?: SelectorName | SelectorFunction};

export type Selector<T> = SelectorName | SelectorFunction | SelectorChannel<T>;

export interface SelectOptions {
  z?: ChannelValue;
}

/**
 * Selects points from each series (usually defined by *stroke*, *fill* or *z*)
 * based on a selector. The selector can be specified either as a function which
 * receives as input the index of the series, the shorthand “first” or “last”,
 * or as a {*key*: *value*} object with exactly one *key* being the name of a
 * channel and the *value* being a function which receives as input the index of
 * the series and the channel values. The *value* may alternatively be specified
 * as the shorthand “min” and “max” which respectively select the minimum and
 * maximum points for the specified channel.
 */
export function select<T>(selector: Selector<T>, options?: T & SelectOptions): Transformed<T>;

/**
 * Selects the first point of each series (usually defined by *stroke*, *fill*
 * or *z*) in input order.
 */
export function selectFirst<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Selects the last point of each series (usually defined by *stroke*, *fill*
 * or *z*) in input order.
 */
export function selectLast<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Selects the first point of each series (usually defined by *stroke*, *fill*
 * or *z*) in ascending *x* order.
 */
export function selectMinX<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Selects the first point of each series (usually defined by *stroke*, *fill*
 * or *z*) in ascending *y* order.
 */
export function selectMinY<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Selects the first point of each series (usually defined by *stroke*, *fill*
 * or *z*) in descending *x* order.
 */
export function selectMaxX<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Selects the first point of each series (usually defined by *stroke*, *fill*
 * or *z*) in descending *y* order.
 */
export function selectMaxY<T>(options?: T & SelectOptions): Transformed<T>;
