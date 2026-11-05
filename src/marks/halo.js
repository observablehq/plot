import {isColor} from "../options.js";

const defaultColor = "var(--plot-background)";
const defaultRadius = 2;

let nextHaloId = 0;

function getHaloId() {
  return `plot-filter-${++nextHaloId}`;
}

export function applyHalo(selection, {halo}) {
  if (!halo) return null;
  const {color, radius} = halo;
  const id = getHaloId();
  const filter = selection.append("filter").attr("id", id);
  filter
    .append("feMorphology")
    .attr("in", "SourceAlpha")
    .attr("result", "dilated")
    .attr("operator", "dilate")
    .attr("radius", radius);
  filter.append("feFlood").style("flood-color", color);
  filter.append("feComposite").attr("in2", "dilated").attr("operator", "in");
  const merge = filter.append("feMerge");
  merge.append("feMergeNode");
  merge.append("feMergeNode").attr("in", "SourceGraphic");
  return `url(#${id})`;
}

export function maybeHalo(halo, color, radius) {
  if (halo === undefined) halo = color !== undefined || radius !== undefined;
  if (!halo) return false;
  if (color === undefined) color = isColor(halo) ? halo : defaultColor;
  else if (!isColor(color)) throw new Error(`Unsupported halo color: ${color}`);
  if (radius === undefined) radius = typeof halo === "number" && !isNaN(halo) ? halo : defaultRadius;
  else if (isNaN(+radius)) throw new Error(`Unsupported halo radius: ${radius}`);
  return {color, radius};
}
