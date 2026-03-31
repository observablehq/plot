import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function availability() {
  const data = await d3.csv<any>("data/availability.csv", d3.autoType);
  return Plot.plot({
    height: 180,
    marks: [
      Plot.areaY(data, {
        x: "date",
        y: "value",
        interval: "day",
        curve: "step",
        fill: "#f2f2fe"
      }),
      Plot.lineY(data, {
        x: "date",
        y: "value",
        interval: "day",
        curve: "step"
      }),
      Plot.ruleY([0])
    ]
  });
}
