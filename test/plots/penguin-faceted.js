import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 80,
    facet: {
      data,
      x: "sex",
      y: "island"
    },
    x: {
      grid: true
    },
    y: {
      grid: true
    },
    marks: [
      Plot.dot(data.slice(), {
        x: "body_mass_g",
        y: "culmen_length_mm",
        fill: "#f2f2f2",
        stroke: "white",
        r: 3.5
      }),
      Plot.dot(data, {
        x: "body_mass_g",
        y: data.map(d => d["culmen_length_mm"] || 50),
        fill: "species",
        stroke: "white",
        strokeWidth: 0.5,
        r: 4
      })
    ],
    height: 600
  });
}
