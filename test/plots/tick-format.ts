import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function tickFormatEmptyDomain() {
  return Plot.plot({y: {tickFormat: "%W"}, marks: [Plot.barX([]), Plot.frame()]});
}

export async function tickFormatEmptyFacetDomain() {
  return Plot.plot({fy: {tickFormat: "%W"}, marks: [Plot.barX([]), Plot.frame()]});
}
