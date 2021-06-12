import {colorLegend} from "./legends/color.js";

export function createLegends(descriptors, dimensions) {
  const legends = [];
  
  for (let key in descriptors) {
    let {legend, ...options} = descriptors[key];
    if (key === "color" && legend === true) legend = colorLegend;
    if (typeof legend === "function") {
      const l = legend(options, dimensions);
      if (l instanceof Node) legends.push(l);
    }
  }
  
  return legends;
}
