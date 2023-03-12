import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinSpeciesIslandSex() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    x: {
      tickFormat: (d) => (d === null ? "N/A" : d)
    },
    y: {
      grid: true
    },
    facet: {
      data: penguins,
      x: "species"
    },
    marks: [Plot.barY(penguins, Plot.groupX({y: "count"}, {x: "sex", fill: "island"})), Plot.ruleY([0])]
  });
}
