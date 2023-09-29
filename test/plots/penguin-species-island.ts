import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinSpeciesIsland() {
  const data = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [Plot.barY(data, Plot.groupX({y: "count"}, {x: "species", fill: "island"})), Plot.ruleY([0])]
  });
}
