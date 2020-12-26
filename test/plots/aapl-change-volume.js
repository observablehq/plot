import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/aapl.csv", autoType);
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
