import {select} from "d3";
import {createContext} from "./context.js";
import {legendRamp} from "./legends/ramp.js";
import {isSymbolColorLegend, legendSwatches, legendSymbols} from "./legends/swatches.js";
import {inherit, isScaleOptions} from "./options.js";
import {getFilterId} from "./style.js";
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
      throw new Error(`unknown legend type: ${legend}`);
  }
}

function legendOpacity({type, interpolate, ...scale}, {legend = true, color = "currentColor", ...options}) {
  if (!interpolate) throw new Error(`${type} opacity scales are not supported`);
  if (legend === true) legend = "ramp";
  if (`${legend}`.toLowerCase() !== "ramp") throw new Error(`${legend} opacity legends are not supported`);
  const svg = legendColor({type, ...scale, interpolate: (t) => `rgba(0,0,0,${t})`}, {legend, ...options});
  if (!svg) return;
  const s = select(svg);
  const image = s.select("image");
  const x = +image.attr("x");
  const y = +image.attr("y");
  const w = +image.attr("width");
  const h = +image.attr("height");
  const pid = getFilterId();
  const fid = getFilterId();

  // Checkerboard
  const pattern = s.append("pattern").attr("id", pid).attr("y", y).attr("width", h).attr("height", h).attr("patternUnits", "userSpaceOnUse"); // prettier-ignore
  pattern.append("path").attr("d", `M0,0h${h / 2}v${h / 2}H0ZM${h / 2},${h / 2}h${h / 2}v${h / 2}H${h / 2}Z`).attr("fill", "color-mix(in srgb, var(--plot-background), currentColor 20%)"); // prettier-ignore
  s.insert("rect", "image").attr("x", x).attr("y", y).attr("width", w).attr("height", h).attr("fill", `url(#${pid})`); // prettier-ignore

  // Color
  image.attr("filter", `url(#${fid})`);
  s.append("filter").attr("id", fid).call((f) => { f.append("feFlood").attr("flood-color", color); f.append("feComposite").attr("in2", "SourceGraphic").attr("operator", "in"); }); // prettier-ignore
  return svg;
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
