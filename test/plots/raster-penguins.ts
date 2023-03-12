import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

async function rasterPenguins(options) {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.raster(penguins, {x: "body_mass_g", y: "flipper_length_mm", fill: "island", ...options}),
      Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", fill: "island", stroke: "white"})
    ]
  });
}

export async function rasterPenguinsBarycentric() {
  return rasterPenguins({interpolate: "barycentric"});
}

export async function rasterPenguinsRandomWalk() {
  return rasterPenguins({interpolate: "random-walk"});
}

export async function rasterPenguinsBlur() {
  return rasterPenguins({interpolate: "random-walk", blur: 7});
}
