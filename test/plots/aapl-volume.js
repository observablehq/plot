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
      Plot.binRectY(data, {x: d => Math.log10(d.Volume), fillOpacity: 0.5, z: d => Math.sign(d.Close - d.Open), fill: d => Math.sign(d.Close - d.Open), normalize: true}),
      Plot.ruleY([0])
    ]
  });
}
