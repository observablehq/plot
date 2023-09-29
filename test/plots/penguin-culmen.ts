import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinCulmen() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 600,
    grid: true,
    facet: {
      data: penguins,
      x: "sex",
      y: "species",
      marginRight: 80
    },
    marks: [
      Plot.frame(),
      Plot.dot(penguins, {facet: "exclude", x: "culmen_depth_mm", y: "culmen_length_mm", r: 2, fill: "#ddd"}),
      Plot.dot(penguins, {x: "culmen_depth_mm", y: "culmen_length_mm"})
    ]
  });
}
