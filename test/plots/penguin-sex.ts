import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function penguinSex() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.barY(penguins, Plot.groupX({y: "count"}, {x: "sex"})), Plot.ruleY([0])]
  });
}
