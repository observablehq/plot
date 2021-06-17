import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/stargazers.csv", d3.autoType);
  const format = d3.utcFormat("%Y-%m-%d");
  return Plot.plot({
    marks: [
      Plot.ruleY([0]),
      Plot.ruleY([10], { stroke: null }), // force y=10 as a minimum
      Plot.rectY(
        data,
        Plot.binX(
          {
            y: "count",
            title: bin => `${format(bin.x1)}…${format(bin.x2)}`
          },
          {
            x: "date",
            fill: "brown",
            thresholds: 100
          }
        )
      ),
      Plot.ruleY(data, {
        ...Plot.groupZ(
          { y: "median" },
          Plot.binX(
            { y: "count" },
            {
              x: "date",
              strokeDasharray: [5, 10],
              strokeWidth: 0.25,
              thresholds: 100
            }
          )
        ),
        x: undefined,
        x1: undefined,
        x2: undefined
      })
    ],
    x: { inset: 20, grid: true },
    y: { type: "linear" },
    height: 300
  });
}
