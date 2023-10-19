import type {ChannelValueSpec} from "../channel.js";
import type {CurveOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the difference mark. */
export interface DifferenceOptions extends MarkOptions, CurveOptions {
  /**
   * The primary horizontal position channel, typically bound to the *x* scale;
   * if not specified, **x** is used.
   */
  x1?: ChannelValueSpec;

  /**
   * The secondary horizontal position channel, typically bound to the *x*
   * scale; if not specified, **x1** is used.
   */
  x2?: ChannelValueSpec;

  /**
   * The horizontal position channel, typically bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The primary vertical position channel, typically bound to the *y* scale; if
   * not specified, **y** is used.
   */
  y1?: ChannelValueSpec;

  /**
   * The secondary vertical position channel, typically bound to the *y* scale;
   * if not specified, **y1** is used.
   */
  y2?: ChannelValueSpec;

  /**
   * The vertical position channel, typically bound to the *y* scale.
   */
  y?: ChannelValueSpec;

  /**
   * The fill color when the primary value is greater than the secondary value;
   * defaults to green.
   */
  positiveColor?: ChannelValueSpec;

  /**
   * The fill color when the primary value is less than the secondary value;
   * defaults to blue.
   */
  negativeColor?: ChannelValueSpec;

  /**
   * The fill opacity; defaults to 1.
   */
  opacity?: number;

  /**
   * The fill opacity when the primary value is greater than the secondary
   * value; defaults to **opacity**.
   */
  positiveOpacity?: number;

  /**
   * The fill opacity when the primary value is less than the secondary value;
   * defaults to **opacity**.
   */
  negativeOpacity?: number;
}

/** TODO */
export function differenceY(data?: Data, options?: DifferenceOptions): Difference;

/** The difference mark. */
export class Difference extends RenderableMark {}
