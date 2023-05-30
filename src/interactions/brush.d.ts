import type {Rendered} from "../transforms/basic.js";

/** Options for the brush transform. */
type BrushOptions = {
  /**
   * The brush’s selection mode determines the contents of the plot’s value
   * property when the user manipulates the brush:
   * * **data** - default; the selected data
   * * **extent** - the selection extent, in data space
   *
   * The extent is an object with properties *x*: [x1, x2] for brushX, *y*: [y1,
   * y2] for brushY, and both *x* and *y* for brush. Additionally, when
   * faceting, it contains the facet’s *fx* and *fy* properties.
   */
  selectionMode?: "data" | "extent";
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
