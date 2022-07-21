import type {InsetOption} from "../common.js";
type maybeInsetArgs = {inset?: InsetOption, insetLeft?: InsetOption, insetRight?: InsetOption, insetTop?: InsetOption, insetBottom?: InsetOption}

import {offset} from "../style.js";

export function maybeInsetX({inset, insetLeft, insetRight, ...options}: maybeInsetArgs = {}) {
  ([insetLeft, insetRight] = maybeInset(inset, insetLeft, insetRight));
  return {inset, insetLeft, insetRight, ...options};
}

export function maybeInsetY({inset, insetTop, insetBottom, ...options}: maybeInsetArgs = {}) {
  ([insetTop, insetBottom] = maybeInset(inset, insetTop, insetBottom));
  return {inset, insetTop, insetBottom, ...options};
}

function maybeInset(inset: InsetOption, inset1: InsetOption, inset2: InsetOption) {
  return inset === undefined && inset1 === undefined && inset2 === undefined
    ? (offset ? [1, 0] : [0.5, 0.5])
    : [inset1, inset2];
}
