import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.line(data, {x: "date", y: "unemployment", stroke: "division"}), Plot.ruleY([0])],
    color: {
      scheme: "blues",
      range: [0.4, 1]
    }
  });
}
