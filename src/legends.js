import {normalizeScale} from "./scales.js";
import {legendColor} from "./legends/color.js";
import {legendOpacity} from "./legends/opacity.js";
import {isObject} from "./mark.js";

const legendRegistry = new Map([
  ["color", legendColor],
  ["opacity", legendOpacity]
]);

export function legend(options = {}) {
  for (const [key, value] of legendRegistry) {
    const scale = options[key];
    if (isObject(scale)) { // e.g., ignore {color: "red"}
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

export function Legends(scales, options) {
  const legends = [];
  for (const [key, value] of legendRegistry) {
    const o = options[key];
    if (o && o.legend) {
      legends.push(value(scales[key], legendOptions(scales[key], o)));
    }
  }
  return legends;
}
