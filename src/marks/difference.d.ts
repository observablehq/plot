import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {CurveOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the difference mark. */
export interface DifferenceOptions extends MarkOptions, CurveOptions {
  /**
   * The comparison horizontal position channel, typically bound to the *x*
   * scale; if not specified, **x** is used. For differenceX, defaults to zero
   * if only one *x* and *y* channel is specified.
   */
  x1?: ChannelValueSpec;

  /**
   * The primary horizontal position channel, typically bound to the *x* scale;
   * if not specified, **x1** is used.
   */
  x2?: ChannelValueSpec;

  /** The horizontal position channel, typically bound to the *x* scale. */
  x?: ChannelValueSpec;

  /**
   * The comparison vertical position channel, typically bound to the *y* scale;
   * if not specified, **y** is used. For differenceY, defaults to zero if only
   * one *x* and *y* channel is specified.
   */
  y1?: ChannelValueSpec;

  /**
   * The primary vertical position channel, typically bound to the *y* scale;
   * if not specified, **y1** is used.
   */
  y2?: ChannelValueSpec;

  /** The vertical position channel, typically bound to the *y* scale. */
  y?: ChannelValueSpec;

  /**
   * The fill color when the primary value is greater than the secondary value;
   * defaults to green.
   */
  positiveFill?: ChannelValueSpec;

  /**
   * The fill color when the primary value is less than the secondary value;
   * defaults to blue.
   */
  negativeFill?: ChannelValueSpec;

  /** The fill opacity; defaults to 1. */
  fillOpacity?: number;

  /**
   * The fill opacity when the primary value is greater than the secondary
   * value; defaults to **fillOpacity**.
   */
  positiveFillOpacity?: number;

  /**
   * The fill opacity when the primary value is less than the secondary value;
   * defaults to **fillOpacity**.
   */
  negativeFillOpacity?: number;

  /**
   * An optional ordinal channel for grouping data into series to be drawn as
   * separate areas; defaults to **stroke**, if a channel.
   */
  z?: ChannelValue;
}

/**
 * Returns a new horizontal difference mark for the given the specified *data*
 * and *options*, as in a time-series chart where time goes down↓ (or up↑).
 *
 * The mark is a composite of a positive area, negative area, and line. The
 * positive area extends from the left of the frame to the line, and is clipped
 * by the area extending from the comparison to the right of the frame. The
 * negative area conversely extends from the right of the frame to the line, and
 * is clipped by the area extending from the comparison to the left of the
 * frame.
 */
export function differenceX(data?: Data, options?: DifferenceOptions): Difference;

/**
 * Returns a new vertical difference mark for the given the specified *data* and
 * *options*, as in a time-series chart where time goes right→ (or ←left).
 *
 * The mark is a composite of a positive area, negative area, and line. The
 * positive area extends from the bottom of the frame to the line, and is
 * clipped by the area extending from the comparison to the top of the frame.
 * The negative area conversely extends from the top of the frame to the line,
 * and is clipped by the area extending from the comparison to the bottom of the
 * frame.
 */
export function differenceY(data?: Data, options?: DifferenceOptions): Difference;

/** The difference mark. */
export class Difference extends RenderableMark {}
