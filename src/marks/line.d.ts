import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {CurveAutoOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerOptions} from "../marker.js";
import type {Reducer} from "../reducer.js";
import type {BinOptions} from "../transforms/bin.js";

export interface LineOptions extends MarkOptions, MarkerOptions, CurveAutoOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  z?: ChannelValue;
}

export interface LineXOptions extends LineOptions, BinOptions {
  y?: ChannelValueSpec & Omit<BinOptions, "interval">; // interval must be mark-level option
  reduce?: Reducer;
}

export interface LineYOptions extends LineOptions, BinOptions {
  x?: ChannelValueSpec & Omit<BinOptions, "interval">; // interval must be mark-level option
  reduce?: Reducer;
}

export function line(data?: Data, options?: LineOptions): Line;

export function lineX(data?: Data, options?: LineXOptions): Line;

export function lineY(data?: Data, options?: LineYOptions): Line;

export class Line extends RenderableMark {}
