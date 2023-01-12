import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

async function plotCa55(mark) {
  const ca55 = await d3.csv("data/ca55-south.csv", d3.autoType);
  const domain = {type: "MultiPoint", coordinates: ca55.map((d) => [d.GRID_EAST, d.GRID_NORTH])};
  return Plot.plot({
    width: 640,
    height: 484,
    projection: {type: "reflect-y", inset: 3, domain},
    color: {type: "diverging"},
    marks: [mark(ca55)]
  });
}

async function rasterCa55(options) {
  return plotCa55((ca55) => Plot.raster(ca55, {x: "GRID_EAST", y: "GRID_NORTH", fill: "MAG_IGRF90", ...options}));
}

export async function rasterCa55None() {
  return rasterCa55({pixelSize: 3, imageRendering: "pixelated"});
}

export async function rasterCa55Barycentric() {
  return rasterCa55({interpolate: "barycentric"});
}

export async function rasterCa55RandomWalk() {
  return rasterCa55({interpolate: "random-walk"});
}

export async function rasterCa55Nearest() {
  return rasterCa55({interpolate: "nearest"});
}

export async function contourCa55() {
  return plotCa55((ca55) =>
    Plot.contour(ca55, {
      x: "GRID_EAST",
      y: "GRID_NORTH",
      fill: "MAG_IGRF90",
      stroke: "currentColor",
      blur: 3
    })
  );
}
