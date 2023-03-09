import type {ChannelValueSpec} from "../channel.js";
import type {CurveSpec} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerSpec} from "../marker.js";

export interface LineOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  z?: ChannelValueSpec;
  curve?: CurveSpec | "auto";
  tension?: number;
  marker?: MarkerSpec;
  markerStart?: MarkerSpec;
  markerMid?: MarkerSpec;
  markerEnd?: MarkerSpec;
}

export function line(data?: Data, options?: LineOptions): Line;

export function lineX(data?: Data, options?: LineOptions): Line;

export function lineY(data?: Data, options?: LineOptions): Line;

export class Line extends RenderableMark {}
