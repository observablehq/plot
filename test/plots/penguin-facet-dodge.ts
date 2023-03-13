import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinFacetDodge() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 300,
    grid: true,
    facet: {
      data: penguins,
      y: "species",
      label: null,
      marginLeft: 60
    },
    marks: [Plot.dot(penguins, Plot.dodgeY("middle", {x: "body_mass_g"}))]
  });
}
