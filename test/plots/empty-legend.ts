import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function emptyLegend() {
  return Plot.plot({
    color: {
      legend: true // ignored because no color scale
    },
    marks: [Plot.frame()]
  });
}
