import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    inset: 30,
    marks: [
      Plot.density(penguins, {x: "flipper_length_mm", y: "culmen_length_mm"}),
      Plot.frame()
    ]
  });
}
