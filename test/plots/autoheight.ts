import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function autoHeightEmpty() {
  return Plot.rectY([], {x: "date", y: "visitors", fy: "path"}).plot();
}
