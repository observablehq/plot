import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function emptyX() {
  return Plot.plot({
    grid: true,
    x: {
      domain: [0, 1],
      axis: null
    },
    marks: [Plot.frame()]
  });
}
