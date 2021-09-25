import {identity} from "../mark.js";

export function maybeIdentityX(options = {}) {
  const {x, x1, x2} = options;
  return x1 === undefined && x2 === undefined && x === undefined
    ? {...options, x: identity}
    : options;
}

export function maybeIdentityY(options = {}) {
  const {y, y1, y2} = options;
  return y1 === undefined && y2 === undefined && y === undefined
    ? {...options, y: identity}
    : options;
}
