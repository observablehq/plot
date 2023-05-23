import type {ChannelValueSpec} from "../channel.js";
import type {CompoundMark, Data, MarkOptions} from "../mark.js";

/** Options for the crosshair mark. */
export interface CrosshairOptions extends MarkOptions {
  /**
   * The horizontal position channel specifying the crosshair’s center,
   * typically bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position channel specifying the crosshair’s center, typically
   * bound to the *y* scale.
   */
  y?: ChannelValueSpec;

  /**
   * The maximum radius in pixels to determine whether to render the crosshair
   * for closest point; if no point is within this radius to the pointer, the
   * crosshair will be hidden. Defaults to 40 pixels. On crosshairX and
   * crosshairY, only the *x* and *y* distance is considered, respectively.
   */
  maxRadius?: number;

  /**
   * A shorthand for setting both **ruleStroke** and **textFill**; affects the
   * stroke of rules and the fill of texts; defaults to *currentColor*.
   */
  color?: MarkOptions["stroke"];

  /** A shorthand for setting **ruleStrokeOpacity**; defaults to 0.2. */
  opacity?: MarkOptions["opacity"];

  /** The rule **stroke**; defaults to **color**. */
  ruleStroke?: MarkOptions["stroke"];

  /** The rule **strokeOpacity**; defaults to 0.2. */
  ruleStrokeOpacity?: MarkOptions["strokeOpacity"];

  /** The rule **strokeWidth**; defaults to 1. */
  ruleStrokeWidth?: MarkOptions["strokeWidth"];

  /** The text **fill**; defaults to **color**. */
  textFill?: MarkOptions["fill"];

  /** The text **stroke**; defaults to *white* to improve legibility. */
  textStroke?: MarkOptions["stroke"];

  /** The text **strokeOpacity**; defaults to 1. */
  textStrokeOpacity?: MarkOptions["strokeOpacity"];

  /** The text **strokeWidth**; defaults to 5. */
  textStrokeWidth?: MarkOptions["strokeWidth"];
}

/**
 * Returns a new crosshair mark for the given *data* and *options*, drawing
 * horizontal and vertical rules centered at the point closest to the pointer.
 * The corresponding **x** and **y** values are also drawn just outside the
 * bottom and left sides of the frame, respectively, typically on top of the
 * axes. If either **x** or **y** is not specified, the crosshair will be
 * one-dimensional.
 */
export function crosshair(data?: Data, options?: CrosshairOptions): CompoundMark;

/**
 * Like crosshair, but uses the pointerX transform: the determination of the
 * closest point is heavily weighted by the *x* (horizontal↔︎) position; this
 * should be used for plots where *x* represents the independent variable, such
 * as time in a time-series chart, or the aggregated dimension when grouping or
 * binning.
 */
export function crosshairX(data?: Data, options?: CrosshairOptions): CompoundMark;

/**
 * Like crosshair, but uses the pointerY transform: the determination of the
 * closest point is heavily weighted by the *y* (vertical↕︎) position; this
 * should be used for plots where *y* represents the independent variable, such
 * as time in a time-series chart, or the aggregated dimension when grouping or
 * binning.
 */
export function crosshairY(data?: Data, options?: CrosshairOptions): CompoundMark;
