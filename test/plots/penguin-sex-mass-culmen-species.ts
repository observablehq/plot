import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinSexMassCulmenSpecies() {
  const data = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    inset: 10,
    height: 320,
    grid: true,
    x: {
      ticks: 10,
      tickFormat: "~s"
    },
    y: {
      ticks: 10
    },
    facet: {
      data,
      x: "sex"
    },
    marks: [
      Plot.frame(),
      Plot.dot(
        data,
        Plot.bin(
          {
            r: "count",
            sort: "count",
            reverse: true
          },
          {
            x: "body_mass_g",
            y: "culmen_length_mm",
            stroke: "species",
            fill: "species",
            fillOpacity: 0.2
          }
        )
      )
    ]
  });
}
