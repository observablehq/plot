import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function caltrainDirection() {
  const caltrain = await d3.csv<any>("data/caltrain.csv");
  return Plot.plot({
    x: {
      tickFormat: "%I %p"
    },
    color: {
      domain: "NLB",
      range: ["currentColor", "peru", "brown"]
    },
    facet: {
      data: caltrain,
      label: null,
      y: "type"
    },
    marks: [
      Plot.vectorX(caltrain, {
        x: (d) => new Date(Date.UTC(2000, 0, 1, d.hours, d.minutes)),
        stroke: "type",
        rotate: (d) => (d.orientation === "N" ? 0 : 180)
      })
    ]
  });
}
