import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinIslandUnknown() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    color: {
      domain: ["Dream"],
      unknown: "#ccc"
    },
    marks: [Plot.barY(penguins, Plot.groupX({y: "count", sort: "z"}, {x: "sex", fill: "island"})), Plot.ruleY([0])]
  });
}
