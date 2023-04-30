import {rgb} from "d3";
import {createContext} from "./context.js";
import {legendRamp} from "./legends/ramp.js";
import {legendSwatches, legendSymbols} from "./legends/swatches.js";
import {inherit, isScaleOptions} from "./options.js";
import {normalizeScale} from "./scales.js";

const legendRegistry = new Map([
  ["symbol", legendSymbols],
  ["color", legendColor],
  ["opacity", legendOpacity]
]);

export function legend(options = {}) {
  for (const [key, value] of legendRegistry) {
    const scale = options[key];
    if (isScaleOptions(scale)) {
      // e.g., ignore {color: "red"}
      const context = createContext(options);
      let hint;
      // For symbol legends, pass a hint to the symbol scale.
      if (key === "symbol") {
        const {fill, stroke = fill === undefined && isScaleOptions(options.color) ? "color" : undefined} = options;
        hint = {fill, stroke};
      }
      return value(normalizeScale(key, scale, hint), legendOptions(context, scale, options), (key) =>
        isScaleOptions(options[key]) ? normalizeScale(key, options[key]) : null
      );
    }
  }
  throw new Error("unknown legend type; no scale found");
}

export function exposeLegends(scales, context, defaults = {}) {
  return (key, options) => {
    if (!legendRegistry.has(key)) throw new Error(`unknown legend type: ${key}`);
    if (!(key in scales)) return;
    return legendRegistry.get(key)(scales[key], legendOptions(context, defaults[key], options), (key) => scales[key]);
  };
}

function legendOptions(context, {label, ticks, tickFormat} = {}, options) {
  return inherit(options, context, {label, ticks, tickFormat});
}

function legendColor(color, {legend = true, ...options}) {
  if (legend === true) legend = color.type === "ordinal" ? "swatches" : "ramp";
  if (color.domain === undefined) return;
  switch (`${legend}`.toLowerCase()) {
    case "swatches":
      return legendSwatches(color, options);
    case "ramp":
      return legendRamp(color, options);
    default:
      throw new Error(`unknown legend type: ${legend}`);
  }
}

function legendOpacity({type, interpolate, ...scale}, {legend = true, color = rgb(0, 0, 0), ...options}) {
  if (!interpolate) throw new Error(`${type} opacity scales are not supported`);
  if (legend === true) legend = "ramp";
  if (`${legend}`.toLowerCase() !== "ramp") throw new Error(`${legend} opacity legends are not supported`);
  return legendColor({type, ...scale, interpolate: interpolateOpacity(color)}, {legend, ...options});
}

function interpolateOpacity(color) {
  const {r, g, b} = rgb(color) || rgb(0, 0, 0); // treat invalid color as black
  return (t) => `rgba(${r},${g},${b},${t})`;
}

export function createLegends(scales, context, options) {
  const legends = [];
  for (const [key, value] of legendRegistry) {
    const o = options[key];
    if (o?.legend && key in scales) {
      const legend = value(scales[key], legendOptions(context, scales[key], o), (key) => scales[key]);
      if (legend != null) legends.push(legend);
    }
  }
  return legends;
}
