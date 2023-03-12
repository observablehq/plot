import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinFacetDodgeSymbol() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    nice: true,
    symbol: {
      legend: true
    },
    marks: [Plot.dot(penguins, Plot.dodgeX("left", {y: "body_mass_g", symbol: "species", stroke: "species"}))]
  });
}
