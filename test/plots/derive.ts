import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function deriveDot() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: ((dot) => [dot, dot.derive({fill: "white", stroke: "species", paintOrder: "stroke"})])(
      Plot.dot(penguins, {
        x: "culmen_length_mm",
        y: "culmen_depth_mm",
        r: d3.randomLcg(42),
        fill: "species",
        render(index, scales, values, dimensions, context, next) {
          return next(
            index,
            scales,
            {
              ...values,
              r: values.r.map((d) => d + 6),
              fill: values.fill.map((d) => d3.interpolateRgb("white", d)(0.5))
            },
            dimensions,
            context
          );
        }
      })
    )
  });
}
