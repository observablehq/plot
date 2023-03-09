import type {ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface RectOptions extends MarkOptions {
  x?: ChannelValueSpec; // TODO x: {value, interval}
  x1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y?: ChannelValueSpec; // TODO y: {value, interval}
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  interval?: Interval;
  inset?: number;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
  rx?: number | string;
  ry?: number | string;
}

export function rect(data?: Data, options?: RectOptions): Rect;

export function rectX(data?: Data, options?: RectOptions): Rect;

export function rectY(data?: Data, options?: RectOptions): Rect;

export class Rect extends RenderableMark {}
