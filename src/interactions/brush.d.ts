import type {Interval} from "../interval.js";
import type {RenderableMark} from "../mark.js";
import type {Rendered} from "../transforms/basic.js";

/**
 * The brush value dispatched on input events. When the brush is cleared, the
 * value is null; otherwise it is a Region containing the selection bounds (in
 * data space, or pixels if the plot has a projection) and methods to test
 * whether a data point is inside the brush. By convention *x1* < *x2* and
 * *y1* < *y2*.
 */
export class Region {
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
   * Tests whether a point falls inside the brush selection.
   *
   * For a 2-D brush, pass (x, y) or (x, y, {fx, fy}) for faceted plots.
   * For a 1-D brush (brushX or brushY), pass (value) or (value, {fx, fy}).
   * The facet argument is optional; if specified, returns true only for points
   * in the brushed facet.
   */
  contains(x: any, y?: any, facets?: {fx?: any; fy?: any}): boolean;
}

/** Options for the brush mark. */
export interface BrushOptions {
  /**
   * If true, the brush spans all facet panes simultaneously; defaults to false.
   */
  sync?: boolean;
  /**
   * An interval to snap the brush to, such as a number for quantitative scales
   * or a time interval name like *month* for temporal scales. On brush end, the
   * selection is rounded to the nearest interval boundaries; the dispatched
   * filter function floors values before testing, for consistency with binned
   * marks. Supported by the 1-dimensional marks brushX and brushY.
   */
  interval?: Interval;
}

/**
 * A mark that renders a [brush](https://d3js.org/d3-brush) allowing the user to
 * select a region. The brush coordinates across facets, clearing previous
 * selections when a new brush starts.
 *
 * The brush dispatches an input event when the selection changes. The selection
 * is available as plot.value as a **Region**, or null when the selection is
 * cleared. Use the **inactive**, **context**, and **focus** methods to create
 * reactive marks that respond to the brush state.
 */
export class Brush extends RenderableMark {
  constructor(options?: BrushOptions);
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
export function brush(options?: BrushOptions): Brush;

/** Creates a one-dimensional brush mark along the *x* axis. Not supported with projections. */
export function brushX(options?: BrushOptions): Brush;

/** Creates a one-dimensional brush mark along the *y* axis. Not supported with projections. */
export function brushY(options?: BrushOptions): Brush;
