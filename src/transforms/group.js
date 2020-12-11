import {groups} from "d3-array";
import {defined} from "../defined.js";
import {field} from "../mark.js";

export function group1(key) {
  if (typeof key !== "function") key = field(key + "");
  return data => groups(data, key).filter(defined1);
}

export function group2(x, y) {
  if (typeof x !== "function") x = field(x + "");
  if (typeof y !== "function") y = field(y + "");
  return data => groups(data, x, y)
    .flatMap(([x, xgroup]) => xgroup
    .map(([y, ygroup]) => [x, y, ygroup]));
}

// Since marks don’t render when channel values are undefined (or null or NaN),
// we apply the same logic when grouping. If you want to preserve the group for
// undefined data, map it to an “other” value first.
function defined1([key]) {
  return defined(key);
}
