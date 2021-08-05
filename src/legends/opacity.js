import {legendColor} from "./color.js";

export function legendOpacity(plotOrScale, dimensions) {
  if (!plotOrScale) return;
  const opacity = "scales" in plotOrScale ? plotOrScale.scales.opacity : plotOrScale;
  if (!opacity) return;
  return legendColor({
    ...opacity,
    range: undefined,
    interpolate: undefined,
    scheme: "greys"
  }, dimensions);
}
