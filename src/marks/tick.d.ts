import type {ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface TickOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  inset?: number;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
}

export function tickX(data?: Data, options?: TickOptions): TickX;

export function tickY(data?: Data, options?: TickOptions): TickY;

export class TickX extends RenderableMark {}

export class TickY extends RenderableMark {}
