import type {ChannelReducers} from "../channel.js";
import type {Transformed} from "./basic.js";

export interface HexbinOptions {
  binWidth?: number;
}

export function hexbin<T>(outputs?: ChannelReducers, options?: T & HexbinOptions): Transformed<T>;
