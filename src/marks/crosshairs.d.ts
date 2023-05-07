import type {ChannelValueSpec} from "../channel.js";
import type {CompoundMark, Data, MarkOptions} from "../mark.js";

/** Options for the crosshairs mark. */
export interface CrosshairsOptions extends MarkOptions {
  /**
   * The horizontal position channel specifying the crosshair’s center,
   * typically bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position channel specifying the crosshair’s center, typically
   * bound to the *y* scale.
   */
  y?: ChannelValueSpec;
}

/** TODO */
export function crosshairs(data?: Data, options?: CrosshairsOptions): CompoundMark;
