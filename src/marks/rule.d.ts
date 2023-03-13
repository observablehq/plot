import type {ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

interface RuleOptions extends MarkOptions {
  interval?: Interval;
}

export interface RuleXOptions extends RuleOptions, Omit<InsetOptions, "insetLeft" | "insetRight"> {
  x?: ChannelValueSpec;
  y?: ChannelValueIntervalSpec;
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
}

export interface RuleYOptions extends RuleOptions, Omit<InsetOptions, "insetTop" | "insetBottom"> {
  x?: ChannelValueIntervalSpec;
  x1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y?: ChannelValueSpec;
}

export function ruleX(data?: Data, options?: RuleXOptions): RuleX;

export function ruleY(data?: Data, options?: RuleYOptions): RuleY;

export class RuleX extends RenderableMark {}

export class RuleY extends RenderableMark {}
