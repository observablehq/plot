import type {MarkOptions} from "../mark.js";
import type {Initialized, Transformed} from "./basic.js";

export function centroid<T extends MarkOptions>(options?: T): Initialized<T>;

export function geoCentroid<T extends MarkOptions>(options?: T): Transformed<T>;
