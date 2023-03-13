import type {ChannelValue, ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";
import type {SymbolImplementation, SymbolName} from "../symbol.js";

export interface DotOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  r?: ChannelValueSpec | number;
  rotate?: ChannelValue | number;
  symbol?: ChannelValueSpec | SymbolName | SymbolImplementation;
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
