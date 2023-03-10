import type {ChannelValueSpec} from "../channel.js";
import type {CurveSpec} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerSpec} from "../marker.js";

export interface LinkOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  x1?: ChannelValueSpec;
  y1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  curve?: CurveSpec | "auto";
  tension?: number;
  marker?: MarkerSpec;
  markerStart?: MarkerSpec;
  markerMid?: MarkerSpec;
  markerEnd?: MarkerSpec;
}

export function link(data?: Data, options?: LinkOptions): Link;

export class Link extends RenderableMark {}
