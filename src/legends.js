import {normalizeScale} from "./scales.js";
import {legendColor} from "./legends/color.js";

const legendRegistry = new Map([
  ["color", legendColor]
]);

export function legend(options = {}) {
  for (const [key, value] of legendRegistry) {
    const scale = options[key];
    if (scale != null) {
      return value(normalizeScale(key, scale), legendOptions(scale, options));
    }
  }
  throw new Error("unknown legend type");
}

export function exposeLegends(scales, defaults = {}) {
  return (key, options) => {
    if (!legendRegistry.has(key)) throw new Error(`unknown legend type: ${key}`);
    if (!(key in scales)) return;
    return legendRegistry.get(key)(scales[key], legendOptions(defaults[key], options));
  };
}

function legendOptions({label, ticks, tickFormat} = {}, options = {}) {
  return {label, ticks, tickFormat, ...options};
}
