import {legendRamp} from "./ramp.js";
import {legendSwatches} from "./swatches.js";

export function legendColor(scale) {
  return scale.type === "ordinal" || scale.type === "categorical"
    ? legendSwatches(scale)
    : legendRamp(scale);
}
