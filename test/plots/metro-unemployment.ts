import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function metroUnemployment() {
  const data = await d3.csv<any>("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.line(data, {x: "date", y: "unemployment", z: "division"}), Plot.ruleY([0])]
  });
}
