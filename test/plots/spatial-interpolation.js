import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature, mesh} from "topojson-client";

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

export async function spatialInterpolationNone() {
  return rasterCa55(null);
}

export async function spatialInterpolationBarycentric() {
  return rasterCa55("barycentric");
}

export async function spatialInterpolationSpheres() {
  return rasterCa55("walk-on-spheres");
}

export async function spatialInterpolationNearest() {
  return rasterCa55("nearest");
}

async function rasterWalmart(rasterize) {
  const [walmarts, [outline, statemesh]] = await Promise.all([
    d3.tsv("data/walmarts.tsv", d3.autoType),
    d3
      .json("data/us-counties-10m.json")
      .then((us) => [
        feature(us, us.objects.nation.geometries[0]).geometry.coordinates[0][0],
        mesh(us, us.objects.states, (a, b) => a !== b)
      ])
  ]);
  return Plot.plot({
    projection: "albers",
    color: {
      scheme: "spectral",
      label: "Opening year"
    },
    marks: [
      Plot.raster(walmarts, {x: "longitude", y: "latitude", fill: "date", rasterize}),
      Plot.geo({type: "Polygon", coordinates: [d3.reverse(outline)]}, {fill: "white"}),
      Plot.geo(statemesh)
    ]
  });
}

export async function spatialInterpolationWalmart() {
  return rasterWalmart("barycentric");
}

export async function spatialInterpolationWalmartSpheres() {
  return rasterWalmart("walk-on-spheres");
}

export async function spatialInterpolationPenguins() {
  return rasterPenguins("barycentric");
}

export async function spatialInterpolationPenguinsSpheres() {
  return rasterPenguins("walk-on-spheres");
}

async function rasterPenguins(rasterize) {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.raster(penguins, {x: "body_mass_g", y: "flipper_length_mm", fill: "island", rasterize}),
      Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", fill: "island", stroke: "white"})
    ]
  });
}
