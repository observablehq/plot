import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function penguinSpeciesIslandRelative() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    y: {
      percent: true
    },
    fx: {
      tickSize: 6
    },
    facet: {
      data: penguins,
      x: "species"
    },
    marks: [Plot.barY(penguins, Plot.groupZ({y: "proportion-facet", sort: "z"}, {fill: "island"})), Plot.ruleY([0])]
  });
}
