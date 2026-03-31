import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function stackedRect() {
  return Plot.plot({
    x: {
      tickFormat: "%"
    },
    marks: [
      Plot.rectX(
        {length: 20},
        {
          x: (d, i) => i,
          fill: (d, i) => i,
          insetLeft: 1,
          offset: "normalize"
        }
      )
    ]
  });
}
