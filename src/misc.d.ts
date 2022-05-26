/**
 * Utility type to extract names of properties which match a given type.
 */
export type ExtractKeysByType<T, Datum> = keyof {
  [Key in keyof Datum as (Datum[Key] extends T ? Key : never)]: Datum[Key]
}

/**
 * Utility type to create a type for a mark channel option.
 */
export type ChannelOption<PropertyType, Datum = object, ColumnName = Datum extends object ? ExtractKeysByType<PropertyType, Datum> : string> =
  | ColumnName
  | ((d: Datum, i: number) => PropertyType | null | undefined);

/**
 * Utility type to create a type for a mark option which can be a
 * constant or a channel.
 *
 */
export type ConstantOrChannelOption<PropertyType, Datum = object> =
  | PropertyType
  | ChannelOption<PropertyType, Datum>;

/**
 * Utility type that constructs a type for the `channels` argument of
 * `render()` functions and methods.
 */
export type RenderFunctionChannels = {
  [Key in ConstantsOrChannels | Channels]?: MarkProperties[Key][]
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
 */
export type MixinExpandXYOptions<XorY extends "x" | "y", Datum> = {
  [V in ("1" | "2") as `${XorY}${V}`]?: StandardMarkOptions<Datum>[XorY]
}

/**
 * Utility type for adding `inset` properties.
 */
export type MixinInsetOptions = {
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
  MarkProperties,
  StandardMarkOptions
} from "./plot";
