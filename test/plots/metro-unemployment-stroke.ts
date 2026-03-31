import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function metroUnemploymentStroke() {
  const data = await d3.csv<any>("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.line(data, {x: "date", y: "unemployment", stroke: "division"}), Plot.ruleY([0])],
    color: {
      scheme: "blues",
      range: [0.4, 1]
    }
  });
}
