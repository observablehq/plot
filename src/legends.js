import {rgb} from "d3";
import {createContext} from "./context.js";
import {legendRamp} from "./legends/ramp.js";
import {isSymbolColorLegend, legendSwatches, legendSymbols} from "./legends/swatches.js";
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

function legendOptions({className, ...context}, {label, ticks, tickFormat} = {}, options) {
  return inherit(options, {className, ...context}, {label, ticks, tickFormat});
}

function legendColor(color, {legend = true, ...options}) {
  if (legend === true) legend = color.type === "ordinal" ? "swatches" : "ramp";
  if (color.domain === undefined) return; // no identity legend
  switch (`${legend}`.toLowerCase()) {
    case "swatches":
      return legendSwatches(color, options);
    case "ramp":
      return legendRamp(color, options);
    default:
      throw new Error(`unknown color legend type: ${legend}`);
  }
}

function legendOpacity(opacity, {legend = true, color = "black", ...options}) {
  if (legend === true) legend = opacity.type === "ordinal" ? "swatches" : "ramp";
  const {r, g, b} = rgb(color) || rgb(0, 0, 0); // treat invalid color as black
  switch (`${legend}`.toLowerCase()) {
    case "swatches":
      return legendSwatches({...opacity, scale: (x) => String(rgb(r, g, b, opacity.scale(x)))}, options);
    case "ramp":
      return legendRamp({...opacity, interpolate: (a) => String(rgb(r, g, b, a))}, options);
    default:
      throw new Error(`unknown opacity legend type: ${legend}`);
  }
}

export function createLegends(scales, context, options) {
  const legends = [];
  let hasColor = false;
  for (const [key, value] of legendRegistry) {
    if (!(key in scales)) continue;
    if (key === "color" && hasColor) continue;
    const o = inherit(options[key], {legend: options.legend});
    if (!o.legend) continue;
    const legend = value(scales[key], legendOptions(context, scales[key], o), (key) => scales[key]);
    if (legend == null) continue;
    if (key === "symbol" && isSymbolColorLegend(legend)) hasColor = true;
    legends.push(legend);
  }
  return legends;
}
