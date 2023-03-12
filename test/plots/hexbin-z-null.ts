import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function hexbinZNull() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    inset: 10,
    marks: [
      Plot.hexgrid(),
      Plot.frame(),
      Plot.circle(
        penguins,
        Plot.hexbin(
          {r: "count", stroke: "mode", fill: "mode"},
          {x: "culmen_depth_mm", y: "culmen_length_mm", z: null, fill: "island", stroke: "species"}
        )
      )
    ]
  });
}
