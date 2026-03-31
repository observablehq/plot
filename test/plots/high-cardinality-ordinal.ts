import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function highCardinalityOrdinal() {
  return Plot.plot({
    color: {
      type: "ordinal"
    },
    marks: [Plot.cellX("ABCDEFGHIJKLMNOPQRSTUVWXYZ")]
  });
}
