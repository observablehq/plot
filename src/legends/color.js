import {scale} from "../scales.js";
import {legendRamp} from "./ramp.js";
import {legendSwatches} from "./swatches.js";

export function legendColor(plotOrScale, {width: maxWidth = 640} = {}) {
  if (!plotOrScale) return;
  const color = "scales" in plotOrScale ? plotOrScale.scales.color : plotOrScale;
  if (!color) return;
  const {width, ...options} = color;
  options.key = "color"; // for diverging
  switch (options.type) {
    case "ordinal":
    case "categorical":
      return legendSwatches(scale(options), options);
  }
  return legendRamp(scale(options), {
    width: width !== undefined ? width : Math.min(240, maxWidth),
    ...options
  });
}
