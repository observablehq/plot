import type {ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {InsetOptions} from "../inset.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {StackOptions} from "../transforms/stack.js";

interface BarOptions extends MarkOptions, InsetOptions, StackOptions {
  interval?: Interval;
  rx?: number | string;
  ry?: number | string;
}

export interface BarXOptions extends BarOptions {
  x?: ChannelValueIntervalSpec;
  x1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y?: ChannelValueSpec;
}

export interface BarYOptions extends BarOptions {
  y?: ChannelValueIntervalSpec;
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  x?: ChannelValueSpec;
}

export function barX(data?: Data, options?: BarXOptions): BarX;

export function barY(data?: Data, options?: BarYOptions): BarY;

export class BarX extends RenderableMark {}

export class BarY extends RenderableMark {}
