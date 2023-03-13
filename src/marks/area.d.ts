import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {CurveAutoOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {Reducer} from "../reducer.js";
import type {BinOptions} from "../transforms/bin.js";
import type {StackOptions} from "../transforms/stack.js";

export interface AreaOptions extends MarkOptions, StackOptions, CurveAutoOptions {
  x1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  z?: ChannelValue;
}

export interface AreaXOptions extends Omit<AreaOptions, "y1" | "y2">, BinOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec & Omit<BinOptions, "interval">; // interval must be a mark-level option
  reduce?: Reducer;
}

export interface AreaYOptions extends Omit<AreaOptions, "x1" | "x2">, BinOptions {
  x?: ChannelValueSpec & Omit<BinOptions, "interval">; // interval must be a mark-level option
  y?: ChannelValueSpec;
  reduce?: Reducer;
}

export function area(data?: Data, options?: AreaOptions): Area;

export function areaX(data?: Data, options?: AreaXOptions): Area;

export function areaY(data?: Data, options?: AreaYOptions): Area;

export class Area extends RenderableMark {}
