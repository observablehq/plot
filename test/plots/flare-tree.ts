import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function flareTree() {
  const flare = await d3.csv<any>("data/flare.csv", d3.autoType);
  return Plot.plot({
    axis: null,
    inset: 10,
    insetLeft: 30,
    insetRight: 120,
    height: 1800,
    marks: Plot.tree(flare, {markerEnd: "arrow", path: "name", delimiter: "."})
  });
}
