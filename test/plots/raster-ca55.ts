import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

async function plotCa55(mark: (data: any[]) => Plot.Markish) {
  const ca55 = await d3.csv<any>("data/ca55-south.csv", d3.autoType);
  const domain = {type: "MultiPoint", coordinates: ca55.map((d) => [d.GRID_EAST, d.GRID_NORTH])} as const;
  return Plot.plot({
    width: 640,
    height: 484,
    projection: {type: "reflect-y", inset: 3, domain},
    color: {type: "diverging"},
    marks: [mark(ca55)]
  });
}

async function rasterCa55(options: Plot.RasterOptions) {
  return plotCa55((ca55) => Plot.raster(ca55, {x: "GRID_EAST", y: "GRID_NORTH", fill: "MAG_IGRF90", ...options}));
}

test(async function rasterCa55None() {
  return rasterCa55({pixelSize: 3, imageRendering: "pixelated"});
});

test(async function rasterCa55Barycentric() {
  return rasterCa55({interpolate: "barycentric"});
});

test(async function rasterCa55RandomWalk() {
  return rasterCa55({interpolate: "random-walk"});
});

test(async function rasterCa55Nearest() {
  return rasterCa55({interpolate: "nearest"});
});

test(async function rasterCa55Color() {
  const ca55 = await d3.csv<any>("data/ca55-south.csv", d3.autoType);
  const domain = {type: "MultiPoint", coordinates: ca55.map((d) => [d.GRID_EAST, d.GRID_NORTH])} as const;
  return Plot.plot({
    width: 640,
    height: 484,
    projection: {type: "reflect-y", inset: 3, domain},
    marks: [
      Plot.raster(ca55, {
        x: "GRID_EAST",
        y: "GRID_NORTH",
        interpolate: "random-walk",
        fill: (d) => d3.hcl(d.MAG_IGRF90, 120, 80).formatHex()
      })
    ]
  });
});

test(async function contourCa55() {
  return plotCa55((ca55) =>
    Plot.contour(ca55, {
      x: "GRID_EAST",
      y: "GRID_NORTH",
      fill: "MAG_IGRF90",
      stroke: "currentColor",
      blur: 3
    })
  );
});
