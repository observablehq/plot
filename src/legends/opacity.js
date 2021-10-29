import {legendColor} from "./color.js";

export function legendOpacity({type, interpolate, ...scale}, {legend = "ramp", ...options}) {
  if (!interpolate) throw new Error(`${type} opacity scales are not supported`);
  if (`${legend}`.toLowerCase() !== "ramp") throw new Error(`${legend} opacity legends are not supported`);
  return legendColor({type, ...scale, interpolate: interpolateOpacity}, {legend, ...options});
}

function interpolateOpacity(t) {
  return `rgba(0,0,0,${t})`;
}
