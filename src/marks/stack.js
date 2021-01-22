import {stackX, stackY} from "../transforms/stack.js";
import {areaX, areaY} from "./area.js";
import {barX, barY} from "./bar.js";

export function stackAreaX(data, options) {
  return areaX(...stackX(data, options));
}

export function stackAreaY(data, options) {
  return areaY(...stackY(data, options));
}

export function stackBarX(data, options) {
  return barX(...stackX(data, options));
}

export function stackBarY(data, options) {
  return barY(...stackY(data, options));
}
