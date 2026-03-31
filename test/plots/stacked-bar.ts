import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function stackedBar() {
  return Plot.plot({
    x: {
      tickFormat: "%"
    },
    marks: [
      Plot.barX(
        {length: 20},
        Plot.stackX({
          x: (d, i) => i,
          fill: (d, i) => i,
          insetLeft: 1,
          offset: "normalize"
        })
      )
    ]
  });
}
