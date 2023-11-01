import type {ChannelName} from "../channel.js";
import type {Transformed} from "./basic.js";
import type {GroupOutputOptions} from "./group.js";

/**
 * Output channels for the find transform. Each declared output channel has an
 * associated test function, and typically a corresponding input channel in
 * *options*.
 */
export type ChannelTests = {[key in ChannelName]?: (value: any, index: number, values: any[]) => unknown};

/** Output channels (and options) for the find transform. */
export type FindOutputs = ChannelTests | GroupOutputOptions;

/** TODO */
export function findX<T>(outputs?: FindOutputs, options?: T): Transformed<T>;
