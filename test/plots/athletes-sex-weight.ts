import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function athletesSexWeight() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.rectY(
        athletes,
        Plot.binX({y2: "count"}, {x: "weight", fill: "sex", mixBlendMode: "multiply", thresholds: 30})
      ),
      Plot.ruleY([0])
    ]
  });
}
