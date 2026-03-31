import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function logTickFormatFunction() {
  return Plot.plot({x: {type: "log", domain: [1, 4200], tickFormat: Plot.formatNumber()}});
}

export async function logTickFormatFunctionSv() {
  return Plot.plot({x: {type: "log", domain: [1, 4200], tickFormat: Plot.formatNumber("sv-SE")}});
}
