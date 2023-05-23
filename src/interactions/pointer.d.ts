import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Rendered} from "../transforms/basic.js";

/** Options for the pointer transform. */
export interface PointerOptions {
  /**
   * The maximum radius in pixels to determine whether to render the closest
   * point; if no point is within this radius to the pointer, nothing will be
   * rendered. Defaults to 40 pixels. On pointerX and pointerY, only the *x* and
   * *y* distance is considered, respectively.
   */
  maxRadius?: number;

  /** The horizontal target position channel, typically bound to the *x* scale. */
  px?: ChannelValue;

  /** The vertical target position channel, typically bound to the *y* scale. */
  py?: ChannelValue;

  /**
   * The fallback horizontal target position channel, typically bound to the *x*
   * scale; used if **px** is not specified.
   */
  x?: ChannelValueSpec;

  /**
   * The fallback vertical target position channel, typically bound to the *y*
   * scale; used if **py** is not specified.
   */
  y?: ChannelValueSpec;

  /**
   * The starting horizontal target position channel, typically bound to the *x*
   * scale; used if **px** is not specified.
   */
  x1?: ChannelValueSpec;

  /**
   * The ending horizontal target position channel, typically bound to the *x*
   * scale; used if **px** is not specified.
   */
  x2?: ChannelValueSpec;

  /**
   * The starting vertical target position channel, typically bound to the *y*
   * scale; used if **py** is not specified.
   */
  y1?: ChannelValueSpec;

  /**
   * The ending vertical target position channel, typically bound to the *y*
   * scale; used if **py** is not specified.
   */
  y2?: ChannelValueSpec;
}

/**
 * Applies a render transform to the specified *options* to filter the mark
 * index such that only the point closest to the pointer is rendered; the mark
 * will re-render interactively in response to pointer events.
 */
export function pointer<T>(options: T & PointerOptions): Rendered<T>;

/**
 * Like the pointer transform, except the determination of the closest point
 * considers mostly the *x* (horizontal↔︎) position; this should be used for
 * plots where *x* is the dominant dimension, such as time in a time-series
 * chart, the binned quantitative dimension in a histogram, or the categorical
 * dimension of a bar chart.
 */
export function pointerX<T>(options: T & PointerOptions): Rendered<T>;

/**
 * Like the pointer transform, except the determination of the closest point
 * considers mostly the *y* (vertical↕︎) position; this should be used for plots
 * where *y* is the dominant dimension, such as time in a time-series chart, the
 * binned quantitative dimension in a histogram, or the categorical dimension of
 * a bar chart.
 */
export function pointerY<T>(options: T & PointerOptions): Rendered<T>;
