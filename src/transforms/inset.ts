import type {Datum} from "../data.js";
import type {MarkOptions} from "../api.js";

import {offset} from "../style.js";

export function maybeInsetX<T extends Datum>({
  inset,
  insetLeft,
  insetRight,
  ...options
}: MarkOptions<T> = {}): MarkOptions<T> {
  [insetLeft, insetRight] = maybeInset(inset, insetLeft, insetRight);
  return {inset, insetLeft, insetRight, ...options};
}

export function maybeInsetY<T extends Datum>({
  inset,
  insetTop,
  insetBottom,
  ...options
}: MarkOptions<T> = {}): MarkOptions<T> {
  [insetTop, insetBottom] = maybeInset(inset, insetTop, insetBottom);
  return {inset, insetTop, insetBottom, ...options};
}

function maybeInset(inset: number | undefined, inset1: number | undefined, inset2: number | undefined) {
  return inset === undefined && inset1 === undefined && inset2 === undefined
    ? offset
      ? [1, 0]
      : [0.5, 0.5]
    : [inset1, inset2];
}
