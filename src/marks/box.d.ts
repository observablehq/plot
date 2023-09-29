import type {CompoundMark, Data} from "../mark.js";
import type {BarXOptions, BarYOptions} from "./bar.js";
import type {DotOptions} from "./dot.js";
import type {RuleXOptions, RuleYOptions} from "./rule.js";
import type {TickXOptions, TickYOptions} from "./tick.js";

/** Options for the boxX mark. */
export type BoxXOptions = DotOptions & BarXOptions & TickXOptions & RuleXOptions;

/** Options for the boxY mark. */
export type BoxYOptions = DotOptions & BarYOptions & TickYOptions & RuleYOptions;

/**
 * Returns a box mark that draws horizontal boxplots where **x** is quantitative
 * or temporal and **y**, if present, is ordinal. The box mark is a compound
 * mark consisting of four marks:
 *
 * - a rule representing the extreme values (not including outliers),
 * - a bar representing the interquartile range (trimmed to the data),
 * - a tick representing the median value, and
 * - a dot representing outliers, if any.
 *
 * The given *options* are passed through to these underlying marks, with the
 * exception of the following options:
 *
 * - **fill** - the fill color of the bar; defaults to gray
 * - **fillOpacity** - the fill opacity of the bar; defaults to 1
 * - **stroke** - the stroke color of the rule, tick, and dot; defaults to *currentColor*
 * - **strokeOpacity** - the stroke opacity of the rule, tick, and dot; defaults to 1
 * - **strokeWidth** - the stroke width of the tick; defaults to 2
 */
export function boxX(data?: Data, options?: BoxXOptions): CompoundMark;

/**
 * Returns a box mark that draws vertical boxplots where **y** is quantitative
 * or temporal and **x**, if present, is ordinal. The box mark is a compound
 * mark consisting of four marks:
 *
 * - a rule representing the extreme values (not including outliers),
 * - a bar representing the interquartile range (trimmed to the data),
 * - a tick representing the median value, and
 * - a dot representing outliers, if any.
 *
 * The given *options* are passed through to these underlying marks, with the
 * exception of the following options:
 *
 * - **fill** - the fill color of the bar; defaults to gray
 * - **fillOpacity** - the fill opacity of the bar; defaults to 1
 * - **stroke** - the stroke color of the rule, tick, and dot; defaults to *currentColor*
 * - **strokeOpacity** - the stroke opacity of the rule, tick, and dot; defaults to 1
 * - **strokeWidth** - the stroke width of the tick; defaults to 2
 */
export function boxY(data?: Data, options?: BoxYOptions): CompoundMark;
