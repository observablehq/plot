import type {ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface RuleXOptions extends MarkOptions, Omit<InsetOptions, "insetLeft" | "insetRight"> {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec; // TODO y: {value, interval}
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  interval?: Interval;
}

export interface RuleYOptions extends MarkOptions, Omit<InsetOptions, "insetTop" | "insetBottom"> {
  y?: ChannelValueSpec;
  x?: ChannelValueSpec; // TODO x: {value, interval}
  x1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  interval?: Interval;
}

export function ruleX(data?: Data, options?: RuleXOptions): RuleX;

export function ruleY(data?: Data, options?: RuleYOptions): RuleY;

export class RuleX extends RenderableMark {}

export class RuleY extends RenderableMark {}
