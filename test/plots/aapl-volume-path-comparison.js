import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/aapl.csv", d3.autoType);
  return Plot.plot({
    x: {
      round: true,
      label: "Trade volume (log₁₀) →"
    },
    y: {
      grid: true,
      percent: true
    },
    marks: [
      Plot.rectY(
        data,
        Plot.binX({y: "proportion"}, {x: (d) => Math.log10(d.Volume), fill: "red", opacity: 0.5, rx: 20})
      ),
      Plot.ruleY([0]),
      Plot.rectPathY(
        data,
        Plot.binX(
          {y: "proportion"},
          {
            x: (d) => Math.log10(d.Volume),
            fill: "blue",
            opacity: 0.5,
            borderTopRadius: 20
            // INFO: each of the radii can be controlled individually
            // borderTopLeftRadius: 10,
            // borderTopRightRadius: 20,
            // borderBottomRightRadius: 15,
            // borderBottomLeftRadius: 25
          }
        )
      )
    ]
  });
}
