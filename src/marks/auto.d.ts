import type {ChannelValue} from "../channel.js";
import type {CompoundMark, Data} from "../mark.js";
import type {Reducer} from "../reducer.js";
import type {BinOptions} from "../transforms/bin.js";

/** Options for the auto mark. */
export interface AutoOptions {
  /**
   * The horizontal position channel (**value**) and reducer (**reduce**).
   *
   * The **x** channel is required if a **y** channel is not specified;
   * otherwise it is optional.
   *
   * If an **x** **reduce** is specified, a **y** channel is required and a
   * **y** reduce is not allowed; the **y** channel will be grouped, and the
   * reducer will be applied to each group’s associated **x** channel values (if
   * any). If a **y** channel is set, but no **x** channel, the **x** **reduce**
   * defaults to *count* to produce a histogram by grouping on **y**; disable
   * this by setting the **x** **reduce** to null.
   *
   * The **zero** option, if true, draws a vertical rule at *x* = 0, and ensures
   * that the default *x* scale domain includes 0.
   */
  x?: ChannelValue | Reducer | ({value?: ChannelValue; reduce?: Reducer | null; zero?: boolean} & BinOptions);

  /**
   * The vertical position channel (**value**) and reducer (**reduce**).
   *
   * The **y** channel is required if an **x** channel is not specified;
   * otherwise it is optional.
   *
   * If a **y** **reduce** is specified, an **x** channel is required, and an
   * **x** reduce is not allowed; the **x** channel will be grouped, and the
   * reducer will be applied to each group’s associated **y** channel values (if
   * any). If a **x** channel is set, but no **y** channel, the **y** **reduce**
   * defaults to *count* to produce a histogram by grouping on **x**; disable
   * this by setting the **y** **reduce** to null.
   *
   * The **zero** option, if true, draws a horizontal rule at *y* = 0, and
   * ensures that the default *y* scale domain includes 0.
   */
  y?: ChannelValue | Reducer | ({value?: ChannelValue; reduce?: Reducer | null; zero?: boolean} & BinOptions);

  /**
   * The color channel (**value**) and reducer (**reduce**), or a constant color
   * such as *red* for aesthetics (**color**). This option corresponds to the
   * **stroke** channel for dots, lines, and rules, and the **fill** channel for
   * areas and bars. If a color channel or reducer is specified, the constant
   * color is ignored.
   *
   * If neither a **x** nor **y** **reduce** is specified, but a **color**
   * **reduce** is specified, both the **x** and **y** channels (if any) will be
   * grouped, and the reducer will be applied to each group’s associated
   * **color** channel values (if any), say to produce a heatmap.
   */
  color?: ChannelValue | Reducer | {value?: ChannelValue; reduce?: Reducer | null; color?: string};

  /**
   * The size channel (**value**) and reducer (**reduce**). This option
   * corresponds to the **r** channel for dots; it may correspond to the
   * **length** of vectors in the future.
   *
   * If neither a **x** nor **y** **reduce** is specified, but a **size**
   * **reduce** is specified, both the **x** and **y** channels (if any) will be
   * grouped, and the reducer will be applied to each group’s associated
   * **size** channel values (if any), say to produce a binned scatterplot.
   */
  size?: ChannelValue | Reducer | {value?: ChannelValue; reduce?: Reducer | null};

  /**
   * The horizontal facet position channel (**value**), for mark-level faceting,
   * bound to the *fx* scale.
   */
  fx?: ChannelValue | {value?: ChannelValue};

  /**
   * The vertical facet position channel (**value**), for mark-level faceting,
   * bound to the *fy* scale.
   */
  fy?: ChannelValue | {value?: ChannelValue};

  /**
   * The desired mark type; one of:
   *
   * - *area* - an area
   * - *bar* - a rect, cell, or bar (depending on the data type)
   * - *dot* - a dot
   * - *line* - a line
   * - *rule* - a rule
   *
   * Whenever possible, avoid setting the mark type; the default mark type
   * should usually suffice, and setting an explicit mark type may lead to a
   * nonsensical plot (especially if you change other options).
   */
  mark?: "area" | "bar" | "dot" | "line" | "rule";
}

/**
 * An auto options object with nothing left undefined, as returned by
 * Plot.autoSpec; the mark type, reducers, and other options will be populated.
 */
export interface AutoSpec extends AutoOptions {
  x: {value: ChannelValue; reduce: Reducer | null; zero: boolean} & BinOptions;
  y: {value: ChannelValue; reduce: Reducer | null; zero: boolean} & BinOptions;
  color: {value: ChannelValue; reduce: Reducer | null; color?: string};
  size: {value: ChannelValue; reduce: Reducer | null};
  fx: ChannelValue;
  fy: ChannelValue;
  mark: NonNullable<AutoOptions["mark"]>;
}

/**
 * Returns a fully-specified *options* object for the auto mark, with nothing
 * left undefined. This is mostly for internal use, but can be used to “lock
 * down” the specification of an auto mark or to interrogate its behavior. For
 * example, if you say
 *
 * ```js
 * Plot.autoSpec(penguins, {x: "body_mass_g"})
 * ```
 *
 * the returned object will have **y** set to {value: null, reduce: *count*} and
 * **mark** set to *bar*, telling you that a histogram will be rendered.
 */
export function autoSpec(data?: Data, options?: AutoOptions): AutoSpec;

/**
 * Returns a new mark whose implementation is chosen dynamically to best
 * represent the dimensions of the given *data* specified in *options*,
 * according to a few simple heuristics. The auto mark seeks to provide a useful
 * initial plot as quickly as possible through opinionated defaults, and to
 * accelerate exploratory analysis by letting you refine views with minimal
 * changes to code. For example, for a histogram of penguins binned by weight:
 *
 * ```js
 * Plot.auto(penguins, {x: "body_mass_g"})
 * ```
 */
export function auto(data?: Data, options?: AutoOptions): CompoundMark;
