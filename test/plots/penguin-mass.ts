import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function penguinMass() {
  const data = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    x: {
      round: true,
      label: "Body mass (g)"
    },
    y: {
      grid: true
    },
    marks: [Plot.rectY(data, Plot.binX({y: "count"}, {x: "body_mass_g"})), Plot.ruleY([0])]
  });
}
