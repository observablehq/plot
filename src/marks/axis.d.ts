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

/** Options for the grid marks. */
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

/** Options for the axis marks. */
interface AxisOptions extends GridOptions, MarkOptions, TextOptions {
  /**
   * The axis orientation.
   */
  anchor?: AxisAnchor;

  /**
   * The length of tick vectors in pixels; negative values extend in the
   * opposite direction.
   */
  tickSize?: ScaleOptions["tickSize"];

  /**
   * The separation between the tick vector and its label (in pixels; default
   * 3).
   */
  tickPadding?: ScaleOptions["tickPadding"];

  /**
   * The tick label format specifier. String specifiers are passed to
   * [d3-format](https://github.com/d3/d3-format) for numeric scales, and
   * [d3-time-format](https://github.com/d3/d3-time-format) for *time* and *utc*
   * scales. If a function, it is passed the tick value and tick index, and
   * returns a string. Plot also provides multilingual format helpers for
   * convenience: **formatIsoDate**, **formatWeekDay** and **formatMonth**.
   */
  tickFormat?: ScaleOptions["tickFormat"];

  /**
   * The rotation angle of tick labels in degrees (default 0).
   */
  tickRotate?: ScaleOptions["tickRotate"];

  /**
   * 🌶 Not sure this actually exists?
   */
  grid?: ScaleOptions["grid"];

  /** Whether a line should be drawn on the axis. */
  line?: ScaleOptions["line"];

  /** A string to label the axis. */
  label?: ScaleOptions["label"];

  /**
   * The label position offset (in pixels; default depends on margins and
   * orientation).
   */
  labelOffset?: ScaleOptions["labelOffset"];

  /** The label anchor: *top*, *right*, *bottom*, *left*, or *center*. */
  labelAnchor?: ScaleOptions["labelAnchor"];

  /**
   * Text labels stroke color, used to limit occlusion; defaults to null.
   */
  textStroke?: MarkOptions["stroke"];

  /**
   * Text labels stroke opacity (needs textStroke).
   */
  textStrokeOpacity?: MarkOptions["strokeOpacity"];

  /**
   * Text labels stroke width, used to limit occlusion; defaults to 4 (needs
   * textStroke).
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
 * Draws an axis to document the visual encoding of the *y* scale. The axis mark
 * is a composite mark comprised of (up to) three marks: a **vector** for ticks,
 * a **text** for tick labels, and another **text** for an axis label.
 *
 * By default, the *data* are tick values sampled from the scale’s domain. If
 * desired, you can specify the axis mark’s data explicitly (_e.g._ as an array
 * of numbers), or use one of the following options:
 *
 * - **ticks** - the approximate number of ticks to generate, or interval, or
 *   array of values
 * - **tickSpacing** - the approximate number of pixels between ticks (if
 *   **ticks** is not specified)
 * - **interval** - an interval or time interval
 *
 * In addition to the standard mark options, the axis mark supports the
 * following options:
 *
 * - **anchor** - the orientation: *left*, *right*
 * - **tickSize** - the length of the tick vector (in pixels; default 6)
 * - **tickPadding** - the separation between the tick vector and its label (in
 *   pixels; default 3)
 * - **tickFormat** - either a function or specifier string to format tick
 *   values
 * - **tickRotate** - whether to rotate tick labels (an angle in degrees
 *   clockwise; default 0)
 * - **fontVariant** - the font-variant attribute for ticks; defaults to
 *   tabular-nums for quantitative axes
 * - **label** - a string to label the axis; defaults to the scale’s label,
 *   perhaps with an arrow
 * - **labelAnchor** - the label anchor: *top*, *bottom*, or *center*
 * - **labelOffset** - the label position offset (in pixels; defaults to the
 *   margin - 3)
 * - **color** - the color of the ticks and labels (defaults to *currentColor*)
 * - **textStroke** - the color of the stroke around tick labels (defaults to
 *   *none*)
 * - **textStrokeOpacity** - the opacity of the stroke around tick labels
 * - **textStrokeWidth** - the thickness of the stroke around tick labels (in
 *   pixels)
 *
 * The axis mark’s [**facetAnchor**](#facetanchor) option defaults to
 * *right-empty* if anchor is *right*, and *left-empty* if anchor is *left*.
 * This ensures the proper positioning of the axis with respect to empty facets.
 *
 * The axis mark’s default margins depend on its orientation (**anchor**) as
 * follows, in order of **marginTop**, **marginRight**, **marginBottom**, and
 * **marginLeft**, in pixels:
 *
 * * *right* - 20, 40, 20, 0
 * * *left* - 20, 0, 20, 40
 *
 * For simplicity’s sake and for consistent layout across plots, axis margins
 * are not automatically sized to make room for tick labels; instead, shorten
 * your tick labels (for example using the *k* SI-prefix tick format, or setting
 * a *scale*.transform to show thousands or millions, or setting the
 * **textOverflow** option to *ellipsis* and the **lineWidth** option to clip
 * long labels) or increase the margins as needed.
 */
export function axisY(data?: Data, options?: AxisYOptions): CompoundMark;
export function axisY(options?: AxisYOptions): CompoundMark;

/**
 * Draws an axis to document the visual encoding of the *fy* scale. The axis
 * mark is a composite mark comprised of (up to) three marks: a **vector** for
 * ticks, a **text** for tick labels, and another **text** for an axis label.
 *
 * By default, the *data* are the facet scale’s domain. In addition to the
 * standard mark options, the axis mark supports the following options:
 *
 * - **anchor** - the orientation: *left*, *right*
 * - **tickSize** - the length of the tick vector (in pixels; default 6)
 * - **tickPadding** - the separation between the tick vector and its label (in
 *   pixels; default 3)
 * - **tickFormat** - either a function or specifier string to format tick
 *   values
 * - **tickRotate** - whether to rotate tick labels (an angle in degrees
 *   clockwise; default 0)
 * - **fontVariant** - the font-variant attribute for ticks
 * - **label** - a string to label the axis; defaults to the scale’s label
 * - **labelAnchor** - the label anchor: *top*, *bottom*, or *center*
 * - **labelOffset** - the label position offset (in pixels; defaults to the
 *   margin - 3)
 * - **color** - the color of the ticks and labels (defaults to *currentColor*)
 * - **textStroke** - the color of the stroke around tick labels (defaults to
 *   *none*)
 * - **textStrokeOpacity** - the opacity of the stroke around tick labels
 * - **textStrokeWidth** - the thickness of the stroke around tick labels (in
 *   pixels)
 *
 * The axis mark’s default margins depend on its orientation (**anchor**) as
 * follows, in order of **marginTop**, **marginRight**, **marginBottom**, and
 * **marginLeft**, in pixels:
 *
 * - *right* - 20, 40, 20, 0
 * - *left* - 20, 0, 20, 40
 *
 * For simplicity’s sake and for consistent layout across plots, axis margins
 * are not automatically sized to make room for tick labels; instead, shorten
 * your tick labels (maybe setting the **textOverflow** option to *ellipsis* and
 * the **lineWidth** option to clip long labels) or increase the margins as
 * needed.
 */
export function axisFy(data?: Data, options?: AxisYOptions): CompoundMark;
export function axisFy(options?: AxisYOptions): CompoundMark;

/**
 * Draws an axis to document the visual encoding of the *x* scale. The axis mark
 * is a composite mark comprised of (up to) three marks: a **vector** for ticks,
 * a **text** for tick labels, and another **text** for an axis label.
 *
 * By default, the *data* are tick values sampled from the scale’s domain. If
 * desired, you can specify the axis mark’s data explicitly (_e.g._ as an array
 * of numbers), or use one of the following options:
 *
 * - **ticks** - the approximate number of ticks to generate, or interval, or
 *   array of values
 * - **tickSpacing** - the approximate number of pixels between ticks (if
 *   **ticks** is not specified)
 * - **interval** - an interval or time interval
 *
 * In addition to the standard mark options, the axis mark supports the
 * following options:
 *
 * - **anchor** - the orientation: *top*, *bottom*
 * - **tickSize** - the length of the tick vector (in pixels; default 6)
 * - **tickPadding** - the separation between the tick vector and its label (in
 *   pixels; default 3)
 * - **tickFormat** - either a function or specifier string to format tick
 *   values
 * - **tickRotate** - whether to rotate tick labels (an angle in degrees
 *   clockwise; default 0)
 * - **fontVariant** - the font-variant attribute for ticks; defaults to
 *   tabular-nums for quantitative axes
 * - **label** - a string to label the axis; defaults to the scale’s label,
 *   perhaps with an arrow
 * - **labelAnchor** - the label anchor: *top*, *bottom*, or *center*
 * - **labelOffset** - the label position offset (in pixels; defaults to the
 *   margin - 3)
 * - **color** - the color of the ticks and labels (defaults to *currentColor*)
 * - **textStroke** - the color of the stroke around tick labels (defaults to
 *   *none*)
 * - **textStrokeOpacity** - the opacity of the stroke around tick labels
 * - **textStrokeWidth** - the thickness of the stroke around tick labels (in
 *   pixels)
 *
 * The axis mark’s **facetAnchor** option defaults to *bottom-empty* if anchor
 * is *bottom*, and *top-empty* if anchor is *top*. This ensures the proper
 * positioning of the axis with respect to empty facets.
 *
 * The axis mark’s default margins depend on its orientation (**anchor**) as
 * follows, in order of **marginTop**, **marginRight**, **marginBottom**, and
 * **marginLeft**, in pixels:
 *
 * - *top* - 30, 20, 0, 20
 * - *bottom* - 0, 20, 30, 20
 *
 * For simplicity’s sake and for consistent layout across plots, axis margins
 * are not automatically sized to make room for tick labels; instead, shorten
 * your tick labels (for example using the *k* SI-prefix tick format, or setting
 * a *scale*.transform to show thousands or millions, or setting the
 * **lineWidth** option to wrap long labels), or rotate them.
 */
export function axisX(data?: Data, options?: AxisXOptions): CompoundMark;
export function axisX(options?: AxisXOptions): CompoundMark;

/**
 * Draws an axis to document the visual encoding of the *fx* scale. The axis
 * mark is a composite mark comprised of (up to) three marks: a **vector** for
 * ticks, a **text** for tick labels, and another **text** for an axis label.
 *
 * By default, the *data* are the facet scale’s domain. In addition to the
 * standard mark options, the axis mark supports the following options:
 *
 * - **anchor** - the orientation: *left*, *right*
 * - **tickSize** - the length of the tick vector (in pixels; default 6)
 * - **tickPadding** - the separation between the tick vector and its label (in
 *   pixels; default 3)
 * - **tickFormat** - either a function or specifier string to format tick
 *   values
 * - **tickRotate** - whether to rotate tick labels (an angle in degrees
 *   clockwise; default 0)
 * - **fontVariant** - the font-variant attribute for ticks
 * - **label** - a string to label the axis; defaults to the scale’s label
 * - **labelAnchor** - the label anchor: *top*, *bottom*, or *center*
 * - **labelOffset** - the label position offset (in pixels; defaults to the
 *   margin - 3)
 * - **color** - the color of the ticks and labels (defaults to *currentColor*)
 * - **textStroke** - the color of the stroke around tick labels (defaults to
 *   *none*)
 * - **textStrokeOpacity** - the opacity of the stroke around tick labels
 * - **textStrokeWidth** - the thickness of the stroke around tick labels (in
 *   pixels)
 *
 * The axis mark’s default margins depend on its orientation (**anchor**) as
 * follows, in order of **marginTop**, **marginRight**, **marginBottom**, and
 * **marginLeft**, in pixels:
 *
 * - *top* - 30, 20, 0, 20
 * - *bottom* - 0, 20, 30, 20
 *
 * For simplicity’s sake and for consistent layout across plots, axis margins
 * are not automatically sized to make room for tick labels; instead, shorten
 * your tick labels (maybe setting the **lineWidth** option to wrap long labels)
 * or rotate them.
 */
export function axisFx(data?: Data, options?: AxisXOptions): CompoundMark;
export function axisFx(options?: AxisXOptions): CompoundMark;

/**
 * Draws vertical grid lines aligned on *x* values.
 *
 * The optional *data* is an array of tick values—it defaults to the scale’s
 * ticks.
 *
 * The following options are supported:
 *
 * * **strokeDasharray** - the [stroke dasharray][1] for dashed lines, defaults
 *   to null
 *
 * The following options are supported as constant or data-driven channels:
 *
 * - **stroke** - the grid color, defaults to currentColor
 * - **strokeWidth** - the grid’s line width, defaults to 1
 * - **strokeOpacity** - the stroke opacity, defaults to 0.1
 * - **y1** - the start of the line, a channel of y positions.
 * - **y2** - the end of the line, a channel of y positions.
 *
 * All the other common options are supported when applicable (e.g., **title**).
 *
 * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
 */
export function gridX(data?: Data, options?: GridXOptions): RenderableMark;
export function gridX(options?: GridXOptions): RenderableMark;

/**
 * Draws vertical grid lines aligned on *fx* values.
 *
 * The optional *data* is an array of tick values—it defaults to the scale’s
 * domain.
 *
 * The following options are supported:
 *
 * * **strokeDasharray** - the [stroke dasharray][1] for dashed lines, defaults
 *   to null
 *
 * The following options are supported as constant or data-driven channels:
 *
 * - **stroke** - the grid color, defaults to currentColor
 * - **strokeWidth** - the grid’s line width, defaults to 1
 * - **strokeOpacity** - the stroke opacity, defaults to 0.1
 * - **y1** - the start of the line, a channel of y positions.
 * - **y2** - the end of the line, a channel of y positions.
 *
 * All the other common options are supported when applicable (e.g., **title**).
 *
 * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
 */
export function gridFx(data?: Data, options?: GridXOptions): RenderableMark;
export function gridFx(options?: GridXOptions): RenderableMark;

/**
 * Draws horizontal grid lines aligned on *y* values.
 *
 * The optional *data* is an array of tick values—it defaults to the scale’s
 * ticks.
 *
 * The following options are supported:
 *
 * * **strokeDasharray** - the [stroke dasharray][1] for dashed lines, defaults
 *   to null
 *
 * The following options are supported as constant or data-driven channels:
 *
 * - **stroke** - the grid color, defaults to currentColor
 * - **strokeWidth** - the grid’s line width, defaults to 1
 * - **strokeOpacity** - the stroke opacity, defaults to 0.1
 * - **x1** - the start of the line, a channel of x positions.
 * - **x2** - the end of the line, a channel of x positions.
 *
 * All the other common options are supported when applicable (e.g., **title**).
 *
 * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
 */
export function gridY(data?: Data, options?: GridYOptions): RenderableMark;
export function gridY(options?: GridYOptions): RenderableMark;

/**
 * Draws vertical grid lines aligned on *fy* values.
 *
 * The optional *data* is an array of tick values—it defaults to the scale’s
 * domain.
 *
 * The following options are supported:
 *
 * * **strokeDasharray** - the [stroke dasharray][1] for dashed lines, defaults
 *   to null
 *
 * The following options are supported as constant or data-driven channels:
 *
 * - **stroke** - the grid color, defaults to currentColor
 * - **strokeWidth** - the grid’s line width, defaults to 1
 * - **strokeOpacity** - the stroke opacity, defaults to 0.1
 * - **x1** - the start of the line, a channel of x positions.
 * - **x2** - the end of the line, a channel of x positions.
 *
 * All the other common options are supported when applicable (e.g., **title**).
 *
 * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
 */
export function gridFy(data?: Data, options?: GridYOptions): RenderableMark;
export function gridFy(options?: GridYOptions): RenderableMark;
