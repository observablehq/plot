import {stackX, stackY} from "../transforms/stack.js";
import {areaX, areaY} from "./area.js";
import {barX, barY} from "./bar.js";
import {line} from "./line.js";

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

export function stackLineX(data, {position, ...options}) {
  const s = stackX(data, options);
  s[1].x = position === "center" ? s[1].xm
    : position === "left" ? s[1].x1
    : s[1].x2;
  return line(...s);
}

export function stackLineY(data, {position, ...options}) {
  const s = stackY(data, options);
  s[1].y = position === "center" ? s[1].ym
    : position === "bottom" ? s[1].y1
    : s[1].y2;
  return line(...s);
}
