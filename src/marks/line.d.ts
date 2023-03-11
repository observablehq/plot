import type {ChannelValueSpec, Reducer} from "../channel.js";
import type {CurveAutoOptions} from "../curve.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerOptions} from "../marker.js";

export interface LineOptions extends MarkOptions, MarkerOptions, CurveAutoOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  z?: ChannelValueSpec;
  interval?: Interval; // TODO x- or y-specific intervals?
  reduce?: Reducer;
}

export function line(data?: Data, options?: LineOptions): Line;

export function lineX(data?: Data, options?: LineOptions): Line;

export function lineY(data?: Data, options?: LineOptions): Line;

export class Line extends RenderableMark {}
