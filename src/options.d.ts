import type {Data} from "./mark.js";
import type {ChannelTransform, ChannelValue} from "./channel.js";

export function valueof(data: Data, value: ChannelValue | null, type?: any): any;

export function column(source: any): (((v: any) => any) | {transform: () => any; label: any})[]; // TODO

export const identity: ChannelTransform;

export type FrameAnchor =
  | "middle"
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left";
