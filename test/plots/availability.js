import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/availability.csv", d3.autoType);
  const sum = (d) => (d.length ? d3.sum(d) : NaN); // force gaps
  return Plot.plot({
    height: 180,
    marks: [
      Plot.areaY(data, {
        x: "date",
        y: "value",
        interval: "day",
        reduce: sum,
        curve: "step",
        fill: "#f2f2fe"
      }),
      Plot.lineY(data, {
        x: "date",
        y: "value",
        interval: "day",
        reduce: sum,
        curve: "step"
      }),
      Plot.ruleY([0])
    ]
  });
}
