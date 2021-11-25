import {normalizeScale} from "./scales.js";
import {legendColor} from "./legends/color.js";

export function legend({color, ...options}) {
  if (color != null) {
    return legendColor(normalizeScale("color", color), {
      label: color.label,
      // TODO ticks
      // TODO tickFormat
      // TODO tickValues
      // TODO format
      ...options
    });
  }
  throw new Error("unsupported legend type");
}

export function exposeLegends(type, options) {
  return legend({...options, [type]: this.scale(type)});
}
