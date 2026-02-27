import type {ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
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
   * or *(v, fx, fy)*; for a 2D brush, use *(x, y)*, *(x, y, fx)*,
   * *(x, y, fy)*, or *(x, y, fx, fy)*. When faceted, returns true only for
   * points in the brushed facet. For projected plots, *x* and *y* are
   * typically longitude and latitude.
   */
  filter: (...args: any[]) => boolean;
  /** When the brush has data, the subset of data matching the selection. */
  data?: any[];
  /** True during interaction, absent when committed. */
  pending?: true;
}

/** Options for the brush mark. */
export interface BrushOptions extends MarkOptions {
  /**
   * The horizontal position channel, typically bound to the *x* scale. When
   * specified, inherited by reactive marks as a default.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position channel, typically bound to the *y* scale. When
   * specified, inherited by reactive marks as a default.
   */
  y?: ChannelValueSpec;

  /**
   * The horizontal facet channel, bound to the *fx* scale. When specified,
   * inherited by reactive marks as a default.
   */
  fx?: MarkOptions["fx"];

  /**
   * The vertical facet channel, bound to the *fy* scale. When specified,
   * inherited by reactive marks as a default.
   */
  fy?: MarkOptions["fy"];

  /**
   * If true, the brush spans all facet panes simultaneously; defaults to false.
   */
  sync?: boolean;
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
  constructor(options?: BrushOptions);
  /**
   * Creates a new brush mark with the given *data* and *options*. If *data* and
   * *options* specify **x** and **y** channels, these become defaults for
   * reactive marks (**inactive**, **context**, **focus**). The **fill**,
   * **fillOpacity**, **stroke**, **strokeWidth**, and **strokeOpacity** options
   * style the brush selection rectangle.
   */
  constructor(data?: Data, options?: BrushOptions);
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

/**
 * Creates a new brush mark with the given *data* and *options*. If neither
 * **x** nor **y** is specified, they default to the first and second
 * element of each datum, assuming [*x*, *y*] pairs.
 */
export function brush(options?: BrushOptions): Brush;
export function brush(data?: Data, options?: BrushOptions): Brush;

/** Options for 1-dimensional brush marks. */
export interface Brush1DOptions extends BrushOptions {
  /**
   * An interval to snap the brush to, such as a number for quantitative scales
   * or a time interval name like *month* for temporal scales. On brush end, the
   * selection is rounded to the nearest interval boundaries; the dispatched
   * filter function floors values before testing, for consistency with binned
   * marks.
   */
  interval?: Interval;
}

/**
 * Creates a one-dimensional brush mark along the *x* axis. If *data* is
 * specified without an **x** channel, each datum is used as the *x* value
 * directly. Not supported with projections.
 */
export function brushX(options?: Brush1DOptions): Brush;
export function brushX(data?: Data, options?: Brush1DOptions): Brush;

/**
 * Creates a one-dimensional brush mark along the *y* axis. If *data* is
 * specified without a **y** channel, each datum is used as the *y* value
 * directly. Not supported with projections.
 */
export function brushY(options?: Brush1DOptions): Brush;
export function brushY(data?: Data, options?: Brush1DOptions): Brush;
