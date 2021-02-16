import {stackX, stackY} from "../transforms/stack.js";
import {areaX, areaY} from "./area.js";
import {barX, barY} from "./bar.js";

export function stackAreaX(data, options) {
  return areaX(...stackX(data, {className: "stackAreaX", ...options}));
}

export function stackAreaY(data, options) {
  return areaY(...stackY(data, {className: "stackAreaY", ...options}));
}

export function stackBarX(data, options) {
  return barX(...stackX(data, {className: "stackBarX", ...options}));
}

export function stackBarY(data, options) {
  return barY(...stackY(data, {className: "stackBarY", ...options}));
}
