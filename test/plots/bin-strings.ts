import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function binStrings() {
  return Plot.rectY(["9.6", "9.6", "14.8", "14.8", "7.2"], Plot.binX()).plot();
}
