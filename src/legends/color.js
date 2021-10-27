import {legendRamp} from "./ramp.js";
import {legendSwatches} from "./swatches.js";

export function legendColor(color, options) {
  return color.type === "ordinal" || color.type === "categorical"
    ? legendSwatches(color, options)
    : legendRamp(color, options);
}
