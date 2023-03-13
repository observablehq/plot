import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature, mesh} from "topojson-client";

async function rasterWalmart(options) {
  const [walmarts, [outline, statemesh]] = await Promise.all([
    d3.tsv<any>("data/walmarts.tsv", d3.autoType),
    d3
      .json<any>("data/us-counties-10m.json")
      .then((us) => [
        feature(us, us.objects.nation.geometries[0]).geometry.coordinates[0][0],
        mesh(us, us.objects.states, (a, b) => a !== b)
      ])
  ]);
  return Plot.plot({
    projection: "albers",
    color: {scheme: "spectral"},
    marks: [
      Plot.raster(walmarts, {x: "longitude", y: "latitude", ...options}),
      Plot.geo({type: "Polygon", coordinates: [d3.reverse(outline) as number[][]]}, {fill: "white"}),
      Plot.geo(statemesh)
    ]
  });
}

export async function rasterWalmartBarycentric() {
  return rasterWalmart({interpolate: "barycentric", fill: "date"});
}

export async function rasterWalmartBarycentricOpacity() {
  return rasterWalmart({interpolate: "barycentric", fillOpacity: "date"});
}

export async function rasterWalmartRandomWalk() {
  return rasterWalmart({interpolate: "random-walk", fill: "date"});
}

export async function rasterWalmartWalkOpacity() {
  return rasterWalmart({interpolate: "random-walk", fillOpacity: "date"});
}
