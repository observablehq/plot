import type {MarkOptions} from "../common.js";
import {identity} from "../options.js";

export function maybeIdentityX(options: MarkOptions = {}) {
  const {x, x1, x2} = options;
  return x1 === undefined && x2 === undefined && x === undefined
    ? {...options, x: identity}
    : options;
}

export function maybeIdentityY(options: MarkOptions = {}) {
  const {y, y1, y2} = options;
  return y1 === undefined && y2 === undefined && y === undefined
    ? {...options, y: identity}
    : options;
}
