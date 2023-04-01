import type {CompoundMark, Data, MarkOptions, RenderableMark} from "../mark.js";
import type {ScaleOptions} from "../scales.js";
import type {RuleXOptions, RuleYOptions} from "./rule.js";
import type {TextOptions} from "./text.js";
import type {TickXOptions, TickYOptions} from "./tick.js";

/** The subset of scale options for grids. */
type GridScaleOptions = Pick<ScaleOptions, "interval" | "ticks" | "tickSpacing">;

/** The subset of scale options for axes. */
type AxisScaleOptions = Pick<ScaleOptions, "tickSize" | "tickPadding" | "tickFormat" | "tickRotate" | "label" | "labelOffset" | "labelAnchor">; // prettier-ignore

/** Options for the grid marks. */
export interface GridOptions extends GridScaleOptions {
  /**
   * The side of the frame on which to place the axis: *top* or *bottom* for
   * horizontal axes (axisX and axisFx) and their associated vertical grids
   * (gridX and gridFx), or *left* or *right* for vertical axes (axisY and
   * axisFY) and their associated horizontal grids (gridY and gridFy).
   *
   * The default **anchor** depends on the associated scale:
   *
   * - *x* - *bottom*
   * - *y* - *left*
   * - *fx* - *top* if there is a *bottom* *x* axis, and otherwise *bottom*
   * - *fy* - *right* if there is a *left* *y* axis, and otherwise *right*
   *
   * For grids, the **anchor** also affects the extent of grid lines when the
   * opposite dimension is specified (**x** for gridY and **y** for gridX). For
   * example, to draw a horizontal gridY between the *right* edge of the frame
   * and the specified **x** value:
   *
   * ```js
   * Plot.gridY({x: (y) => aapl.find((d) => d.Close >= y)?.Date, anchor: "right"})
   * ```
   */
  anchor?: "top" | "right" | "bottom" | "left";

  /**
   * A shorthand for setting both **fill** and **stroke**; affects the stroke of
   * tick vectors and grid rules, and the fill of tick texts and axis label
   * texts; defaults to *currentColor*.
   */
  color?: MarkOptions["stroke"];
}

/** Options for the axis marks. */
export interface AxisOptions extends GridOptions, MarkOptions, TextOptions, AxisScaleOptions {
  /** The tick text **stroke**, say for a *white* outline to improve legibility; defaults to null. */
  textStroke?: MarkOptions["stroke"];
  /** The tick text **strokeOpacity**; defaults to 1; has no effect unless **textStroke** is set. */
  textStrokeOpacity?: MarkOptions["strokeOpacity"];
  /** The tick text **strokeWidth**; defaults to 4; has no effect unless **textStroke** is set. */
  textStrokeWidth?: MarkOptions["strokeWidth"];
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
 * Returns a new compound axis mark to document the visual encoding of the
 * vertical position *y* scale, comprised of (up to) three marks: a vector for
 * ticks, a text for tick labels, and another text for an axis label. The *data*
 * defaults to tick values sampled from the *y* scale’s domain; if desired,
 * specify the axis mark’s *data* explicitly, or use one of the **ticks**,
 * **tickSpacing**, or **interval** options.
 *
 * The **facetAnchor** option defaults to *right-empty* if **anchor** is
 * *right*, and *left-empty* if **anchor** is *left*. The default margins
 * likewise depend on **anchor** as follows; in order of **marginTop**,
 * **marginRight**, **marginBottom**, and **marginLeft**, in pixels:
 *
 * - *right* - 20, 40, 20, 0
 * - *left* - 20, 0, 20, 40
 *
 * For simplicity, and for consistent layout across plots, default axis margins
 * are not affected by tick labels. If tick labels are too long, either increase
 * the margin or shorten the labels: use the *k* SI-prefix tick format; use the
 * **transform** *y*-scale option to show thousands or millions; or use the
 * **textOverflow** and **lineWidth** options to clip.
 */
export function axisY(data?: Data, options?: AxisYOptions): CompoundMark;
export function axisY(options?: AxisYOptions): CompoundMark;

/**
 * Returns a new compound axis mark to document the visual encoding of the
 * vertical facet position *fy* scale, comprised of (up to) three marks: a
 * vector for ticks, a text for tick labels, and another text for an axis label.
 * The *data* defaults to the *fy* scale’s domain; if desired, specify the axis
 * mark’s *data* explicitly, or use one of the **ticks**, **tickSpacing**, or
 * **interval** options.
 *
 * The **facetAnchor** option defaults to *right-empty* if **anchor** is
 * *right*, and *left-empty* if **anchor** is *left*. The default margins
 * likewise depend on **anchor** as follows; in order of **marginTop**,
 * **marginRight**, **marginBottom**, and **marginLeft**, in pixels:
 *
 * - *right* - 20, 40, 20, 0
 * - *left* - 20, 0, 20, 40
 *
 * For simplicity, and for consistent layout across plots, default axis margins
 * are not affected by tick labels. If tick labels are too long, either increase
 * the margin or shorten the labels, say by using the **textOverflow** and
 * **lineWidth** options to clip.
 */
export function axisFy(data?: Data, options?: AxisYOptions): CompoundMark;
export function axisFy(options?: AxisYOptions): CompoundMark;

/**
 * Returns a new compound axis mark to document the visual encoding of the
 * horizontal position *x* scale, comprised of (up to) three marks: a vector for
 * ticks, a text for tick labels, and another text for an axis label. The *data*
 * defaults to tick values sampled from the *x* scale’s domain; if desired,
 * specify the axis mark’s *data* explicitly, or use one of the **ticks**,
 * **tickSpacing**, or **interval** options.
 *
 * The **facetAnchor** option defaults to *bottom-empty* if **anchor** is
 * *bottom*, and *top-empty* if **anchor** is *top*. The default margins
 * likewise depend on **anchor** as follows; in order of **marginTop**,
 * **marginRight**, **marginBottom**, and **marginLeft**, in pixels:
 *
 * - *top* - 30, 20, 0, 20
 * - *bottom* - 0, 20, 30, 20
 *
 * For simplicity, and for consistent layout across plots, default axis margins
 * are not affected by tick labels. If tick labels are too long, either increase
 * the margin or shorten the labels: use the *k* SI-prefix tick format; use the
 * **transform** *x*-scale option to show thousands or millions; or use the
 * **textOverflow** and **lineWidth** options to clip; or use the **tickRotate**
 * option to rotate.
 */
export function axisX(data?: Data, options?: AxisXOptions): CompoundMark;
export function axisX(options?: AxisXOptions): CompoundMark;

/**
 * Returns a new compound axis mark to document the visual encoding of the
 * horizontal facet position *fx* scale, comprised of (up to) three marks: a
 * vector for ticks, a text for tick labels, and another text for an axis label.
 * The *data* defaults to the *fx* scale’s domain; if desired, specify the axis
 * mark’s *data* explicitly, or use one of the **ticks**, **tickSpacing**, or
 * **interval** options.
 *
 * The **facetAnchor** and **frameAnchor** options defaults to **anchor**. The
 * default margins likewise depend on **anchor** as follows; in order of
 * **marginTop**, **marginRight**, **marginBottom**, and **marginLeft**, in
 * pixels:
 *
 * - *top* - 30, 20, 0, 20
 * - *bottom* - 0, 20, 30, 20
 *
 * For simplicity, and for consistent layout across plots, default axis margins
 * are not affected by tick labels. If tick labels are too long, either increase
 * the margin or shorten the labels, say by using the **textOverflow** and
 * **lineWidth** options to clip, or using the **tickRotate** option to rotate.
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
