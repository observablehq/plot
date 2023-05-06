import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function tipDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    style: "overflow: visible;",
    marks: [
      Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"}),
      Plot.tip(
        penguins,
        Plot.select(
          (I) => [
            d3.least(I, (i) => penguins[i].culmen_length_mm),
            d3.greatest(I, (i) => penguins[i].culmen_length_mm),
            d3.least(I, (i) => penguins[i].culmen_depth_mm),
            d3.greatest(I, (i) => penguins[i].culmen_depth_mm)
          ],
          {x: "culmen_length_mm", y: "culmen_depth_mm"}
        )
      )
    ]
  });
}
