import type {ChannelDomainSort, Channels, ChannelValue, ChannelValues, ChannelValueSpec} from "./channel.js";
import type {Context} from "./context.js";
import type {Dimensions} from "./dimensions.js";
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
  context: Context
) => SVGElement | null;

/**
 * A mark implementation or mark-like object; one of:
 *
 * - a renderable mark, extending Mark and implementing *mark*.render
 * - a bare render function, for a one-off custom mark
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
   * Either applies a transform to sort the mark’s render index by the specified
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
   * sort: {y: {value: "x", reverse: true}}
   * ```
   *
   * When sorting the mark’s render index, the **sort** option is instead one
   * of:
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

  /**
   * The horizontal facet position, an optional channel for mark-level faceting
   * bound to the *fx* scale.
   */
  fx?: ChannelValue;

  /**
   * The vertical facet position, an optional channel for mark-level faceting
   * bound to the *fy* scale.
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

  /** A textual description for the mark. */
  ariaDescription?: string;

  /**
   * The [aria-hidden][1] state, indicating whether the element is exposed to an
   * accessibility API.
   *
   * [1]:
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-hidden
   */
  ariaHidden?: string;

  /** A short label representing the value in the accessibility tree. */
  ariaLabel?: ChannelValue;

  /**
   * The [pointer events][1] (*e.g.*, *none*).
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events
   */
  pointerEvents?: string;

  /**
   * An accessible, short-text description (a string of text, possibly with
   * newlines).
   */
  title?: ChannelValue;

  /**
   * If the **clip** option is *frame* (or equivalently true), the mark is
   * clipped to the frame’s dimensions; if the **clip** option is null (or
   * equivalently false), the mark is not clipped. If the **clip** option is
   * *sphere*, then a geographic projection is required and the mark will be
   * clipped to the projected sphere (_e.g._, the front hemisphere when using
   * the orthographic projection).
   */
  clip?: "frame" | "sphere" | boolean | null;

  /**
   * A constant horizontal offset—possibly including a 0.5px offset on
   * low-density screens—, in pixels. See **dy** for the vertical offset.
   */
  dx?: number;

  /**
   * A constant vertical offset—possibly including a 0.5px offset on low-density
   * screens—, in pixels. See **dx** for the horizontal offset.
   */
  dy?: number;

  /**
   * The fill color, a constant valid CSS string, or a channel, typically bound
   * to the *color* scale. If all color values across all channels are valid CSS
   * colors, the *color* scale defaults to identity.
   */
  fill?: ChannelValueSpec;

  /**
   * The fill opacity, a constant between 0 and 1, or a channel, typically bound
   * to the *opacity* scale. If all opacity channel values across all marks are
   * in the [0, 1] range, the *opacity* scale defaults to identity.
   */
  fillOpacity?: ChannelValueSpec;

  /**
   * The stroke color, to paint the outline of each shape. A constant valid CSS
   * string, or a channel, typically bound to the *color* scale. If all color
   * values across all channels are valid CSS colors, the *color* scale defaults
   * to identity.
   */
  stroke?: ChannelValueSpec;

  /**
   * The [stroke-dasharray][1], defining the pattern of dashes and gaps used to
   * paint the outline of the shape. Can be specified as:
   * - a single number; _e.g._ 4 for dashes of 4 pixels separated by gaps of 4
   *   pixels
   * - a string with as many numbers as necessary, separated by spaces; _e.g._
   *   *10 2* for dashes of 10 pixels, separated by gaps of 2 pixels.
   *
   * [1]:
   * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
   */
  strokeDasharray?: string | number;

  /**
   * An offset for the stroke-dasharray. A typical setting is ½ of the first
   * value of the mark’s dash-array, for visual balance.
   */
  strokeDashoffset?: string | number;

  /**
   * How to cap lines (*butt*, *round*, or *square*). See [stroke-linecap][1].
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap
   */
  strokeLinecap?: string;

  /**
   * How to join lines (*bevel*, *miter*, *miter-clip*, or *round*). See [stroke-linejoin][1].
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin
   */
  strokeLinejoin?: string;

  /**
   * A limit to the length of *miter* joins. See [stroke-miterlimit][1].
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-miterlimit
   */
  strokeMiterlimit?: number;

  /**
   * The stroke opacity, a constant between 0 and 1, or a channel, typically
   * bound to the *opacity* scale. If all opacity channel values across all
   * marks are in the [0, 1] range, the *opacity* scale defaults to identity.
   */
  strokeOpacity?: ChannelValueSpec;

  /**
   * A constant or variable stroke width (in pixels).
   */
  strokeWidth?: ChannelValueSpec;

  /**
   * An object opacity; a constant in [0, 1], or a channel bound to the
   * *opacity* scale.  If all opacity channel values across all marks are in the
   * [0, 1] range, the *opacity* scale defaults to identity.
   */
  opacity?: ChannelValueSpec;

  /**
   * The [blend mode][1] (*e.g.*, *multiply*).
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode
   */
  mixBlendMode?: string;

  /**
   * The [paint order][1], defaults to null (equivalent to *fill*) for all
   * geometric marks, which are filled before the stroke is applied; defaults to
   * *stroke* for text marks, to create a “halo” around text while keeping it readable.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/CSS/paint-order
   */
  paintOrder?: string;

  /**
   * The [shape-rendering mode][1] (*e.g.*, *crispEdges*).
   *
   * [1]:
   * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering
   */
  shapeRendering?: string;

  /**
   * A channel of URLs to link to. For example, to create a gallery:
   *
   * ```js
   * Plot.image(*gallery*, {x: (d, i) => i, href: "link", target: "_blank"})
   * ```
   */
  href?: ChannelValue;

  /**
   * The link target (e.g., *_blank* for a new window); for use with the **href** channel.
   */
  target?: string;

  /**
   * Custom channels, usually declared by an initializer that desires a channel
   * that is not supported by the downstream mark.
   */
  channels?: Channels;
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

/** Given an array of marks, returns a compound mark; supports *mark.plot shorthand. */
export function marks(...marks: Markish[]): CompoundMark;
