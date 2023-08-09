import {treemapNode} from "../transforms/treemap.js";
import {rect} from "./rect.js";

/** @jsdoc treemap */
export function treemap(
  data,
  {inset = 0.5, insetTop = inset, insetRight = inset, insetBottom = inset, insetLeft = inset, ...options} = {}
) {
  return rect(data, treemapNode({insetTop, insetRight, insetBottom, insetLeft, ...options}));
}
