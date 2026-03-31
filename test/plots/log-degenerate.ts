import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function logDegenerate() {
  return Plot.plot({
    x: {
      type: "log"
    },
    marks: [Plot.dotX([0, 0.1, 1, 2, 10])]
  });
}
