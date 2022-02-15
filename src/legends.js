import {rgb} from "d3";
import {isScaleOptions} from "./options.js";
import {normalizeScale} from "./scales.js";
import {legendRamp} from "./legends/ramp.js";
import {legendSwatches, legendSymbols} from "./legends/swatches.js";

const legendRegistry = new Map([
  ["symbol", legendSymbols],
  ["color", legendColor],
  ["opacity", legendOpacity]
]);

export function legend(options = {}) {
  for (const [key, value] of legendRegistry) {
    const scale = options[key];
    if (isScaleOptions(scale)) { // e.g., ignore {color: "red"}
      let hint;
      // For symbol legends, pass a hint to the symbol scale.
      if (key === "symbol") {
        const {fill, stroke = fill === undefined && isScaleOptions(options.color) ? "color" : undefined} = options;
        hint = {fill, stroke};
      }
      return value(
        normalizeScale(key, scale, hint),
        legendOptions(scale, options),
        key => isScaleOptions(options[key]) ? normalizeScale(key, options[key]) : null
      );
    }
  }
  throw new Error("unknown legend type");
}

export function exposeLegends(scales, defaults = {}) {
  return (key, options) => {
    if (!legendRegistry.has(key)) throw new Error(`unknown legend type: ${key}`);
    if (!(key in scales)) return;
    return legendRegistry.get(key)(scales[key], legendOptions(defaults[key], options), key => scales[key]);
  };
}

function legendOptions({label, ticks, tickFormat} = {}, options = {}) {
  return {label, ticks, tickFormat, ...options};
}

function legendColor(color, {
  legend = true,
  ...options
}) {
  if (legend === true) legend = color.type === "ordinal" ? "swatches" : "ramp";
  if (color.domain === undefined) return;
  switch (`${legend}`.toLowerCase()) {
    case "swatches": return legendSwatches(color, options);
    case "ramp": return legendRamp(color, options);
    default: throw new Error(`unknown legend type: ${legend}`);
  }
}

function legendOpacity({type, interpolate, ...scale}, {
  legend = true,
  color = rgb(0, 0, 0),
  ...options
}) {
  if (!interpolate) throw new Error(`${type} opacity scales are not supported`);
  if (legend === true) legend = "ramp";
  if (`${legend}`.toLowerCase() !== "ramp") throw new Error(`${legend} opacity legends are not supported`);
  return legendColor({type, ...scale, interpolate: interpolateOpacity(color)}, {legend, ...options});
}

function interpolateOpacity(color) {
  const {r, g, b} = rgb(color) || rgb(0, 0, 0); // treat invalid color as black
  return t => `rgba(${r},${g},${b},${t})`;
}

export function Legends(scales, options) {
  const legends = [];
  for (const [key, value] of legendRegistry) {
    const o = options[key];
    if (o?.legend && (key in scales)) {
      const legend = value(scales[key], legendOptions(scales[key], o), key => scales[key]);
      if (legend != null) legends.push(legend);
    }
  }
  return legends;
}
