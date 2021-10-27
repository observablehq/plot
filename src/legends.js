import {registry} from "./scales/index.js";
import {legendColor} from "./legends/color.js";
import {legendOpacity} from "./legends/opacity.js";
import {legendRadius} from "./legends/radius.js";

export function createLegends(descriptors, dimensions) {
  const legends = [];
  for (const [key] of registry) {
    const scale = descriptors(key);
    if (scale === undefined) continue;
    let {legend, ...options} = scale;
    if (key === "color" && legend === true) legend = legendColor;
    if (key === "opacity" && legend === true) legend = legendOpacity;
    if (key === "r" && legend === true) legend = legendRadius;
    if (typeof legend === "function") {
      const l = legend(options, dimensions);
      if (l instanceof Node) legends.push(l);
    }
  }
  return legends;
}

export function legend({color, opacity, r, ...options}) {
  if (color) return legendColor(plotOrScale(color, "color"), options);
  if (r) return legendRadius(plotOrScale(r, "r"), options);
  if (opacity) return legendOpacity(plotOrScale(opacity, "opacity"), options);
}

function plotOrScale(p, scale) {
  return (typeof p === "object" && "scale" in p && typeof p.scale === "function")
    ? p.scale(scale)
    : p;
}
