import type {ChannelValueSpec} from "../channel.js";
import type {Data, RenderableMark} from "../mark.js";
import type {RectOptions} from "./rect.js";

export interface BarXOptions extends RectOptions {
  x1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y?: ChannelValueSpec;
}

export interface BarYOptions extends RectOptions {
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  x?: ChannelValueSpec;
}

export function barX(data?: Data | null, options?: BarXOptions): BarX;

export function barY(data?: Data | null, options?: BarYOptions): BarY;

export class BarX extends RenderableMark {}

export class BarY extends RenderableMark {}
