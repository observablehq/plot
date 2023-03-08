import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinDodge() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 200,
    marks: [Plot.dot(penguins, Plot.dodgeY({x: "body_mass_g"}))]
  });
}
