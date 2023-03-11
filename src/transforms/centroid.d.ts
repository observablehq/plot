import type {Initialized, Transformed} from "./basic.js";

export function centroid<T>(options?: T): Initialized<T>;

export function geoCentroid<T>(options?: T): Transformed<T>;
