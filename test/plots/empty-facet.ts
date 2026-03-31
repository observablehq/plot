import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function emptyFacet() {
  const data = [
    {PERIOD: 1, VALUE: 3, TYPE: "c"},
    {PERIOD: 2, VALUE: 4, TYPE: "c"}
  ];
  return Plot.plot({
    facet: {data, x: "TYPE"},
    fx: {domain: ["a", "b"]},
    marks: [Plot.barY(data, {x: "PERIOD", y: "VALUE"})]
  });
}
