import type {ColorOptions, Data} from "../mark.js";
import {MarkerOptions} from "../marker.js";
import {Area, AreaXOptions, AreaYOptions} from "./area.js";

/** Options for the areaLineX mark. */
export interface AreaLineXOptions extends AreaXOptions, ColorOptions, MarkerOptions {}

/** Options for the areaLineY mark. */
export interface AreaLineYOptions extends AreaYOptions, ColorOptions, MarkerOptions {}

/**
 * Returns a new vertically-oriented arealine mark for the given *data* and
 * *options*, where the baseline and topline share **y** values, as in a
 * time-series area chart where time goes up↑. For example, to plot Apple’s
 * daily stock price:
 *
 * ```js
 * Plot.areaLineX(aapl, {y: "Date", x: "Close"})
 * ```
 *
 * See Plot.areaX for more details.
 */
export function areaLineX(data?: Data, options?: AreaLineXOptions): AreaLine;

/**
 * Returns a new horizontally-oriented arealine mark for the given *data* and
 * *options*, where the baseline and topline share **x** values, as in a
 * time-series area chart where time goes right→. For example, to plot Apple’s
 * daily stock price:
 *
 * ```js
 * Plot.areaLineY(aapl, {x: "Date", y: "Close"})
 * ```
 *
 * See Plot.areaLineY for more details.
 */
export function areaLineY(data?: Data, options?: AreaLineYOptions): AreaLine;

/** The arealine mark. */
export class AreaLine extends Area {}
