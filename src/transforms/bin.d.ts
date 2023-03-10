import type {Transformed} from "./basic.js";
import type {Outputs, Reducers} from "./group.js";

export function binX<A, B extends Reducers>(outputs?: B, options?: A): Transformed<Omit<A, keyof B> & Outputs<B>>;

export function binY<A, B extends Reducers>(outputs?: B, options?: A): Transformed<Omit<A, keyof B> & Outputs<B>>;

export function bin<A, B extends Reducers>(outputs?: B, options?: A): Transformed<Omit<A, keyof B> & Outputs<B>>;
