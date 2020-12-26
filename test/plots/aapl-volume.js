import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/aapl.csv", autoType);
  return Plot.plot({
    x: {
      round: true,
      label: "Trade volume (log₁₀) →"
    },
    y: {
      grid: true
    },
    marks: [
      Plot.binX(data, {x: d => Math.log10(d.Volume), normalize: true}),
      Plot.ruleY([0])
    ]
  });
}
