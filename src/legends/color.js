import {Scale} from "../scales.js";
import {legendRamp} from "./ramp.js";
import {legendSwatches} from "./swatches.js";

export function legendColor(options) {
  const scale = Scale("color", undefined, options);
  return scale.type === "ordinal" || scale.type === "categorical"
    ? legendSwatches({...scale, ...options})
    : legendRamp({...scale, ...options});
}
