import type {ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface TickXOptions extends MarkOptions, Omit<InsetOptions, "insetLeft" | "insetRight"> {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
}

export interface TickYOptions extends MarkOptions, Omit<InsetOptions, "insetTop" | "insetBottom"> {
  y?: ChannelValueSpec;
  x?: ChannelValueSpec;
}

export function tickX(data?: Data, options?: TickXOptions): TickX;

export function tickY(data?: Data, options?: TickYOptions): TickY;

export class TickX extends RenderableMark {}

export class TickY extends RenderableMark {}
