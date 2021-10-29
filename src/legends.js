import {legendColor} from "./legends/color.js";
import {legendRadius} from "./legends/radius.js";

export function legend({color, r, ...options}) {
  if (color) return legendColor({...color, ...options});
  if (r) return legendRadius({...r, ...options});
}
