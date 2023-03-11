import type {Channels} from "../channel.js";
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

export type FilterFunction = (d: any, i: number) => boolean;

export type CompareFunction = (a: any, b: any) => number;

export type Transformed<T> = T & {transform: TransformFunction};

export type Initialized<T> = T & {initializer: InitializerFunction};

export function transform<T>(options: T, transform: TransformFunction): Transformed<T>;

export function initializer<T>(options: T, initializer: InitializerFunction): Initialized<T>;

export function filter<T>(test: FilterFunction, options?: T): Transformed<T>;

export function reverse<T>(options?: T): Transformed<T>;

export function shuffle<T>(options?: T): Transformed<T>;

export function sort<T>(order: MarkOptions["sort"], options?: T): Transformed<T>;
