import type {ChannelValue, ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";
import type {SymbolType} from "../symbol.js";

export interface DotOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  r?: ChannelValueSpec | number;
  rotate?: ChannelValue | number;
  /**
   * The categorical symbol; if a channel, bound to the *symbol* scale. A
   * constant symbol can be specified by a name such as *star*, or by its
   * implementation as a function of the *context* and *size*. Defaults to
   * *circle* for the **dot** mark, and *hexagon* for the **hexagon** mark.
   */
  symbol?: ChannelValueSpec | SymbolType;
  frameAnchor?: FrameAnchor;
}

export interface DotXOptions extends Omit<DotOptions, "y"> {
  y?: ChannelValueIntervalSpec;
  interval?: Interval;
}

export interface DotYOptions extends Omit<DotOptions, "x"> {
  x?: ChannelValueIntervalSpec;
  interval?: Interval;
}

export function dot(data?: Data, options?: DotOptions): Dot;

export function dotX(data?: Data, options?: DotXOptions): Dot;

export function dotY(data?: Data, options?: DotYOptions): Dot;

export function circle(data?: Data, options?: Exclude<DotOptions, "symbol">): Dot;

export function hexagon(data?: Data, options?: Exclude<DotOptions, "symbol">): Dot;

export class Dot extends RenderableMark {}
