import {scale} from "../scales.js";
import {legendColor} from "./color.js";

export function legendOpacity(plotOrScale, {width: maxWidth = 640} = {}) {
  if (!plotOrScale) return;
  const opacity = "scales" in plotOrScale ? plotOrScale.scales.opacity : plotOrScale;
  if (!opacity) return;
  const {width, ...options} = opacity;
  return legendColor({
    ...opacity,
    range: undefined,
    interpolate: undefined,
    scheme: "greys"
  });
}
