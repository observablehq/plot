import {stackX, stackY} from "../transforms/stack.js";
import {areaX, areaY} from "./area.js";
import {barX, barY} from "./bar.js";

export function stackAreaX(data, options) {
  return areaX(data, stackX(options));
}

export function stackAreaY(data, options) {
  return areaY(data, stackY(options));
}

export function stackBarX(data, options) {
  return barX(data, stackX(options));
}

export function stackBarY(data, options) {
  return barY(data, stackY(options));
}
