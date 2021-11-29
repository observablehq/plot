import {rgb} from "d3";
import {legendColor} from "./color.js";

const black = rgb(0, 0, 0);

export function legendOpacity({type, interpolate, ...scale}, {
  legend = true,
  color = black,
  ...options
}) {
  if (!interpolate) throw new Error(`${type} opacity scales are not supported`);
  if (legend === true) legend = "ramp";
  if (`${legend}`.toLowerCase() !== "ramp") throw new Error(`${legend} opacity legends are not supported`);
  return legendColor({type, ...scale, interpolate: interpolateOpacity(color)}, {legend, ...options});
}

function interpolateOpacity(color) {
  const {r, g, b} = rgb(color) || black; // treat invalid color as black
  return t => `rgba(${r},${g},${b},${t})`;
}
