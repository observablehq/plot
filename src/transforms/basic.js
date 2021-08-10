import {composeTransform} from "./compose.js";
import {filterTransform} from "./filter.js";
import {reverseTransform} from "./reverse.js";
import {sortTransform} from "./sort.js";

// If both t1 and t2 are defined, returns a composite transform that first
// applies t1 and then applies t2.
export function basic({
  filter: f1,
  sort: s1,
  reverse: r1,
  transform: t1,
  ...options
} = {}, t2) {
  if (t1 === undefined) { // explicit transform overrides filter, sort, and reverse
    if (f1 != null) t1 = filterTransform(f1);
    if (s1 != null) t1 = composeTransform(t1, sortTransform(s1));
    if (r1) t1 = composeTransform(t1, reverseTransform);
  }
  return {...options, transform: composeTransform(t1, t2)};
}
