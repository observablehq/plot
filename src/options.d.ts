import type {ChannelTransform, ChannelValue} from "./channel.js";
import type {Data} from "./mark.js";

export function valueof(data: Data | null, value: ChannelValue | null, type?: any): any[] | null;

export function column(source?: any): [ChannelTransform, <T>(value: T) => T];

export const identity: ChannelTransform;
