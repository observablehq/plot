import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const r = d3.scaleOrdinal(new Set(penguins.map(d => d.species)), [-60, 0, 60]);
  return Plot.plot({
    height: 450,
    grid: true,
    marks: [
      Plot.dot(penguins, Plot.dodgeX({padding: 2, anchor: "middle"}, {y: "body_mass_g", fill: "sex", r: 7})),
      Plot.vector(penguins, Plot.dodgeX({padding: 2, anchor: "middle"}, {y: "body_mass_g", rotate: d => r(d.species), r: 7, length: 5}))
    ],
    color: {scheme: "pastel2"}
  });
}
