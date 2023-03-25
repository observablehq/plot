import type {SymbolType as SymbolImplementation} from "d3";
export type {SymbolType as SymbolImplementation} from "d3";

/**
 * The built-in symbol implementations. For fill, one of:
 *
 * - *circle* - a circle
 * - *cross* - a Greek cross with arms of equal length
 * - *diamond* - a rhombus
 * - *square* - a square
 * - *star* - a pentagonal star (pentagram)
 * - *triangle* - an up-pointing triangle
 * - *wye* - a Y with arms of equal length
 *
 * For stroke (based on [Heman Robinson’s research][1]), one of:
 *
 * - *circle* - a circle
 * - *plus* - a plus sign
 * - *times* - an X with arms of equal length
 * - *triangle2* - an (alternate) up-pointing triangle
 * - *asterisk* - an asterisk
 * - *square2* - a (alternate) square
 * - *diamond2* - a rotated square
 *
 * The *hexagon* symbol is also supported.
 *
 * [1]: https://www.tandfonline.com/doi/abs/10.1080/10618600.2019.1637746
 */
export type SymbolName =
  | "asterisk"
  | "circle"
  | "cross"
  | "diamond"
  | "diamond2"
  | "hexagon"
  | "plus"
  | "square"
  | "square2"
  | "star"
  | "times"
  | "triangle"
  | "triangle2"
  | "wye";

/** How to draw a symbol: either a named symbol or a custom implementation. */
export type SymbolType = SymbolName | SymbolImplementation;
