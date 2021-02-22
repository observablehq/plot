import {stackX, stackY} from "../transforms/stack.js";
import {areaX, areaY} from "./area.js";
import {barX, barY} from "./bar.js";
import {line} from "./line.js";

export function stackAreaX(data, options) {
  return areaX(...stackX(data, {
    z: options.fill || options.title || options.stroke,
    ...options
  }));
}

export function stackAreaY(data, options) {
  return areaY(...stackY(data, {
    z: options.fill || options.title || options.stroke,
    ...options
  }));
}

export function stackBarX(data, options) {
  return barX(...stackX(data, {
    z: options.fill || options.title || options.stroke,
    ...options
  }));
}

export function stackBarY(data, options) {
  return barY(...stackY(data, {
    z: options.fill || options.title || options.stroke,
    ...options
  }));
}

export function stackLineX(data, {position, ...options}) {
  [data, options] = stackY(data, {
    z: options.title || options.stroke,
    ...options
  });
  options.x = position === "center" ? options.x
    : position === "bottom" ? options.x1
    : options.x2;
  return line(data, options);
}

export function stackLineY(data, {position, ...options}) {
  [data, options] = stackY(data, {
    z: options.title || options.stroke,
    ...options
  });
  options.y = position === "center" ? options.y
    : position === "bottom" ? options.y1
    : options.y2;
  return line(data, options);
}
