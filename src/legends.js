import {legendColor} from "./legends/color.js";

export function legend({color, ...options}) {
  if (color) return legendColor({...color, ...options});
  throw new Error(`unsupported legend type`);
}
