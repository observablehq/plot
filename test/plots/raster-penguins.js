import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

async function rasterPenguins(interpolate, blur) {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.raster(penguins, {x: "body_mass_g", y: "flipper_length_mm", fill: "island", interpolate, blur}),
      Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", fill: "island", stroke: "white"})
    ]
  });
}

export async function rasterPenguinsBarycentric() {
  return rasterPenguins("barycentric");
}

export async function rasterPenguinsRandomWalk() {
  return rasterPenguins("random-walk");
}

export async function rasterPenguinsBlur() {
  return rasterPenguins("random-walk", 7);
}
