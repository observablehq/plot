/**
 * Utility type to extract names of properties which match a given type.
 */
export type ExtractKeysByType<T, Datum> = keyof {
  [Key in keyof Datum as (Datum[Key] extends T ? Key : never)]: Datum[Key]
}

// TODO Accommodate columnar data.

/**
 * Utility type to create a type for a mark channel option.
 */
export type ChannelOption<Datum = object, ColumnName = Datum extends object ? keyof Datum : string> =
  | ColumnName
  | ((d: Datum, i: number) => OptionPrimitive | undefined);

/**
 * Utility type to create a type for a mark option which can be a
 * constant or a channel.
 *
 */
export type ConstantOrChannelOption<Datum = object> =
  | OptionPrimitive
  | ChannelOption<Datum>;

/**
 * Utility type that constructs a type for the `channels` argument of
 * `render()` functions and methods.
 */
export type RenderFunctionChannels = {
  [Key in ConstantsOrChannels | Channels]?: OptionPrimitive[]
}

/**
 * `dimensions` parameter in `render()` functions and methods.
 */
export type RenderFunctionDimensions = {
  width: number,
  height: number,
  marginTop: number,
  marginRight: number,
  marginBottom: number,
  marginLeft: number,
  facetMarginTop: number,
  facetMarginRight: number,
  facetMarginBottom: number,
  facetMarginLeft: number
}

/**
 * Utility type that generates types for `x1`, `x2`, `y1`, `y2`
 *
 * @template XY The option to expand. Either "x" or "y".
 * @template Datum The type of a single datum in the mark dataset.
 */
export type ExpandXYOptions<XY extends "x" | "y", Datum = object> = {
  [V in ("1" | "2") as `${XY}${V}`]?: StandardMarkOptions<Datum>[XY]
}

/**
 * Utility type for adding `inset` properties.
 */
export type InsetOptions = {
  inset?: number,
  insetTop?: number,
  insetRight?: number,
  insetBottom?: number,
  insetLeft?: number,
  rx?: number,
  ry?: number
}

import {
  Channels,
  ConstantsOrChannels,
  OptionPrimitive,
  StandardMarkOptions
} from "./plot";
