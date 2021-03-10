import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const morley = await d3.csv("data/morley.csv", d3.autoType);
  return Plot.plot({
    x: {
      grid: true,
      inset: 6
    },
    marks: [
      Plot.ruleY(morley, Plot.extentX({x: "Speed", y: "Expt"})),
      Plot.barX(morley, Plot.iqrX({x: "Speed", y: "Expt", fill: "#ccc"})),
      Plot.tickX(morley, Plot.medianX({x: "Speed", y: "Expt", strokeWidth: 2}))
    ]
  });
}
