import type {ChannelDomainSort, Channels, ChannelValue} from "../channel.js";
import type {Context} from "../context.js";
import type {Dimensions} from "../dimensions.js";
import type {MarkOptions} from "../mark.js";
import type {ScaleFunctions} from "../scales.js";

export type TransformFunction = (data: any[], facets: number[][]) => {data?: any[]; facets?: number[][]};

export type InitializerFunction = (
  data: any[],
  facets: number[][],
  channels: Channels,
  scales: ScaleFunctions,
  dimensions: Dimensions,
  context: Context
) => {
  data?: any[]; // TODO Data?
  facets?: number[][];
  channels?: Channels;
};

export interface TransformOptions {
  filter?: ChannelValue;
  reverse?: boolean;
  sort?: ChannelValue | CompareFunction | ChannelDomainSort;
  transform?: TransformFunction;
  initializer?: InitializerFunction;
}

export type FilterFunction = (d: any, i: number) => boolean;

export type CompareFunction = (a: any, b: any) => number;

export type Transformed<T extends MarkOptions> = T & {transform: TransformFunction};

export type Initialized<T extends MarkOptions> = T & {initializer: InitializerFunction};

export function transform<T extends MarkOptions>(options: T, transform: TransformFunction): Transformed<T>;

export function initializer<T extends MarkOptions>(options: T, initializer: InitializerFunction): Initialized<T>;

export function filter<T extends MarkOptions>(test: FilterFunction, options?: T): Transformed<T>;

export function reverse<T extends MarkOptions>(options?: T): Transformed<T>;

export function shuffle<T extends MarkOptions>(options?: T): Transformed<T>;

export function sort<T extends MarkOptions>(order: TransformOptions["sort"], options?: T): Transformed<T>;
