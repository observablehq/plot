import {exposeScale, Scale} from "./scales.js";
import {legendColor} from "./legends/color.js";

export function legend({color, ...options}) {
  if (color != null) {
    return legendColor(exposeScale(Scale("color", undefined, color)), {
      // ...color,
      label: color.label,
      // ticks: color.ticks, // maybe?
      // tickFormat: color.tickFormat, // maybe?
      // tickValues: color.tickValues, // maybe?
      // format: color.format, // maybe?
      ...options
    });
  }
  throw new Error(`unsupported legend type`);
}

export function exposeLegends(type, options) {
  return legend({...options, [type]: this.scale(type)});
}
