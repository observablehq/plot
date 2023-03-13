import type {ChannelValueSpec} from "../channel.js";
import type {CurveAutoOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerOptions} from "../marker.js";

export interface LinkOptions extends MarkOptions, MarkerOptions, CurveAutoOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  x1?: ChannelValueSpec;
  y1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y2?: ChannelValueSpec;
}

export function link(data?: Data, options?: LinkOptions): Link;

export class Link extends RenderableMark {}
