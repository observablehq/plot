import {Transformed} from "./basic.js";
import {TreeTransformOptions} from "./tree.js";

export function treemapNode<T>(options?: T & TreeTransformOptions): Transformed<T>;
