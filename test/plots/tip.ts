import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function tipDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"}),
      Plot.dot(penguins, Plot.pointer({x: "culmen_length_mm", y: "culmen_depth_mm", r: 4, stroke: "red"})),
      Plot.tip(penguins, Plot.pointer({x: "culmen_length_mm", y: "culmen_depth_mm"}))
    ]
  });
}
