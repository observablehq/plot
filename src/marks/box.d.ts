import type {ChannelValueSpec} from "channel.js";
import type {CompoundMark, Data, MarkOptions} from "../mark.js";

export interface BoxOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
}

export function boxX(data?: Data, options?: BoxOptions): CompoundMark;

export function boxY(data?: Data, options?: BoxOptions): CompoundMark;
