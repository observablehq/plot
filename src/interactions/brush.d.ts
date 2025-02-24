import type {Rendered} from "../transforms/basic.js";

/** Options for the brush transform. */
type BrushOptions = {
  /**
   * How to display the selected mark when the user manipulates the brush.
   */
  selected?: null; // TODO
  /**
   * How to display the unselected mark when the user manipulates the brush.
   */
  unselected?: null;
  /**
   * The brush’s padding, defaults to 1.
   */
  padding?: number;
};

/**
 * Applies a render transform to the specified *options* to filter the mark
 * index such that only the point closest to the pointer is rendered; the mark
 * will re-render interactively in response to pointer events.
 */
export function brush<T>(options: T & BrushOptions): Rendered<T>;

/**
 * Like the pointer transform, except the determination of the closest point
 * considers mostly the *x* (horizontal↔︎) position; this should be used for
 * plots where *x* is the dominant dimension, such as time in a time-series
 * chart, the binned quantitative dimension in a histogram, or the categorical
 * dimension of a bar chart.
 */
export function brushX<T>(options: T & BrushOptions): Rendered<T>;

/**
 * Like the pointer transform, except the determination of the closest point
 * considers mostly the *y* (vertical↕︎) position; this should be used for plots
 * where *y* is the dominant dimension, such as time in a time-series chart, the
 * binned quantitative dimension in a histogram, or the categorical dimension of
 * a bar chart.
 */
export function brushY<T>(options: T & BrushOptions): Rendered<T>;
