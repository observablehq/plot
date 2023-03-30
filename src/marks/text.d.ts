import type {ChannelValue, ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the text mark. */
export interface TextOptions extends MarkOptions {
  /**
   * The horizontal position channel specifying the text’s anchor point,
   * typically bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position channel specifying the text’s anchor point, typically
   * bound to the *y* scale.
   */
  y?: ChannelValueSpec;

  /**
   * The text contents channel, possibly with line breaks (\n, \r\n, or \r). If
   * not specified, defaults to the zero-based index [0, 1, 2, …].
   */
  text?: ChannelValue;

  /**
   * The frame anchor specifies defaults for **x** and **y**, along with
   * **textAnchor** and **lineAnchor**, based on the plot’s frame; it may be one
   * of the four sides (*top*, *right*, *bottom*, *left*), one of the four
   * corners (*top-left*, *top-right*, *bottom-right*, *bottom-left*), or the
   * *middle* of the frame.
   */
  frameAnchor?: FrameAnchor;

  /**
   * The [text anchor][1] controls how text is aligned (typically horizontally)
   * relative to its anchor point; it is one of *start*, *end*, or *middle*. If
   * the frame anchor is *left*, *top-left*, or *bottom-left*, the default text
   * anchor is *start*; if the frame anchor is *right*, *top-right*, or
   * *bottom-right*, the default is *end*; otherwise it is *middle*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor
   */
  textAnchor?: "start" | "middle" | "end";

  /**
   * The line anchor controls how text is aligned (typically vertically)
   * relative to its anchor point; it is one of *top*, *bottom*, or *middle*. If
   * the frame anchor is *top*, *top-left*, or *top-right*, the default line
   * anchor is *top*; if the frame anchor is *bottom*, *bottom-right*, or
   * *bottom-left*, the default is *bottom*; otherwise it is *middle*.
   */
  lineAnchor?: "top" | "middle" | "bottom";

  /**
   * The line height in ems; defaults to 1. The line height affects the
   * (typically vertical) separation between adjacent baselines of text, as well
   * as the separation between the text and its anchor point.
   */
  lineHeight?: number;

  /**
   * The line width in ems (e.g., 10 for about 20 characters); defaults to
   * infinity, disabling wrapping and clipping.
   *
   * If **textOverflow** is null, lines will be wrapped at the specified length.
   * If a line is split at a soft hyphen (\xad), a hyphen (-) will be displayed
   * at the end of the line. If **textOverflow** is not null, lines will be
   * clipped according to the given strategy.
   */
  lineWidth?: number;

  /**
   * How truncate (or wrap) lines of text longer than the given **lineWidth**;
   * one of:
   *
   * - null (default) - preserve overflowing characters (and wrap if needed)
   * - *clip* or *clip-end* - remove characters from the end
   * - *clip-start* - remove characters from the start
   * - *ellipsis* or *ellipsis-end* - replace characters from the end with an ellipsis (…)
   * - *ellipsis-start* - replace characters from the start with an ellipsis (…)
   * - *ellipsis-middle* - replace characters from the middle with an ellipsis (…)
   *
   * If no **title** was specified, if text requires truncation, a title
   * containing the non-truncated text will be implicitly added.
   */
  textOverflow?:
    | null
    | "clip"
    | "ellipsis"
    | "clip-start"
    | "clip-end"
    | "ellipsis-start"
    | "ellipsis-middle"
    | "ellipsis-end";

  /**
   * If true, changes the default **fontFamily** to *monospace*, and uses
   * simplified monospaced text metrics calculations.
   */
  monospace?: boolean;

  /**
   * The [font-family][1]; a constant; defaults to the plot’s font family, which
   * is typically [*system-ui*][2].
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
   * [2]: https://drafts.csswg.org/css-fonts-4/#valdef-font-family-system-ui
   */
  fontFamily?: string;

  /**
   * The [font size][1] in pixels; either a constant or a channel; defaults to
   * the plot’s font size, which is typically 10. When a number, it is
   * interpreted as a constant; otherwise it is interpreted as a channel.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
   */
  fontSize?: ChannelValue;

  /**
   * The [font style][1]; a constant; defaults to the plot’s font style, which
   * is typically *normal*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-style
   */
  fontStyle?: string;

  /**
   * The [font variant][1]; a constant; if the **text** channel contains numbers
   * or dates, defaults to *tabular-nums* to facilitate comparing numbers;
   * otherwise defaults to the plot’s font style, which is typically *normal*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant
   */
  fontVariant?: string;

  /**
   * The [font weight][1]; a constant; defaults to the plot’s font weight, which
   * is typically *normal*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
   */
  fontWeight?: string | number;

  /**
   * The rotation angle in degrees clockwise; a constant or a channel; defaults
   * to 0°. When a number, it is interpreted as a constant; otherwise it is
   * interpreted as a channel.
   */
  rotate?: ChannelValue;
}

/** Options for the textX mark. */
export interface TextXOptions extends Omit<TextOptions, "y"> {
  /**
   * The vertical position of the text’s anchor point, typically bound to the
   * *y* scale.
   */
  y?: ChannelValueIntervalSpec;

  /**
   * An interval (such as *day* or a number), to transform **y** values to the
   * middle of the interval.
   */
  interval?: Interval;
}

/** Options for the textY mark. */
export interface TextYOptions extends Omit<TextOptions, "x"> {
  /**
   * The horizontal position of the text’s anchor point, typically bound to the
   * *x* scale.
   */
  x?: ChannelValueIntervalSpec;

  /**
   * An interval (such as *day* or a number), to transform **x** values to the
   * middle of the interval.
   */
  interval?: Interval;
}

/**
 * Returns a new text mark for the given *data* and *options*. The **text**
 * channel specifies the textual contents of the mark, which may be preformatted
 * with line breaks (\n, \r\n, or \r), or wrapped or clipped using the
 * **lineWidth** and **textOverflow** options.
 *
 * If **text** contains numbers or dates, a default formatter will be applied,
 * and the **fontVariant** will default to *tabular-nums* instead of *normal*.
 * For more control, consider [*number*.toLocaleString][1],
 * [*date*.toLocaleString][2], [d3-format][3], or [d3-time-format][4]. If
 * **text** is not specified, it defaults to the identity function for primitive
 * data (such as numbers, dates, and strings), and to the zero-based index [0,
 * 1, 2, …] for objects (so that something identifying is visible by default).
 *
 * If either **x** or **y** is not specified, the default is determined by the
 * **frameAnchor** option. If none of **x**, **y**, and **frameAnchor** are
 * specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*,
 * *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** =
 * [*y₀*, *y₁*, *y₂*, …].
 *
 * [1]: https://observablehq.com/@mbostock/number-formatting
 * [2]: https://observablehq.com/@mbostock/date-formatting
 * [3]: https://github.com/d3/d3-format
 * [4]: https://github.com/d3/d3-time-format
 */
export function text(data?: Data, options?: TextOptions): Text;

/**
 * Like text, but **x** defaults to the identity function, assuming that *data*
 * = [*x₀*, *x₁*, *x₂*, …]. For example to display tick label-like marks at the
 * top of the frame:
 *
 * ```js
 * Plot.textX([10, 15, 20, 25, 30], {frameAnchor: "top"})
 * ```
 *
 * If an **interval** is specified, such as *day*, **y** is transformed to the
 * middle of the interval.
 */
export function textX(data?: Data, options?: TextXOptions): Text;

/**
 * Like text, but **y** defaults to the identity function, assuming that *data*
 * = [*y₀*, *y₁*, *y₂*, …]. For example to display tick label-like marks on the
 * right of the frame:
 *
 * ```js
 * Plot.textY([10, 15, 20, 25, 30], {frameAnchor: "right"})
 * ```
 *
 * If an **interval** is specified, such as *day*, **x** is transformed to the
 * middle of the interval.
 */
export function textY(data?: Data, options?: TextYOptions): Text;

/** The text mark. */
export class Text extends RenderableMark {}
