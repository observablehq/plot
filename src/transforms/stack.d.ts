import type {MarkOptions} from "../mark.js";
import type {Transformed} from "./basic.js";

export type StackOffsetName = "expand" | "normalize" | "center" | "silhouette" | "wiggle";

export type StackOffsetFunction = Function; // TODO

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
  reverse?: any;
}

export function stackX<T extends MarkOptions>(options?: T & StackOptions): Transformed<Omit<T, keyof StackOptions>>;

export function stackX<T extends MarkOptions>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackX1<T extends MarkOptions>(options?: T & StackOptions): Transformed<Omit<T, keyof StackOptions>>;

export function stackX1<T extends MarkOptions>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackX2<T extends MarkOptions>(options?: T & StackOptions): Transformed<Omit<T, keyof StackOptions>>;

export function stackX2<T extends MarkOptions>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackY<T extends MarkOptions>(options?: T & StackOptions): Transformed<Omit<T, keyof StackOptions>>;

export function stackY<T extends MarkOptions>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackY1<T extends MarkOptions>(options?: T & StackOptions): Transformed<Omit<T, keyof StackOptions>>;

export function stackY1<T extends MarkOptions>(stackOptions?: StackOptions, options?: T): Transformed<T>;

export function stackY2<T extends MarkOptions>(options?: T & StackOptions): Transformed<Omit<T, keyof StackOptions>>;

export function stackY2<T extends MarkOptions>(stackOptions?: StackOptions, options?: T): Transformed<T>;
