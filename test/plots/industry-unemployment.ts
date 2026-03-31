import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function industryUnemployment() {
  const data = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 44,
    y: {
      grid: true
    },
    marks: [
      Plot.areaY(
        data,
        Plot.stackY({
          x: "date",
          y: "unemployed",
          fill: "industry",
          title: "industry"
        })
      ),
      Plot.ruleY([0])
    ]
  });
}
