import type {Channel, ChannelDomainSort, ChannelValue, ChannelValues, ChannelValueSpec} from "./channel.js";
import type {Context} from "./context.js";
import type {Dimensions} from "./dimensions.js";
import type {TipOptions} from "./marks/tip.js";
import type {plot} from "./plot.js";
import type {ScaleFunctions} from "./scales.js";
import type {InitializerFunction, SortOrder, TransformFunction} from "./transforms/basic.js";

/**
 * How to anchor a mark relative to the plot’s frame; one of:
 *
 * - *middle* - centered in the middle
 * - in the middle of one of the edges: *top*, *right*, *bottom*, *left*
 * - in one of the corners: *top-left*, *top-right*, *bottom-right*, *bottom-left*
 */
export type FrameAnchor =
  | "middle"
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left";

/** The pointer mode for the tip; corresponds to pointerX, pointerY, and pointer. */
export type TipPointer = "x" | "y" | "xy";

/**
 * A mark’s data; one of:
 *
 * - an array, typed array, or other iterable
 * - an object with a length property and indexed values
 */
export type Data = Iterable<any> | ArrayLike<any>;

/**
 * A bare renderable mark implementation. Given the mark’s *index*, an object of
 * the plot’s *scales*, the mark’s (possibly scaled) channel *values*, the
 * plot’s *dimensions* and *context*, returns a new SVGElement, or null if the
 * mark should display nothing.
 */
export type RenderFunction = (
  /** The mark’s (filtered and transformed) index. */
  index: number[],
  /** The plot’s scale functions. */
  scales: ScaleFunctions,
  /** The mark’s (possibly scaled and transformed) channel values. */
  values: ChannelValues,
  /** The plot’s dimensions. */
  dimensions: Dimensions,
  /** The plot’s context. */
  context: Context,
  /** The next render function; for render transforms only. */
  next?: RenderFunction
) => SVGElement | null;

/**
 * A mark implementation or mark-like object; one of:
 *
 * - a renderable mark, extending Mark and implementing *mark*.render
 * - a bare render function, for a custom functional mark
 * - an array of mark implementations or mark-like objects
 * - null or undefined, to render nothing
 */
export type Markish = RenderableMark | RenderFunction | Markish[] | null | undefined;

/** Shared options for all marks. */
export interface MarkOptions {
  /**
   * Applies a transform to filter the mark’s index according to the given
   * channel values; only truthy values are retained. For example, to show only
   * data whose body mass is greater than 3,000g:
   *
   * ```js
   * filter: (d) => d.body_mass_g > 3000
   * ```
   *
   * Note that filtering only affects the rendered mark index, not the
   * associated channel values, and thus has no effect on imputed scale domains.
   */
  filter?: ChannelValue;

  /**
   * Applies a transform to reverse the order of the mark’s index, say for
   * reverse input order.
   */
  reverse?: boolean;

  /**
   * Either applies a transform to sort the mark’s index by the specified
   * channel values, or imputes ordinal scale domains from this mark’s channels.
   *
   * When imputing ordinal scale domains from channel values, the **sort**
   * option is an object whose keys are ordinal scale names such as *x* or *fx*,
   * and whose values are channel names such as *y*, *y1*, or *y2*. For example,
   * to impute the *y* scale’s domain from the associated *x* channel values in
   * ascending order:
   *
   * ```js
   * sort: {y: "x"}
   * ```
   *
   * For different sort options for different scales, replace the channel name
   * with a *value* object and per-scale options:
   *
   * ```js
   * sort: {y: {value: "-x"}}
   * ```
   *
   * When sorting the mark’s index, the **sort** option is instead one of:
   *
   * - a function for comparing data, returning a signed number
   * - a channel value definition for sorting given values in ascending order
   * - a {value, order} object for sorting given values
   * - a {channel, order} object for sorting the named channel’s values
   *
   * For example, to render in order of ascending body mass:
   *
   * ```js
   * sort: "body_mass_g"
   * ```
   *
   * See also the Plot.sort transform.
   */
  sort?: SortOrder | ChannelDomainSort;

  /** A custom mark transform. */
  transform?: TransformFunction;

  /** A custom mark initializer. */
  initializer?: InitializerFunction;

  /** A custom render transform. */
  render?: RenderFunction;

  /**
   * The horizontal facet position channel, for mark-level faceting, bound to
   * the *fx* scale.
   */
  fx?: ChannelValue;

  /**
   * The vertical facet position channel, for mark-level faceting, bound to the
   * *fy* scale.
   */
  fy?: ChannelValue;

  /**
   * Whether to enable or disable faceting; one of:
   *
   * - *auto* (default) - automatically determine if this mark should be faceted
   * - *include* (or true) - draw the subset of the mark’s data in the current facet
   * - *exclude* - draw the subset of the mark’s data *not* in the current facet
   * - *super* - draw this mark in a single frame that covers all facets
   * - null (or false) - repeat this mark’s data across all facets (*i.e.*, no faceting)
   *
   * When a mark uses *super* faceting, it is not allowed to use position scales
   * (*x*, *y*, *fx*, or *fy*); *super* faceting is intended for decorations,
   * such as labels and legends.
   *
   * When top-level faceting is used, the default *auto* setting is equivalent
   * to *include* when the mark data is strictly equal to the top-level facet
   * data; otherwise it is equivalent to null. When the *include* or *exclude*
   * facet mode is chosen, the mark data must be parallel to the top-level facet
   * data: the data must have the same length and order. If the data are not
   * parallel, then the wrong data may be shown in each facet. The default
   * *auto* therefore requires strict equality (`===`) for safety, and using the
   * facet data as mark data is recommended when using the *exclude* facet mode.
   * (To construct parallel data safely, consider using [*array*.map][1] on the
   * facet data.)
   *
   * When mark-level faceting is used, the default *auto* setting is equivalent
   * to *include*: the mark will be faceted if either the **fx** or **fy**
   * channel option (or both) is specified. The null or false option will
   * disable faceting, while *exclude* draws the subset of the mark’s data *not*
   * in the current facet.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
   */
  facet?: "auto" | "include" | "exclude" | "super" | boolean | null;

  /**
   * How to place the mark with respect to facets; one of:
   *
   * - null (default for most marks) - display the mark in each non-empty facet
   * - *top*, *right*, *bottom*, or *left* - display the mark only in facets on
   *   the given side
   * - *top-empty*, *right-empty*, *bottom-empty*, or *left-empty* (default for
   *   axis marks) - display the mark only in facets that have empty space on
   *   the given side: either the margin, or an empty facet
   * - *empty* - display the mark in empty facets only
   */
  facetAnchor?:
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-empty"
    | "right-empty"
    | "bottom-empty"
    | "left-empty"
    | "empty"
    | null;

  /**
   * Shorthand to set the same default for all four mark margins: **marginTop**,
   * **marginRight**, **marginBottom**, and **marginLeft**; typically defaults
   * to 0, except for axis marks.
   */
  margin?: number;

  /**
   * The mark’s top margin; the minimum distance in pixels between the top edges
   * of the inner and outer plot area.
   */
  marginTop?: number;

  /**
   * The mark’s right margin; the minimum distance in pixels between the right
   * edges of the mark’s inner and outer plot area.
   */
  marginRight?: number;

  /**
   * The mark’s bottom margin; the minimum distance in pixels between the bottom
   * edges of the inner and outer plot area.
   */
  marginBottom?: number;

  /**
   * The mark’s left margin; the minimum distance in pixels between the left
   * edges of the inner and outer plot area.
   */
  marginLeft?: number;

  /**
   * The [aria-description][1]; a constant textual description.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-description
   */
  ariaDescription?: string;

  /**
   * The [aria-hidden][1] state; a constant indicating whether the element is
   * exposed to an accessibility API.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-hidden
   */
  ariaHidden?: string;

  /**
   * The [aria-label][1]; a channel specifying short textual labels representing
   * the value in the accessibility tree.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label
   */
  ariaLabel?: ChannelValue;

  /**
   * The [pointer-events][1] property; a constant string such as *none*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events
   */
  pointerEvents?: string;

  /**
   * The title; a channel specifying accessible, short textual descriptions as
   * strings (possibly with newlines). If the tip option is specified, the title
   * will be displayed with an interactive tooltip instead of using the SVG
   * [title element][1].
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/title
   */
  title?: ChannelValue;

  /** Whether to generate a tooltip for this mark, and any tip options. */
  tip?: boolean | TipPointer | (TipOptions & {pointer?: TipPointer});

  /**
   * How to clip the mark; one of:
   *
   * - *frame* or true - clip to the plot’s frame (inner area)
   * - *sphere* - clip to the projected sphere (*e.g.*, front hemisphere)
   * - null or false - do not clip
   *
   * The *sphere* clip option requires a geographic projection.
   */
  clip?: "frame" | "sphere" | boolean | null;

  /**
   * The horizontal offset in pixels; a constant option. On low-density screens,
   * an additional 0.5px offset may be applied for crisp edges.
   */
  dx?: number;

  /**
   * The vertical offset in pixels; a constant option. On low-density screens,
   * an additional 0.5px offset may be applied for crisp edges.
   */
  dy?: number;

  /**
   * The [fill][1]; a constant CSS color string, or a channel typically bound to
   * the *color* scale. If all channel values are valid CSS colors, by default
   * the channel will not be bound to the *color* scale, interpreting the colors
   * literally.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill
   */
  fill?: ChannelValueSpec;

  /**
   * The [fill-opacity][1]; a constant number between 0 and 1, or a channel
   * typically bound to the *opacity* scale. If all channel values are numbers
   * in [0, 1], by default the channel will not be bound to the *opacity* scale,
   * interpreting the opacities literally.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-opacity
   */
  fillOpacity?: ChannelValueSpec;

  /**
   * The [stroke][1]; a constant CSS color string, or a channel typically bound
   * to the *color* scale. If all channel values are valid CSS colors, by
   * default the channel will not be bound to the *color* scale, interpreting
   * the colors literally.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke
   */
  stroke?: ChannelValueSpec;

  /**
   * The [stroke-dasharray][1]; a constant number indicating the length in
   * pixels of alternating dashes and gaps, or a constant string of numbers
   * separated by spaces or commas (_e.g._, *10 2* for dashes of 10 pixels
   * separated by gaps of 2 pixels), or *none* (the default) for no dashing
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
   */
  strokeDasharray?: string | number;

  /**
   * The [stroke-dashoffset][1]; a constant indicating the offset in pixels of
   * the first dash along the stroke; defaults to zero.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset
   */
  strokeDashoffset?: string | number;

  /**
   * The [stroke-linecap][1]; a constant specifying how to cap stroked paths,
   * such as *butt*, *round*, or *square*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap
   */
  strokeLinecap?: string;

  /**
   * The [stroke-linejoin][1]; a constant specifying how to join stroked paths,
   * such as *bevel*, *miter*, *miter-clip*, or *round*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin
   */
  strokeLinejoin?: string;

  /**
   * The [stroke-miterlimit][1]; a constant number specifying how to limit the
   * length of *miter* joins on stroked paths.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-miterlimit
   */
  strokeMiterlimit?: number;

  /**
   * The [stroke-opacity][1]; a constant between 0 and 1, or a channel typically
   * bound to the *opacity* scale. If all channel values are numbers in [0, 1],
   * by default the channel will not be bound to the *opacity* scale,
   * interpreting the opacities literally.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-opacity
   */
  strokeOpacity?: ChannelValueSpec;

  /**
   * The [stroke-width][1]; a constant number in pixels, or a channel.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width
   */
  strokeWidth?: ChannelValueSpec;

  /**
   * The [opacity][1]; a constant between 0 and 1, or a channel typically bound
   * to the *opacity* scale. If all channel values are numbers in [0, 1], by
   * default the channel will not be bound to the *opacity* scale, interpreting
   * the opacities literally. For faster rendering, prefer the **strokeOpacity**
   * or **fillOpacity** option.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/opacity
   */
  opacity?: ChannelValueSpec;

  /**
   * The [mix-blend-mode][1]; a constant string specifying how to blend content
   * such as *multiply*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode
   */
  mixBlendMode?: string;

  /**
   * A CSS [filter][1]; a constant string used to adjust the rendering of
   * images, such as *blur(5px)*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/filter
   */
  imageFilter?: string;

  /**
   * The [paint-order][1]; a constant string specifying the order in which the
   * **fill**, **stroke**, and any markers are drawn; defaults to *normal*,
   * which draws the fill, then stroke, then markers; defaults to *stroke* for
   * the text mark to create a “halo” around text to improve legibility.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/paint-order
   */
  paintOrder?: string;

  /**
   * The [shape-rendering][1]; a constant string such as *crispEdges*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering
   */
  shapeRendering?: string;

  /**
   * The [href][1]; a channel specifying URLs for clickable links. May be used
   * in conjunction with the **target** option to open links in another window.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/href
   */
  href?: ChannelValue;

  /**
   * The [target][1]; a constant string specifying the target window (_e.g._,
   * *_blank*) for clickable links; used in conjunction with the **href**
   * option.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/target
   */
  target?: string;

  /**
   * An object defining additional custom channels. This meta option may be used
   * by an **initializer** to declare extra channels.
   */
  channels?: Record<string, Channel | ChannelValue>;
}

/** The abstract base class for Mark implementations. */
export class Mark {
  /**
   * Renders a new plot, prepending this mark as the first element of **marks**
   * of the specified *options*, and returns the corresponding SVG element, or
   * an HTML figure element if a caption or legend is requested.
   */
  plot: typeof plot;
}

/** A concrete Mark implementation. */
export class RenderableMark extends Mark {
  /** Renders this mark, returning a new SVGElement (or null). */
  render: RenderFunction;
}

/** A compound Mark, comprising other marks. */
export type CompoundMark = Markish[] & Pick<Mark, "plot">;

/** Given an array of marks, returns a compound mark; supports *mark*.plot shorthand. */
export function marks(...marks: Markish[]): CompoundMark;
