import type {Data} from "./mark.js";
import type {ChannelTransform, ChannelValue} from "./channel.js";

export function valueof(data: Data | null, value: ChannelValue | null, type?: any): any;

export function column(source: any): (((v: any) => any) | {transform: () => any; label: any})[]; // TODO

export const identity: ChannelTransform;
