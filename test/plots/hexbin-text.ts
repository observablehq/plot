import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function hexbinText() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const xy = {fx: "sex", x: "culmen_depth_mm", y: "culmen_length_mm"};
  return Plot.plot({
    width: 960,
    height: 320,
    inset: 14,
    color: {scheme: "orrd"},
    marks: [
      Plot.frame(),
      Plot.hexgrid(),
      Plot.dot(penguins, Plot.hexbin({fill: "count"}, {...xy, stroke: "currentColor", strokeWidth: 0.5})),
      Plot.text(penguins, Plot.hexbin({text: "count"}, xy))
    ]
  });
}
