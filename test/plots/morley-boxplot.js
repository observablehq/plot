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
      Plot.ruleY(morley, Plot.reduceY({x1: "min", x2: "max"}, {x: "Speed", y: "Expt"})),
      Plot.barX(morley, Plot.reduceY({x1: x => d3.quantile(x, 0.25), x2: x => d3.quantile(x, 0.75)}, {x: "Speed", y: "Expt", fill: "#ccc"})),
      Plot.tickX(morley, Plot.reduceY({x: "median"}, {x: "Speed", y: "Expt", strokeWidth: 2})),
      Plot.dot(morley, {x: "Speed", y: "Expt"})
    ]
  });
}
