import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function industryUnemploymentShare() {
  const data = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      tickFormat: "%"
    },
    marks: [
      Plot.areaY(
        data,
        Plot.stackY({
          x: "date",
          y: "unemployed",
          fill: "industry",
          offset: "normalize",
          title: "industry"
        })
      ),
      Plot.ruleY([0])
    ]
  });
}
