import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.line(data, Plot.movingAverageY({x: "date", y: "unemployment", z: "division", k: 12})),
      Plot.ruleY([0])
    ]
  });
}
