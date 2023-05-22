import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Rendered} from "../transforms/basic.js";

/** Options for the pointer transform. */
export interface PointerOptions {
  /**
   * The maximum radius in pixels to determine whether to render the closest
   * point; if no point is within this radius to the pointer, nothing will be
   * rendered. Defaults to 40 pixels. (For pointerX and pointerY, this refers to
   * scaled distance; the actual distance may be 10× this amount.)
   */
  maxRadius?: number;

  /**
   * The horizontal position channel specifying the pointer anchor, typically
   * bound to the *x* scale.
   */
  px?: ChannelValue;

  /**
   * The vertical position channel specifying the pointer anchor, typically
   * bound to the *y* scale.
   */
  py?: ChannelValue;

  /**
   * The horizontal position channel specifying the fallback anchor, typically
   * bound to the *x* scale; used if **px** is not specified.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position channel specifying the fallback anchor, typically
   * bound to the *y* scale; used if **py** is not specified.
   */
  y?: ChannelValueSpec;

  /**
   * The starting horizontal position channel specifying the fallback anchor,
   * typically bound to the *x* scale; used if **px** is not specified.
   */
  x1?: ChannelValueSpec;

  /**
   * The ending horizontal position channel specifying the fallback anchor,
   * typically bound to the *x* scale; used if **px** is not specified.
   */
  x2?: ChannelValueSpec;

  /**
   * The starting vertical position channel specifying the fallback anchor,
   * typically bound to the *y* scale; used if **py** is not specified.
   */
  y1?: ChannelValueSpec;

  /**
   * The ending vertical position channel specifying the fallback anchor,
   * typically bound to the *y* scale; used if **py** is not specified.
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
 * Like the pointer transform, except the determination of the closest point is
 * heavily weighted by the *x* (horizontal↔︎) position; this should be used for
 * plots where *x* represents the independent variable, such as time in a
 * time-series chart, or the aggregated dimension when grouping or binning.
 */
export function pointerX<T>(options: T & PointerOptions): Rendered<T>;

/**
 * Like the pointer transform, except the determination of the closest point is
 * heavily weighted by the *y* (vertical↕︎) position; this should be used for
 * plots where *y* represents the independent variable, such as time in a
 * time-series chart, or the aggregated dimension when grouping or binning.
 */
export function pointerY<T>(options: T & PointerOptions): Rendered<T>;
