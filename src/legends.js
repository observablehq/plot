import {Scale} from "./scales.js";
import {legendRamp} from "./legends/ramp.js";
import {legendSwatches} from "./legends/swatches.js";

export function legend({color, ...options}) {
  const type = color ? "color" : "unknown";
  const scale = Scale(type, undefined, color);
  options = {...color, ...options};
  let legend = options.legend;
  if (type === "color") {
    if (legend === undefined || legend === true) {
      legend = ["ordinal", "categorical"].includes(scale.type) ? "swatches" : "ramp";
    }
    if (legend === "swatches") {
      legend = legendSwatches;
    } else if (legend === "ramp") {
      legend = legendRamp;
    }
  }

  if (typeof legend !== "function") {
    throw new Error(`unknown legend type ${legend}`);
  }

  // todo: remove scale.scale, add scale.apply and scale.invert?
  return legend({...scale, ...options});
}

export function exposeLegends(scale) {
  return (type, options = {}) => legend({[type]: scale(type), ...options});
}
