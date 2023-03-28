import type {CompoundMark, Data, MarkOptions, RenderableMark} from "../mark.js";
import type {ScaleOptions} from "../scales.js";
import type {RuleXOptions, RuleYOptions} from "./rule.js";
import type {TextOptions} from "./text.js";
import type {TickXOptions, TickYOptions} from "./tick.js";

/**
 * The axis anchor, *top* or *bottom* for horizontal axes and their associated
 * vertical grids; *left* or *right* for vertical axes and their associated
 * horizontal grids.
 */
export type AxisAnchor = "top" | "right" | "bottom" | "left";

interface GridOptions {
  /**
   * The grid anchor. For when the grid lines extend from a given position on
   * the opposite dimension. For example, a horizontal grid line that starts at
   * the first *x* for which the *y* value is higher than the current grid tick:
   *
   * ```js
   * Plot.gridY({x: (y) => AAPL.find((d) => d.Close >= y)?.Date, insetLeft: -6, anchor: "right"})
   * ```
   */
  anchor?: AxisAnchor;

  /**
   * For data at regular intervals, such as integer values or daily samples, the
   * **interval** option can be used to enforce uniformity. The specified
   * *interval*—such as d3.utcMonth—must expose an *interval*.floor(*value*),
   * *interval*.offset(*value*), and *interval*.range(*start*, *stop*)
   * functions. The option can also be specified as a number, in which case it
   * will be promoted to a numeric interval with the given step. The option can
   * alternatively be specified as a string (*second*, *minute*, *hour*, *day*,
   * *week*, *month*, *quarter*, *half*, *year*, *monday*, *tuesday*,
   * *wednesday*, *thursday*, *friday*, *saturday*, *sunday*) naming the
   * corresponding UTC interval.
   */
  interval?: ScaleOptions["interval"];

  /**
   * For a continuous scale grid, defines the ticks as an approximate number of
   * ticks, an explicit array of tick values, or an interval such as *day* or
   * *month*.
   */
  ticks?: ScaleOptions["ticks"];

  /**
   * The approximate number of pixels between ticks (if **ticks** is not
   * specified).
   */
  tickSpacing?: ScaleOptions["tickSpacing"];

  /**
   * The color of the ticks (defaults to *currentColor*, equivalent to **stroke**).
   */
  color?: MarkOptions["stroke"];
}

interface AxisOptions extends GridOptions, MarkOptions, TextOptions {
  /**
   *
   */
  tickSize?: ScaleOptions["tickSize"];

  /**
   *
   */
  tickPadding?: ScaleOptions["tickPadding"];

  /**
   *
   */
  tickFormat?: ScaleOptions["tickFormat"];

  /**
   *
   */
  tickRotate?: ScaleOptions["tickRotate"];

  /**
   * 🌶 Not sure this exists?
   */
  grid?: ScaleOptions["grid"];

  /**
   *
   */
  line?: ScaleOptions["line"];

  /**
   *
   */
  label?: ScaleOptions["label"];

  /**
   *
   */
  labelOffset?: ScaleOptions["labelOffset"];

  /**
   *
   */
  labelAnchor?: ScaleOptions["labelAnchor"];

  /**
   * Text labels stroke color, used to limit occlusion; defaults to null.
   */
  textStroke?: MarkOptions["stroke"];

  /**
   * Text labels stroke opacity.
   */
  textStrokeOpacity?: MarkOptions["strokeOpacity"];

  /**
   * Text labels stroke width.
   */
  textStrokeWidth?: MarkOptions["strokeWidth"];

  /**
   * The color of the ticks and labels (defaults to *currentColor*, equivalent
   * to **stroke** for tick vectors, and **fill** for tick text labels).
   */
  color?: MarkOptions["stroke"];
}

/** Options for the axisX and axisFx marks. */
export interface AxisXOptions extends AxisOptions, TickXOptions {}

/** Options for the axisY and axisFy marks. */
export interface AxisYOptions extends AxisOptions, TickYOptions {}

/** Options for the gridX and gridFx marks. */
export interface GridXOptions extends GridOptions, Omit<RuleXOptions, "interval"> {}

/** Options for the gridY and gridFy marks. */
export interface GridYOptions extends GridOptions, Omit<RuleYOptions, "interval"> {}

/**
 *
 */
export function axisY(data?: Data, options?: AxisYOptions): CompoundMark;
export function axisY(options?: AxisYOptions): CompoundMark;

/**
 *
 */
export function axisFy(data?: Data, options?: AxisYOptions): CompoundMark;
export function axisFy(options?: AxisYOptions): CompoundMark;

/**
 *
 */
export function axisX(data?: Data, options?: AxisXOptions): CompoundMark;
export function axisX(options?: AxisXOptions): CompoundMark;

/**
 *
 */
export function axisFx(data?: Data, options?: AxisXOptions): CompoundMark;
export function axisFx(options?: AxisXOptions): CompoundMark;

/**
 *
 */
export function gridY(data?: Data, options?: GridYOptions): RenderableMark;
export function gridY(options?: GridYOptions): RenderableMark;

/**
 *
 */
export function gridFy(data?: Data, options?: GridYOptions): RenderableMark;
export function gridFy(options?: GridYOptions): RenderableMark;

/**
 *
 */
export function gridX(data?: Data, options?: GridXOptions): RenderableMark;
export function gridX(options?: GridXOptions): RenderableMark;

/**
 *
 */
export function gridFx(data?: Data, options?: GridXOptions): RenderableMark;
export function gridFx(options?: GridXOptions): RenderableMark;
