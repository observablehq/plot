import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function ordinalBar() {
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [Plot.barY("ABCDEF"), Plot.ruleY([0])]
  });
}
