import {legendRamp} from "./ramp.js";
import {legendSwatches} from "./swatches.js";

export function legendColor(color, {
  legend = color.type === "ordinal" ? "swatches" : "ramp",
  ...options
}) {
  switch (`${legend}`.toLowerCase()) {
    case "swatches": return legendSwatches(color, options);
    case "ramp": return legendRamp(color, options);
    default: throw new Error(`unknown legend type: ${legend}`);
  }
}
