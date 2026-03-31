import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function metroUnemploymentMoving() {
  const data = await d3.csv<any>("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.line(data, Plot.windowY(12, {x: "date", y: "unemployment", z: "division"})), Plot.ruleY([0])]
  });
}
