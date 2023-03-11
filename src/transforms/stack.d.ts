import type {Transformed} from "./basic.js";

export type StackOffsetName =
  | "center"
  | "expand" // deprecated; use normalize
  | "normalize"
  | "silhouette" // deprecated; use center
  | "wiggle";

export type StackOffsetFunction = (stacks: number[][][], y1: number[], y2: number[], z: any[]) => void;

export type StackOffset = StackOffsetName | StackOffsetFunction;

export type StackOrderName = "value" | "x" | "y" | "z" | "sum" | "appearance" | "inside-out";

export type StackOrder =
  | StackOrderName
  | string // field name
  | ((d: any, i: number) => any) // function of data
  | any[]; // explicit ordinal values

export interface StackOptions {
  offset?: StackOffset | null;
  order?: StackOrder | null;
  reverse?: boolean;
}

export function stackX<T>(options?: T & StackOptions): Transformed<T>;

export function stackX<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackX1<T>(options?: T & StackOptions): Transformed<T>;

export function stackX1<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackX2<T>(options?: T & StackOptions): Transformed<T>;

export function stackX2<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackY<T>(options?: T & StackOptions): Transformed<T>;

export function stackY<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackY1<T>(options?: T & StackOptions): Transformed<T>;

export function stackY1<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackY2<T>(options?: T & StackOptions): Transformed<T>;

export function stackY2<T>(stackOptions?: StackOptions, options?: T): Transformed<T>;
