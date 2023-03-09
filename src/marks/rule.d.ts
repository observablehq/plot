import type {ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface RuleXOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec; // TODO y: {value, interval}
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  interval?: Interval;
  inset?: number;
  insetTop?: number;
  insetBottom?: number;
}

export interface RuleYOptions extends MarkOptions {
  y?: ChannelValueSpec;
  x?: ChannelValueSpec; // TODO x: {value, interval}
  x1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  interval?: Interval;
  inset?: number;
  insetRight?: number;
  insetLeft?: number;
}

export function ruleX(data?: Data, options?: RuleXOptions): RuleX;

export function ruleY(data?: Data, options?: RuleYOptions): RuleY;

export class RuleX extends RenderableMark {}

export class RuleY extends RenderableMark {}
