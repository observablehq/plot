import type {ChannelValue, ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";

/**
 * The [text anchor][1] for horizontal position.
 *
 * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor
 */
export type TextAnchor = "start" | "middle" | "end";

/** The line anchor for vertical position. */
export type LineAnchor = "top" | "middle" | "bottom";

/**
 * The text overflow method:
 *
 * * null (default) - preserve overflowing characters
 * * *clip* or *clip-end* - remove characters from the end
 * * *clip-start* - remove characters from the start
 * * *ellipsis* or *ellipsis-end* - replace characters from the end with an
 *   ellipsis (…)
 * * *ellipsis-start* - replace characters from the start with an ellipsis (…)
 * * *ellipsis-middle* - replace characters from the middle with an ellipsis
 *   (…)
 */
export type TextOverflow =
  | "clip"
  | "ellipsis"
  | "clip-start"
  | "clip-end"
  | "ellipsis-start"
  | "ellipsis-middle"
  | "ellipsis-end";

/** Options for the text mark. */
export interface TextOptions extends MarkOptions {
  /**
   * The horizontal position, typically bound to the *x* mark.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position, typically bound to the *y* mark.
   */
  y?: ChannelValueSpec;

  /**
   * The text contents, with line breaks ('\n', '\r\n', or '\r') denoting
   * separate lines, rendered as tspan elements spaced with a relative
   * **lineHeight** that defaults to 1. The text can be split in lines of a
   * given **lineWidth**, specified in ems (e.g. 10 for about 20 characters).
   * Lines might be split on words that contain a soft-hyphen (\xad), replacing
   * it with a dash (-) and a line feed. To truncate longer texts, see the
   * **textOverflow** option.
   */
  text?: ChannelValue;

  /**
   * If either of the **x** or **y** channels are not specified, the
   * corresponding position is controlled by the **frameAnchor** option, which
   * defaults to *middle*. If the text is anchored to the *left* of the frame,
   * its default **textAnchor** is *start*; if anchored to the *right* of the
   * frame, *end*; otherwise, *center*.
   */
  frameAnchor?: FrameAnchor;

  /**
   * The [text anchor][1] for horizontal position; start, end, or middle.
   * Defaults to *center* unless the **frameAnchor** mentions *left* or *right*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor
   */
  textAnchor?: TextAnchor;

  /**
   * The line anchor for vertical position; *top*, *bottom*, or *middle*.
   * Defaults to *middle* unless the **frameAnchor** option includes *top* (or
   * *bottom*), in which case it defaults to *top* (resp. *bottom*), so that the
   * text is contained in the frame.
   */
  lineAnchor?: LineAnchor;

  /** The line height in ems; defaults to 1. */
  lineHeight?: number;

  /**
   * The line width in ems, for wrapping.
   */
  lineWidth?: number;

  /**
   * The **textOverflow** option can be used to truncate lines of text longer
   * than the given **lineWidth**. If the mark does not have a **title**
   * channel, a title with the non-truncated text is also added.
   *
   * The following **textOverflow** values are supported:
   *
   * * null (default) - preserve overflowing characters
   * * *clip* or *clip-end* - remove characters from the end
   * * *clip-start* - remove characters from the start
   * * *ellipsis* or *ellipsis-end* - replace characters from the end with an
   *   ellipsis (…)
   * * *ellipsis-start* - replace characters from the start with an ellipsis (…)
   * * *ellipsis-middle* - replace characters from the middle with an ellipsis
   *   (…)
   */
  textOverflow?: TextOverflow;

  /** If true, changes the default fontFamily and metrics to monospace. */
  monospace?: boolean;

  /**
   *
   * The font name; defaults to [system-ui][1]. For example, to use a custom
   * font stack:
   *
   * ```js
   * Plot.text(labels, {
   *   x: "x", y: "y", text: "label",
   *   fontFamily: "'Atkinson Hyperlegible',Roboto,sans-serif",
   * })
   * ```
   *
   * [1]: https://drafts.csswg.org/css-fonts-4/#valdef-font-family-system-ui
   */
  fontFamily?: string;

  /** The font size in pixels; defaults to 10 */
  fontSize?: ChannelValue;

  /**
   * The [font style][1]; defaults to normal.
   *
   * For italic font, use fontStyle: "italic".
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-style
   */
  fontStyle?: string;

  /**
   * The [font variant][1]; defaults to normal.
   *
   * For tabular numbers, use fontVariant: "tabular-nums".
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant
   */
  fontVariant?: string;

  /**
   * The [font weight][1]; defaults to normal.
   *
   * For a boldface font, use *e.g.* fontWeight: "bold" or fontWeight: 700.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
   */
  fontWeight?: string | number;

  /**
   * The rotation angle in degrees clockwise; defaults to 0°.
   */
  rotate?: ChannelValue;
}

/** Options for the textX mark. */
export interface TextXOptions extends Omit<TextOptions, "y"> {
  y?: ChannelValueIntervalSpec;
  interval?: Interval;
}

/** Options for the textY mark. */
export interface TextYOptions extends Omit<TextOptions, "x"> {
  x?: ChannelValueIntervalSpec;
  interval?: Interval;
}

/**
 * Returns a new text mark for the given *data* and *options*. The **text**
 * channel specifies the (possibly multi-line) textual contents of the mark.
 *
 * If the text is specified as numbers or dates, a default formatter will
 * automatically be applied, and the **fontVariant** will default to
 * tabular-nums instead of normal. For more control over number and date
 * formatting, consider [*number*.toLocaleString][1],
 * [*date*.toLocaleString][2], [d3-format][3], or [d3-time-format][4]. If
 * **text** is not specified, it defaults to the identity function for primitive
 * data (such as numbers, dates, and strings), and to the zero-based index [0,
 * 1, 2, …] for objects (so that something identifying is visible by default).
 *
 * Common font options include **fontFamily**, **fontSize**, **fontStyle**,
 * **fontWeight**, and **monospace**.
 *
 * The optional **x** and **y** channels specify the position of the text in
 * data space. For screen-space positioning if **x** or **y** is omitted, use
 * one of the **frameAnchor** options. Relative to its anchor, the text can be
 * aligned with the **textAnchor** and **lineAnchor** options, translated with
 * the common **dx** and **dy** options, or rotated with the **rotate** option.
 *
 * The **textOverflow** option can be used to truncate lines of text longer than
 * the given **lineWidth**.
 *
 * [1]: https://observablehq.com/@mbostock/number-formatting
 *
 * [2]: https://observablehq.com/@mbostock/date-formatting
 *
 * [3]: https://github.com/d3/d3-format
 *
 * [4]: https://github.com/d3/d3-time-format
 */
export function text(data?: Data, options?: TextOptions): Text;

/**
 * Like text, but **x** defaults to the identity function and assumes that
 * *data* = [*x₀*, *x₁*, *x₂*, …]. For example to display tick label-like marks
 * at the top of the frame:
 *
 * ```js
 * Plot.textX([10, 15, 20, 25, 30], {frameAnchor: "top"})
 * ```
 *
 * If the opposite dimension **y** is specified with an **interval**, it points
 * to the middle of the interval.
 */
export function textX(data?: Data, options?: TextXOptions): Text;

/**
 * Like text, but **y** defaults to the identity function and assumes that
 * *data* = [*y₀*, *y₁*, *y₂*, …]. For example to display tick label-like marks
 * on the right of the frame:
 *
 * ```js
 * Plot.textY([10, 15, 20, 25, 30], {frameAnchor: "right"})
 * ```
 *
 * If the opposite dimension **x** is specified with an **interval**, it points
 * to the middle of the interval.
 */
export function textY(data?: Data, options?: TextYOptions): Text;

/** The text mark. */
export class Text extends RenderableMark {}
