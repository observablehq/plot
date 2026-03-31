import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function groupedRects() {
  return Plot.plot({
    marks: [Plot.rectY({length: 10}, Plot.groupX({y: "count"}, {x: (d, i) => "ABCDEFGHIJ"[i]}))]
  });
}
