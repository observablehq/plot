import type {ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {StackOptions} from "../transforms/stack.js";

export interface RectOptions extends MarkOptions, InsetOptions, StackOptions {
  x?: ChannelValueIntervalSpec;
  x1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y?: ChannelValueIntervalSpec;
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  interval?: Interval;
  rx?: number | string;
  ry?: number | string;
}

export interface RectXOptions extends RectOptions {
  x?: ChannelValueSpec; // disallow x interval
}

export interface RectYOptions extends RectOptions {
  y?: ChannelValueSpec; // disallow y interval
}

export function rect(data?: Data, options?: RectOptions): Rect;

export function rectX(data?: Data, options?: RectXOptions): Rect;

export function rectY(data?: Data, options?: RectYOptions): Rect;

export class Rect extends RenderableMark {}
