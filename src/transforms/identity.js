import {hasX, hasY, identity} from "../options.js";

export function maybeIdentityX(options = {}) {
  return hasX(options) ? options : {...options, x: identity};
}

export function maybeIdentityY(options = {}) {
  return hasY(options) ? options : {...options, y: identity};
}
