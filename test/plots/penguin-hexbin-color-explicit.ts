import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinHexbinColorExplicit() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    marks: [
      Plot.dot(
        penguins,
        Plot.hexbin(
          {r: "count", fill: (d) => (d.length > 3 ? "black" : "red")},
          {x: "culmen_depth_mm", y: "culmen_length_mm"}
        )
      )
    ]
  });
}
