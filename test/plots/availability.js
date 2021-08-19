import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/availability.csv", d3.autoType);
  const sum = d => d.length ? d3.sum(d) : NaN; // force gaps
  return Plot.plot({
    height: 180,
    marks: [
      Plot.areaY(
        data,
        Plot.binX(
          {
            filter: null,
            y: sum
          },
          {
            x: "date",
            y: "value",
            curve: "step",
            thresholds: d3.utcDay,
            fill: "#f2f2fe"
          }
        )
      ),
      Plot.line(
        data,
        Plot.binX(
          {
            filter: null,
            y: sum
          },
          {
            x: "date",
            y: "value",
            curve: "step",
            thresholds: d3.utcDay
          }
        )
      ),
      Plot.ruleY([0])
    ]
  });
}
