import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function aaplStackGains() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const day = (d) => d.Date.toLocaleDateString("en-US", {weekday: "short"});
  return Plot.plot({
    color: {legend: true, domain: ["Mon", "Tue", "Wed", "Thu", "Fri"]},
    marks: [
      [Math.min, Math.max].map((op) =>
        Plot.areaY(
          aapl,
          Plot.binX(
            {y: (d) => op(0, d3.sum(d)), interval: "2 months"},
            {x: "Date", y: (d) => d.Close - d.Open, fill: day, curve: "monotone-x"}
          )
        )
      ),
      Plot.ruleY([0])
    ]
  });
}
