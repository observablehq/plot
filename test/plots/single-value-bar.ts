import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function singleValueBar() {
  return Plot.plot({
    marks: [
      Plot.barY({length: 1}, {x: ["foo"], y1: [0], y2: [0]}),
      Plot.ruleX(["foo"], {stroke: "red", y1: [0], y2: [0]})
    ]
  });
}
