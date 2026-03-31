import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

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
