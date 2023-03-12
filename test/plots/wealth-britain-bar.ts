import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function wealthBritainBar() {
  const data = await d3.csv<any>("data/wealth-britain.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.barX(data, Plot.stackX({x: "wealth", fill: "age"})),
      Plot.textX(data, Plot.stackX({x: "wealth", text: "age"})),
      Plot.ruleX([0, 100])
    ]
  });
}
