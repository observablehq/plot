import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {StackOptions} from "../transforms/stack.js";

export interface RectOptions extends MarkOptions, InsetOptions, StackOptions {
  x?: ChannelValueSpec | {value: ChannelValue; interval?: Interval}; // TODO scale override?
  x1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y?: ChannelValueSpec | {value: ChannelValue; interval?: Interval}; // TODO scale override?
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  interval?: Interval;
  rx?: number | string;
  ry?: number | string;
}

export interface RectXOptions extends Omit<RectOptions, "y"> {
  y?: ChannelValueSpec;
}

export interface RectYOptions extends Omit<RectOptions, "x"> {
  x?: ChannelValueSpec;
}

export function rect(data?: Data, options?: RectOptions): Rect;

export function rectX(data?: Data, options?: RectXOptions): Rect;

export function rectY(data?: Data, options?: RectYOptions): Rect;

export class Rect extends RenderableMark {}
