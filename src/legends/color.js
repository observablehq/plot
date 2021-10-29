import {Scale} from "../scales.js";
import {legendRamp} from "./ramp.js";
import {legendSwatches} from "./swatches.js";

export function legendColor({legend, ...options}) {
  const scale = Scale("color", undefined, options);
  if (legend === undefined) legend = scale.type === "ordinal" || scale.type === "categorical" ? "swatches" : "ramp";
  switch (legend) {
    case "swatches":
      return legendSwatches({...scale, ...options});
    case "ramp":
      return legendRamp({...scale, ...options});
    default:
      throw new Error(`unknown legend type ${legend}`);
  }
}
