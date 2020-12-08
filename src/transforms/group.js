import {group, groups} from "d3-array";
import {field} from "../mark.js";

export function group1(key) {
  if (typeof key !== "function") key = field(key + "");
  return data => group(data, key);
}

export function group2(x, y) {
  if (typeof x !== "function") x = field(x + "");
  if (typeof y !== "function") y = field(y + "");
  return data => groups(data, x, y)
    .flatMap(([x, xgroup]) => xgroup
    .map(([y, ygroup]) => [x, y, ygroup]));
}
