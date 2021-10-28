import {legendColor} from "./color.js";

export function legendOpacity(scale) {
  return legendColor({...scale, interpolate: t => `rgba(0,0,0,${t})`});
}
