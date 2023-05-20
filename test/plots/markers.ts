import * as Plot from "@observablehq/plot";

export async function markerRuleX() {
  return Plot.ruleX([1, 2, 3], {marker: "arrow-reverse", inset: 3}).plot();
}

export async function markerRuleY() {
  return Plot.ruleY([1, 2, 3], {marker: "arrow-reverse", inset: 3}).plot();
}

export async function markerTickX() {
  return Plot.tickX([1, 2, 3], {marker: "arrow-reverse", inset: 3}).plot();
}

export async function markerTickY() {
  return Plot.tickY([1, 2, 3], {marker: "arrow-reverse", inset: 3}).plot();
}
