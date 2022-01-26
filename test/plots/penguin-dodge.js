import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 400,
    marks: [
      Plot.dot(penguins, Plot.dodgeY({x: "body_mass_g", fill: "black", r: 7})),
      Plot.text(penguins, Plot.dodgeY({x: "body_mass_g", text: d => d.species?.[0], r: 7, fill: "white"}))
    ]
  });
}
