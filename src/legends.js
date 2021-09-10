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
