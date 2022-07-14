import {isOptions} from "../options.js";
import {Grid} from "../plot.js";

function mergeOptions(ticks, options) {
  return isOptions(ticks) ? ticks : {...options, ticks};
}

export function grid(ticks, options) {
  options = mergeOptions(ticks, options);
  return new Grid(options, "auto", "auto");
}

export function gridX(ticks, options) {
  options = mergeOptions(ticks, options);
  return new Grid(options, true, false);
}

export function gridY(ticks, options) {
  options = mergeOptions(ticks, options);
  return new Grid(options, false, true);
}
