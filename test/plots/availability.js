import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/availability.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.areaY(
        data,
        Plot.binX(
          { y: "sum" },
          {
            x: "date",
            y: "value",
            sort: "date",
            curve: "step",
            empty: true,
            thresholds: d3.utcDay,
            fill: "#f2f2fe"
          }
        )
      ),
      Plot.line(
        data,
        Plot.binX(
          { y: "sum" },
          {
            x: "date",
            y: "value",
            sort: "date",
            curve: "step",
            empty: true,
            thresholds: d3.utcDay
          }
        )
      ),
      Plot.ruleY([0])
    ],
    height: 180
  });
}
