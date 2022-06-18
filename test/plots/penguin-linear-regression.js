import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    marks: [
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "species"}),
      Plot.linearRegressionY(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", stroke: "species"}),
      Plot.linearRegressionY(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"})
    ]
  });
}
