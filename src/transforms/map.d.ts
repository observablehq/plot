import type {ChannelName} from "../channel.js";
import type {MarkOptions} from "../mark.js";
import type {Transformed} from "./basic.js";

export type MapFunction = (values: any[]) => any[];

export type MapName = "cumsum" | "rank" | "quantile";

export interface MapImplementation {
  map(index: number[], source: any[], target: any[]): void;
}

export type Map = MapImplementation | MapFunction | MapName;

export function mapX<T extends MarkOptions>(map: Map, options?: T): Transformed<T>;

export function mapY<T extends MarkOptions>(map: Map, options?: T): Transformed<T>;

export function map<T extends MarkOptions>(outputs?: {[key in ChannelName]?: Map}, options?: T): Transformed<T>;
