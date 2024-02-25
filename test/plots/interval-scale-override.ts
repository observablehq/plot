import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function intervalScaleOverride() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const dimensions = ["culmen_length_mm", "culmen_depth_mm", "body_mass_g"].map((k) => ({
    dimension: k,
    scale: Plot.tickX(penguins, {x: k})
      .plot({x: {range: [70, 520]}})
      .scale("x")
  }));
  return Plot.plot({
    marginLeft: 120,
    marks: [
      dimensions.map(({dimension, scale}) =>
        Plot.dotY(penguins, {
          x: {value: (d) => scale.apply(d[dimension]), scale: null},
          interval: 10,
          y: () => dimension,
          fill: "black",
          fillOpacity: 0.1
        })
      ),
      Plot.cell(penguins, Plot.groupX({fillOpacity: "proportion"}, {x: "species", y: () => "species", fill: "species"}))
    ]
  });
}
