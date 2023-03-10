import type {ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface ArrowOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  x1?: ChannelValueSpec;
  y1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  bend?: number | boolean;
  headAngle?: number;
  headLength?: number;
  inset?: number;
  insetStart?: number;
  insetEnd?: number;
}

export function arrow(data?: Data, options?: ArrowOptions): Arrow;

export class Arrow extends RenderableMark {}
