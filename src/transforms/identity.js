import {hasX, hasY, identity} from "../options.js";

export function maybeIdentityX(options = {}, k = "x") {
  return hasX(options) ? options : {...options, [k]: identity};
}

export function maybeIdentityY(options = {}, k = "y") {
  return hasY(options) ? options : {...options, [k]: identity};
}
