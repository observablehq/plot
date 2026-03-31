import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function penguinDensity() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    inset: 30,
    marks: [Plot.density(penguins, {x: "flipper_length_mm", y: "culmen_length_mm"}), Plot.frame()]
  });
}
