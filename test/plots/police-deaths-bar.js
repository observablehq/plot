import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/police-deaths.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.barX(data, Plot.stackX({x: "police", fill: "race"})),
      Plot.textX(data, Plot.stackXMid({x: "police", text: "race"})),
      Plot.ruleX([0, 100])
    ]
  });
}
