import type {ColorInterpolateName} from "./color.js";

export type InterpolateName = "number" | ColorInterpolateName;

export type InterpolateFunction<T> = (a: T, b: T) => InterpolateFixedFunction<T>;

export type InterpolateFixedFunction<T> = (t: number) => T;

export type Interpolate = InterpolateName | InterpolateFunction<any> | InterpolateFixedFunction<any>;
