import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/aapl.csv", d3.autoType);
  return Plot.plot({
    x: {
      round: true,
      label: "Trade volume (log₁₀) →"
    },
    y: {
      grid: true
    },
    marks: [
      Plot.rectY(data, Plot.binX({x: d => Math.log10(d.Volume), normalize: true})),
      Plot.ruleY([0])
    ]
  });
}
