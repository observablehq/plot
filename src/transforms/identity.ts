import type {Datum, Value} from "../data.js";
import type {MarkOptions} from "../api.js";

import {identity} from "../options.js";

export function maybeIdentityX<T extends Datum, U extends Value>(options: MarkOptions<T, U> = {}) {
  const {x, x1, x2} = options;
  return x1 === undefined && x2 === undefined && x === undefined ? {...options, x: identity} : options;
}

export function maybeIdentityY<T extends Datum, U extends Value>(options: MarkOptions<T, U> = {}) {
  const {y, y1, y2} = options;
  return y1 === undefined && y2 === undefined && y === undefined ? {...options, y: identity} : options;
}
