import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function symbolSetFill() {
  return Plot.dotX(["circle", "cross", "diamond", "square", "star", "triangle", "wye"], {
    fill: "currentColor",
    symbol: Plot.indexOf
  }).plot();
}

export async function symbolSetStroke() {
  return Plot.dotX(["circle", "cross", "diamond", "square", "star", "triangle", "wye"], {
    stroke: "currentColor",
    symbol: Plot.indexOf
  }).plot();
}

export async function symbolSetFillColor() {
  return Plot.dotX(["circle", "cross", "diamond", "square", "star", "triangle", "wye"], {
    fill: Plot.indexOf,
    symbol: Plot.indexOf
  }).plot({symbol: {legend: true}});
}

export async function symbolSetStrokeColor() {
  return Plot.dotX(["circle", "cross", "diamond", "square", "star", "triangle", "wye"], {
    stroke: Plot.indexOf,
    symbol: Plot.indexOf
  }).plot({symbol: {legend: true}});
}
