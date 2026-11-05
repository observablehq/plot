import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function hexbinZ() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    inset: 10,
    color: {
      legend: true
    },
    marks: [
      Plot.hexgrid(),
      Plot.frame(),
      Plot.dot(penguins, Plot.hexbin({r: "count"}, {x: "culmen_length_mm", y: "body_mass_g", stroke: "species"}))
    ]
  });
});

test(async function hexbinIdentityReduce() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    inset: 10,
    height: 600,
    marks: [
      Plot.hexgrid({binWidth: 8, strokeOpacity: 0.05}),
      Plot.frame(),
      Plot.text(
        penguins,
        Plot.hexbin(
          {text: "identity"},
          {x: "culmen_length_mm", y: "body_mass_g", text: (d) => d.species[0], binWidth: 8, fontSize: 7}
        )
      )
    ]
  });
});
