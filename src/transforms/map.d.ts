import type {ChannelName} from "../channel.js";
import type {Transformed} from "./basic.js";

export type MapFunction<S, T = S> = (values: S[]) => T[];

export type MapName = "cumsum" | "rank" | "quantile";

export interface MapImplementation<S, T = S> {
  map(index: number[], source: S[], target: T[]): void;
}

export type Map = MapImplementation<any> | MapFunction<any> | MapName;

export function mapX<T>(map: Map, options?: T): Transformed<T>;

export function mapY<T>(map: Map, options?: T): Transformed<T>;

export function map<T>(outputs?: {[key in ChannelName]?: Map}, options?: T): Transformed<T>;
