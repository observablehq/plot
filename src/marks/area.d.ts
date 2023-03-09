import type {ChannelValueSpec} from "../channel.js";
import type {CurveSpec} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface AreaOptions extends MarkOptions {
  x?: ChannelValueSpec; // TODO only for areaY?
  x1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y?: ChannelValueSpec; // TODO only for areaX?
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  z?: ChannelValueSpec;
  curve?: CurveSpec | "auto";
  tension?: number;
}

export function area(data?: Data, options?: AreaOptions): Area;

export function areaX(data?: Data, options?: AreaOptions): Area;

export function areaY(data?: Data, options?: AreaOptions): Area;

export class Area extends RenderableMark {}
