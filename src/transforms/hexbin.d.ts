import type {Transformed} from "./basic.js";
import type {Outputs, Reducers} from "./group.js";

// TODO binWidth
export function hexbin<A, B extends Reducers>(outputs?: B, options?: A): Transformed<Omit<A, keyof B> & Outputs<B>>;
