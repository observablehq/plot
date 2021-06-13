import {legendColor} from "./legends/color.js";
import {legendOpacity} from "./legends/opacity.js";

export function createLegends(descriptors, dimensions) {
  const legends = [];
  for (let key in descriptors) {
    let {legend, ...options} = descriptors[key];
    if (key === "color" && legend === true) legend = legendColor;
    if (key === "opacity" && legend === true) legend = legendOpacity;
    if (typeof legend === "function") {
      const l = legend(options, dimensions);
      if (l instanceof Node) legends.push(l);
    }
  }
  return legends;
}
