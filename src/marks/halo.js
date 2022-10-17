import {isColor} from "../options.js";

let nextHaloId = 0;

export function applyHalo(g, {color, radius}) {
  const id = `plot-linehalo-${nextHaloId++}`;
  g.selectChildren().style("filter", `url(#${id})`);
  g.append("filter").attr("id", id).html(`
    <feMorphology in="SourceAlpha" result="DILATED" operator="dilate" radius="${radius}"></feMorphology>
    <feFlood flood-color="${color}" result="BG"></feFlood>
    <feComposite in="BG" in2="DILATED" operator="in" result="OUTLINE"></feComposite>
    <feMerge>
      <feMergeNode in="OUTLINE" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>`);
}

export function maybeHalo(halo, color, radius) {
  if (halo === undefined) halo = color !== undefined || radius !== undefined;
  if (!halo) return false;
  const defaults = {color: "white", radius: 2};
  if (color === undefined) {
    color = isColor(halo) ? halo : defaults.color;
  } else if (!isColor(color)) {
    throw new Error(`Unsupported halo color: ${color}`);
  }
  if (radius === undefined) {
    radius = !isNaN(+halo) ? +halo : defaults.radius;
  } else if (isNaN(+radius)) {
    throw new Error(`Unsupported halo radius: ${radius}`);
  }
  return {color, radius};
}
