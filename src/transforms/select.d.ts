import type {Transformed} from "./basic.js";

export type SelectorName = "first" | "last" | "min" | "max"; // TODO restrict based on context

export type SelectorFunction = (index: number[], values: any[] | null) => number[];

export type SelectorChannel<T> = {[key in keyof T]?: SelectorName | SelectorFunction};

export type Selector<T> = SelectorName | SelectorFunction | SelectorChannel<T>;

export function select<T>(selector: Selector<T>, options?: T): Transformed<T>;

export function selectFirst<T>(options?: T): Transformed<T>;

export function selectLast<T>(options?: T): Transformed<T>;

export function selectMinX<T>(options?: T): Transformed<T>;

export function selectMinY<T>(options?: T): Transformed<T>;

export function selectMaxX<T>(options?: T): Transformed<T>;

export function selectMaxY<T>(options?: T): Transformed<T>;
