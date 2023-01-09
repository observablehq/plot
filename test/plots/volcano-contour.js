import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function volcanoContour() {
  const volcano = await d3.json("data/volcano.json");
  return Plot.plot({
    marks: [
      Plot.contour(volcano.values, {
        width: volcano.width,
        height: volcano.height,
        fill: volcano.values,
        stroke: "currentColor"
      }),
      Plot.frame()
    ]
  });
}
