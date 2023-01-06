import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

async function rasterCa55(rasterize) {
  const ca55 = await d3.csv("data/ca55-south.csv", d3.autoType);
  return Plot.plot({
    width: 640,
    height: 484,
    projection: {
      type: "identity",
      inset: 3,
      domain: {
        type: "MultiPoint",
        coordinates: ca55.map((d) => [d.GRID_EAST, d.GRID_NORTH])
      }
    },
    color: {
      type: "diverging"
    },
    marks: [
      Plot.raster(ca55, {
        pixelSize: rasterize ? 1 : 3,
        x: "GRID_EAST",
        y: "GRID_NORTH",
        fill: "MAG_IGRF90",
        imageRendering: rasterize ? undefined : "pixelated",
        rasterize
      })
    ]
  });
}

export async function rasterCa55None() {
  return rasterCa55();
}

export async function rasterCa55Barycentric() {
  return rasterCa55("barycentric");
}

export async function rasterCa55Spheres() {
  return rasterCa55("walk-on-spheres");
}

export async function rasterCa55Nearest() {
  return rasterCa55("nearest");
}
