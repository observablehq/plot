import type {ChannelOutputs, ChannelReducers} from "../channel.js";
import type {Transformed} from "./basic.js";

export interface HexbinOptions {
  binWidth?: number;
}

export function hexbin<T, S extends ChannelReducers>(
  outputs?: S,
  options?: T & HexbinOptions
): Transformed<Omit<T, keyof (S & HexbinOptions)> & ChannelOutputs<S>>;
