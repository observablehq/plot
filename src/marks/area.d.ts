import type {ChannelValueSpec} from "../channel.js";
import type {CurveAutoOptions} from "../curve.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {Reducer} from "../reducer.js";
import type {StackOptions} from "../transforms/stack.js";

export interface AreaOptions extends MarkOptions, StackOptions, CurveAutoOptions {
  x?: ChannelValueSpec; // TODO only for areaY?
  x1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y?: ChannelValueSpec; // TODO only for areaX?
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  z?: ChannelValueSpec;
  interval?: Interval; // TODO x- or y-specific intervals?
  reduce?: Reducer;
}

export function area(data?: Data, options?: AreaOptions): Area;

export function areaX(data?: Data, options?: AreaOptions): Area;

export function areaY(data?: Data, options?: AreaOptions): Area;

export class Area extends RenderableMark {}
