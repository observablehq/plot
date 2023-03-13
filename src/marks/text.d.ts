import type {ChannelValue, ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";

export type TextAnchor = "start" | "middle" | "end";

export type LineAnchor = "top" | "middle" | "bottom";

export type TextOverflow =
  | "clip"
  | "ellipsis"
  | "clip-start"
  | "clip-end"
  | "ellipsis-start"
  | "ellipsis-middle"
  | "ellipsis-end";

export interface TextOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  text?: ChannelValue;
  frameAnchor?: FrameAnchor;
  textAnchor?: TextAnchor;
  lineAnchor?: LineAnchor;
  lineHeight?: number;
  lineWidth?: number;
  textOverflow?: TextOverflow;
  monospace?: boolean;
  fontFamily?: string;
  fontSize?: ChannelValue;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string | number;
  rotate?: ChannelValue;
}

export interface TextXOptions extends Omit<TextOptions, "y"> {
  y?: ChannelValueIntervalSpec;
  interval?: Interval;
}

export interface TextYOptions extends Omit<TextOptions, "x"> {
  x?: ChannelValueIntervalSpec;
  interval?: Interval;
}

export function text(data?: Data, options?: TextOptions): Text;

export function textX(data?: Data, options?: TextXOptions): Text;

export function textY(data?: Data, options?: TextYOptions): Text;

export class Text extends RenderableMark {}
