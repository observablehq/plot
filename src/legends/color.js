import {legendRamp} from "./ramp.js";
import {legendSwatches} from "./swatches.js";

export function legendColor(color, {legend, ...options}) {
  if (legend === undefined) legend = color.type === "ordinal" ? "swatches" : "ramp";
  switch (legend) {
    case "swatches":
      return legendSwatches(color, options);
    case "ramp":
      return legendRamp(color, options);
    default:
      throw new Error(`unknown color legend type: ${legend}`);
  }
}
