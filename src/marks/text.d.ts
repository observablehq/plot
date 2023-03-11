import type {ChannelValueSpec} from "../channel.js";
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
  text?: ChannelValueSpec;
  frameAnchor?: FrameAnchor;
  textAnchor?: TextAnchor;
  lineAnchor?: LineAnchor;
  lineHeight?: number;
  lineWidth?: number;
  textOverflow?: TextOverflow;
  monospace?: boolean;
  fontFamily?: string;
  fontSize?: ChannelValueSpec;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string | number;
  rotate?: ChannelValueSpec;
}

export function text(data?: Data, options?: TextOptions): Text;

export function textX(data?: Data, options?: TextOptions): Text;

export function textY(data?: Data, options?: TextOptions): Text;

export class Text extends RenderableMark {}
