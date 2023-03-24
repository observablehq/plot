import type {ChannelValue} from "../channel.js";
import type {CompoundMark, Data} from "../mark.js";
import type {Reducer} from "../reducer.js";
import type {BinOptions} from "../transforms/bin.js";

// TODO: should jsdoc go here or inside interface?
type MarkType = "dot" | "line" | "area" | "rule" | "bar";

export interface AutoOptions {
  /**
   * The horizontal spatial encoding. If *y* is set without *x*, the *x* channel
   * will default to the **count** reducer to produce a histogram; you can
   * override this by passing {reduce: null}.
   */
  x?: ChannelValue | Reducer | ({value?: ChannelValue; reduce?: Reducer | null; zero?: boolean} & BinOptions);
  /**
   * The vertical spatial encoding. If *x* is set without *y*, the *y* channel
   * will default to the **count** reducer to produce a histogram; you can
   * override this by passing {reduce: null}.
   */
  y?: ChannelValue | Reducer | ({value?: ChannelValue; reduce?: Reducer | null; zero?: boolean} & BinOptions);
  /**
   * The color encoding, which corresponds to the stroke channel for dots,
   * lines, and rules, and the fill channel for areas and bars.
   */
  color?: ChannelValue | Reducer | {value?: ChannelValue; reduce?: Reducer | null; color?: string};
  /**
   * The size encoding corresponds to the radius channel of dots; it may
   * correspond to the length of vectors in the future.
   */
  size?: ChannelValue | Reducer | {value?: ChannelValue; reduce?: Reducer | null};
  /**
   * The horizontal facet dimension.
   */
  fx?: ChannelValue | {value?: ChannelValue};
  /**
   * The vertical facet dimension.
   */
  fy?: ChannelValue | {value?: ChannelValue};
  /**
   * A type of mark; for example, the type **bar** encompasses bar, barX, and
   * barY. Used to guide what sort of mark *auto* should use. It should be thought
   * of as as an override; *auto* should usually do the right thing without it,
   * and will try its best with it, but setting the mark type may lead to a
   * nonsensical plot.
   */
  mark?: MarkType;
}

// TODO: repeat everything here, or is there a better way?
export interface AutoSpec extends AutoOptions {
  x: {value: ChannelValue; reduce: Reducer | null; zero?: boolean} & BinOptions;
  y: {value: ChannelValue; reduce: Reducer | null; zero?: boolean} & BinOptions;
  color: {value: ChannelValue; reduce: Reducer | null; color?: string};
  size: {value: ChannelValue; reduce: Reducer | null};
  fx: ChannelValue;
  fy: ChannelValue;
  mark: MarkType;
}

/**
 * Returns a fully-specified *auto* options object, with nothing left undefined.
 * This is mostly for internal use, but it can be used to “lock down” the
 * specification of an *auto* mark, or to inspect the decisions its heuristic is
 * making.
 */
export function autoSpec(data?: Data, options?: AutoOptions): AutoSpec;

/**
 * Automatically selects a mark type that best represents the dimensions of the
 * given data according to some simple heuristics. Plot.auto seeks to provide a
 * useful initial plot as quickly as possible through opinionated defaults, and
 * to accelerate exploratory analysis by letting you refine views with minimal
 * changes to code.
 */
export function auto(data?: Data, options?: AutoOptions): CompoundMark;
