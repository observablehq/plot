import {Scale} from "../scales.js";
import {legendRamp} from "./ramp.js";
import {legendSwatches} from "./swatches.js";

export function legendColor({legend, ...options}) {
  const scale = Scale("color", undefined, options);
  if (legend === undefined) legend = scale.type === "ordinal" ? "swatches" : "ramp";
  switch (legend) {
    case "swatches":
      return legendSwatches(scale.scale, options);
    case "ramp":
      return legendRamp(scale.scale, options);
    default:
      throw new Error(`unknown color legend type: ${legend}`);
  }
}
