import type {Interval} from "../interval.js";
import type {RenderableMark} from "../mark.js";
import type {Rendered} from "../transforms/basic.js";

/**
 * The brush value dispatched on input events. When the brush is cleared, the
 * value is null; otherwise it contains the selection bounds (in data space,
 * or pixels if projected) and a filter function to test whether a data point
 * is inside the brush. By convention *x1* < *x2* and *y1* < *y2*.
 */
export interface BrushValue {
  /** The lower *x* value of the brushed region. */
  x1?: number | Date;
  /** The upper *x* value of the brushed region. */
  x2?: number | Date;
  /** The lower *y* value of the brushed region. */
  y1?: number | Date;
  /** The upper *y* value of the brushed region. */
  y2?: number | Date;
  /** The *fx* facet value, if applicable. */
  fx?: any;
  /** The *fy* facet value, if applicable. */
  fy?: any;
  /**
   * A function to test whether a point falls inside the brush selection.
   * The signature depends on the dimensions and active facets: for brushX
   * and brushY, filter on the value *v* with *(v)*, *(v, fx)*, *(v, fy)*,
   * or *(v, fx, fy)*  *(x, y)*; for a 2D brush, use *(x, y)*, *(x, y, fx)*,
   * *(x, y, fy)*, or *(x, y, fx, fy)*. When faceted, returns true only for
   * points in the brushed facet. For projected plots, *x* and *y* are
   * typically longitude and latitude.
   */
  filter: (...args: any[]) => boolean;
  /** True during interaction, absent when committed. */
  pending?: true;
}

/**
 * A mark that renders a [brush](https://d3js.org/d3-brush) allowing the user to
 * select a region. The brush coordinates across facets, clearing previous
 * selections when a new brush starts.
 *
 * The brush dispatches an input event when the selection changes. The selection
 * is available as plot.value as a **BrushValue**, or null when the selection is
 * cleared. Use the **inactive**, **context**, and **focus** methods to create
 * reactive marks that respond to the brush state.
 */
export class Brush extends RenderableMark {
  /**
   * Returns mark options that show the mark when no brush selection is active,
   * and hide it during brushing. Use this for the default appearance.
   */
  inactive<T>(options?: T): Rendered<T>;

  /**
   * Returns mark options that hide the mark by default and, during brushing,
   * show only the points *outside* the selection. Use this for a dimmed
   * background layer.
   */
  context<T>(options?: T): Rendered<T>;

  /**
   * Returns mark options that hide the mark by default and, during brushing,
   * show only the points *inside* the selection. Use this to highlight the
   * selected data.
   */
  focus<T>(options?: T): Rendered<T>;

  /**
   * Programmatically sets the brush selection in data space. Pass an object
   * with the relevant bounds (**x1** and **x2**, **y1** and **y2**, and
   * **fx**, **fy** for faceted plots) to set the selection, or null to clear it.
   */
  move(
    value: {x1?: number | Date; x2?: number | Date; y1?: number | Date; y2?: number | Date; fx?: any; fy?: any} | null
  ): void;
}

/** Creates a new two-dimensional brush mark. */
export function brush(): Brush;

/** Options for brush marks. */
export interface BrushOptions {
  /**
   * An interval to snap the brush to, such as a number for quantitative scales
   * or a time interval name like *month* for temporal scales. On brush end, the
   * selection is rounded to the nearest interval boundaries; the dispatched
   * filter function floors values before testing, for consistency with binned
   * marks. Supported by the 1-dimensional marks brushX and brushY.
   */
  interval?: Interval;
}

/** Creates a one-dimensional brush mark along the *x* axis. Not supported with projections. */
export function brushX(options?: BrushOptions): Brush;

/** Creates a one-dimensional brush mark along the *y* axis. Not supported with projections. */
export function brushY(options?: BrushOptions): Brush;
