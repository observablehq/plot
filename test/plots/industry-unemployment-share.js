import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/bls-industry-unemployment.csv", d3.autoType);
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
          offset: "expand",
          title: "industry"
        })
      ),
      Plot.ruleY([0])
    ]
  });
}
