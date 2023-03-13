import type {ChannelTransform, ChannelValue} from "../channel.js";
import type {Initialized} from "./basic.js";

export interface CentroidOptions {
  geometry?: ChannelValue;
}

export function centroid<T>(options?: T & CentroidOptions): Initialized<T>;

export function geoCentroid<T>(options?: T & CentroidOptions): T & {x: ChannelTransform; y: ChannelTransform};
