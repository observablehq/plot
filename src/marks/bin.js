import {bin, binX, binY, binR} from "../transforms/bin.js";
import {rect, rectX, rectY} from "./rect.js";
import {dot} from "./dot.js";

export function binRect(data, options) {
  return rect(data, bin({insetTop: 1, insetLeft: 1, ...options, out: "fill"}));
}

export function binDot(data, options) {
  return dot(data, binR(options));
}

export function binRectY(data, options) {
  return rectY(data, binX({insetLeft: 1, ...options}));
}

export function binRectX(data, options) {
  return rectX(data, binY({insetTop: 1, ...options}));
}
