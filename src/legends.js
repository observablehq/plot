import {legendColor} from "./legends/color.js";
import {legendOpacity} from "./legends/opacity.js";
import {legendRadius} from "./legends/radius.js";

export function legend({color, opacity, r, ...options}) {
  if (color) return legendColor({...color, ...options});
  if (r) return legendRadius({...r, ...options});
  if (opacity) return legendOpacity({...opacity, ...options});
}
