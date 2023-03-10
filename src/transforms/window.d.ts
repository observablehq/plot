import type {MarkOptions} from "../mark.js";
import type {Transformed} from "./basic.js";
import type {Map} from "./map.js";

export type WindowReducerName =
  | "deviation"
  | "max"
  | "mean"
  | "median"
  | "min"
  | "mode"
  | "sum"
  | "variance"
  | "difference"
  | "ratio"
  | "first"
  | "last"
  | `p${number}${number}`;

export type WindowReducerFunction = (values: any[]) => any;

export type WindowReducer = WindowReducerName | WindowReducerFunction;

export interface WindowOptions {
  k?: number;
  reduce?: WindowReducer;
  anchor?: "start" | "middle" | "end";
  shift?: "leading" | "centered" | "trailing"; // deprecated!
  strict?: boolean;
}

export function windowX<T extends MarkOptions>(windowOptions?: WindowOptions | number, options?: T): Transformed<T>;

export function windowY<T extends MarkOptions>(windowOptions?: WindowOptions | number, options?: T): Transformed<T>;

export function window(options?: WindowOptions | number): Map;
