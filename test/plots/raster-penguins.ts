import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

async function rasterPenguins(options: Plot.RasterOptions) {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.raster(penguins, {x: "body_mass_g", y: "flipper_length_mm", fill: "island", ...options}),
      Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", fill: "island", stroke: "white"})
    ]
  });
}

test(async function rasterPenguinsBarycentric() {
  return rasterPenguins({interpolate: "barycentric"});
});

test(async function rasterPenguinsBarycentricBlur() {
  return rasterPenguins({interpolate: "barycentric", blur: 7});
});

test(async function rasterPenguinsRandomWalk() {
  return rasterPenguins({interpolate: "random-walk"});
});

test(async function rasterPenguinsBlur() {
  return rasterPenguins({interpolate: "random-walk", blur: 7});
});

test(async function rasterPenguinsCSS4() {
  // observable10 converted to oklch
  const scale = d3.scaleOrdinal(["oklch(71.83% 0.176 30.86)", "oklch(54.8% 0.165 265.62)", "oklch(79.71% 0.16 82.35)"]);
  return rasterPenguins({interpolate: "random-walk", fill: (d: any) => scale(d.island)});
});
