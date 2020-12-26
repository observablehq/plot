import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/aapl.csv", d3.autoType);
  return Plot.plot({
    x: {
      label: "Daily change (%) →",
      tickFormat: "+f"
    },
    y: {
      label: "↑ Volume (log₁₀)"
    },
    grid: true,
    marks: [
      Plot.ruleX([0]),
      Plot.dot(
        data,
        {
          x: d => (d.Close - d.Open) / d.Open * 100,
          y: d => Math.log10(d.Volume),
          r: d => d.Volume
        }
      )
    ]
  });
}
