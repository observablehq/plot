import {isColor} from "../options.js";

const defaultColor = "var(--plot-background)";
const defaultRadius = 2;

let nextHaloId = 0;

function getHaloId() {
  return `plot-halo-${++nextHaloId}`;
}

export function applyHalo(selection, {halo}) {
  if (!halo) return;
  const {color, radius} = halo;
  const filters = new WeakMap();
  selection.attr("filter", function () {
    const id = getHaloId();
    filters.set(this, id);
    return `url(#${id})`;
  });
  selection
    .append("filter")
    .attr("id", function () {
      return filters.get(this.parentNode);
    })
    .call((filter) =>
      filter
        .append("feMorphology")
        .attr("in", "SourceAlpha")
        .attr("result", "dilated")
        .attr("operator", "dilate")
        .attr("radius", radius)
    )
    .call((filter) => filter.append("feFlood").style("flood-color", color))
    .call((filter) => filter.append("feComposite").attr("in2", "dilated").attr("operator", "in"))
    .append("feMerge")
    .call((merge) => {
      merge.append("feMergeNode");
      merge.append("feMergeNode").attr("in", "SourceGraphic");
    });
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
