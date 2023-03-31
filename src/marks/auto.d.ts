import type {ChannelValue} from "../channel.js";
import type {CompoundMark, Data} from "../mark.js";
import type {Reducer} from "../reducer.js";
import type {BinOptions} from "../transforms/bin.js";

/** Options for the auto mark. */
export interface AutoOptions {
  /**
   * The horizontal position channel and reducer.
   *
   * If **y** is set without **x**, **x** defaults to the *count* reducer to
   * produce a histogram; you can override this by passing {reduce: null}.
   *
   * Setting **reduce** will automatically bin or group on **y**.
   *
   * Setting **zero** draws a vertical rule where *x* = 0.
   */
  x?: ChannelValue | Reducer | ({value?: ChannelValue; reduce?: Reducer | null; zero?: boolean} & BinOptions);

  /**
   * The vertical position channel and reducer.
   *
   * If **x** is set without **y**, **y** defaults to the *count* reducer to
   * produce a histogram; you can override this by passing {reduce: null}.
   */
  y?: ChannelValue | Reducer | ({value?: ChannelValue; reduce?: Reducer | null; zero?: boolean} & BinOptions);

  /**
   * The color channel and reducer.
   *
   * which corresponds to the stroke channel for dots, lines, and rules, and the
   * fill channel for areas and bars.
   *
   * Setting **reduce** will automatically bin or group on both **x** and **y**.
   */
  color?: ChannelValue | Reducer | {value?: ChannelValue; reduce?: Reducer | null; color?: string};

  /**
   * The size channel and reducer.
   *
   * The size encoding corresponds to the radius channel of dots; it may
   * correspond to the length of vectors in the future.
   *
   * Setting **reduce** will automatically bin or group on both **x** and **y**.
   */
  size?: ChannelValue | Reducer | {value?: ChannelValue; reduce?: Reducer | null};

  /**
   * The horizontal facet position channel, for mark-level faceting, bound to
   * the *fx* scale.
   */
  fx?: ChannelValue | {value?: ChannelValue};

  /**
   * The vertical facet position channel, for mark-level faceting, bound to the
   * *fy* scale.
   */
  fy?: ChannelValue | {value?: ChannelValue};

  /**
   * A type of mark; for example, the type *bar* encompasses bar, barX, and
   * barY. Used to guide what sort of mark **auto** should use. It should be
   * thought of as an override; *auto* should usually do the right thing without
   * it, and will try its best with it, but setting the mark type may lead to a
   * nonsensical plot.
   *
   * One of the categories of mark; *line* includes lineX and lineY; *area*
   * includes areaX and areaY; *rule* includes ruleX and ruleY; *bar* includes
   * barX, barY, rectX, and rectY; and *dot* is just dot.
   */
  mark?: "dot" | "line" | "area" | "rule" | "bar";
}

/**
 * An auto options object with nothing left undefined. Automatically inferred
 * mark type, reducers, and zero (baseline) options will be filled in; anything
 * else left undefined will be null.
 */
export interface AutoSpec extends AutoOptions {
  /**
   * Like auto’s **x** option, but with nothing left undefined. The reduce value
   * may be automatically inferred to be *count* if **x** wasn’t set and a
   * histogram will be drawn.
   */
  x: {value: ChannelValue; reduce: Reducer | null; zero: boolean} & BinOptions;

  /**
   * Like auto’s **y** option, but with nothing left undefined. The reduce value
   * may be automatically inferred to be *count* if **y** wasn’t set and a
   * histogram will be drawn.
   */
  y: {value: ChannelValue; reduce: Reducer | null; zero: boolean} & BinOptions;

  /**
   * Like auto’s **color** option, but with nothing left undefined.
   */
  color: {value: ChannelValue; reduce: Reducer | null; color: string};

  /**
   * Like auto’s **size** option, but with nothing left undefined.
   */
  size: {value: ChannelValue; reduce: Reducer | null};

  /**
   * Like auto’s **fx** option, but with nothing left undefined.
   */
  fx: ChannelValue;

  /**
   * Like auto’s **fy** option, but with nothing left undefined.
   */
  fy: ChannelValue;

  /**
   * Like auto’s **mark** option, but never undefined; if no mark type was
   * passed in, shows the inferred mark type that will be rendered.
   */
  mark: NonNullable<AutoOptions["mark"]>;
}

/**
 * Returns a fully-specified *auto* options object, with nothing left undefined.
 * This is mostly for internal use, but it can be used to “lock down” the
 * specification of an **auto** mark, or to inspect the decisions its heuristic
 * is making.
 *
 * For example, if you pass in:
 *
 * ```js
 * Plot.autoSpec(penguins, {x: "body_mass_g"})
 * ```
 *
 * the returned object will have **y** set to {value: null, reduce: "count"} and
 * **mark** set to *bar*, which tells you that a histogram will be rendered.
 */
export function autoSpec(data?: Data, options?: AutoOptions): AutoSpec;

/**
 * Automatically selects a mark type that best represents the dimensions of the
 * given data according to some simple heuristics. Plot.auto seeks to provide a
 * useful initial plot as quickly as possible through opinionated defaults, and
 * to accelerate exploratory analysis by letting you refine views with minimal
 * changes to code.
 *
 * For example, for a histogram of penguins binned by weight:
 *
 * ```js
 * Plot.auto(penguins, {x: "body_mass_g"})
 * ```
 */
export function auto(data?: Data, options?: AutoOptions): CompoundMark;
