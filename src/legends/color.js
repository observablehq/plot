import {scale} from "../scales.js";
import {legendRamp} from "./ramp.js";
import {legendSwatches} from "./swatches.js";

export function legendColor(color, {width: maxWidth = 640} = {}) {
  if (typeof color === "object" && "scales" in color && typeof color.scales === "function") {
    color = color.scales("color");
  }
  if (!color) return;
  const {...options} = color;
  switch (options.type) {
    case "ordinal": case "categorical":
      return legendSwatches(scale(options), options);
    default:
      options.key = "color"; // for diverging
      if (options.width === undefined) options.width = Math.min(240, maxWidth);
      return legendRamp(scale(options), options);
  }
}
