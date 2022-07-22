import {offset} from "../style.js";

export function maybeInsetX({inset, insetLeft, insetRight, ...options} = {}) {
  [insetLeft, insetRight] = maybeInset(inset, insetLeft, insetRight);
  return {inset, insetLeft, insetRight, ...options};
}

export function maybeInsetY({inset, insetTop, insetBottom, ...options} = {}) {
  [insetTop, insetBottom] = maybeInset(inset, insetTop, insetBottom);
  return {inset, insetTop, insetBottom, ...options};
}

function maybeInset(inset, inset1, inset2) {
  return inset === undefined && inset1 === undefined && inset2 === undefined
    ? offset
      ? [1, 0]
      : [0.5, 0.5]
    : [inset1, inset2];
}
