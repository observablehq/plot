import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {feature, mesh} from "topojson-client";

async function rasterWalmart(interpolate, opacity) {
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
      Plot.raster(walmarts, {x: "longitude", y: "latitude", [opacity ? "fillOpacity" : "fill"]: "date", interpolate}),
      Plot.geo({type: "Polygon", coordinates: [d3.reverse(outline)]}, {fill: "white"}),
      Plot.geo(statemesh)
    ]
  });
}

export async function rasterWalmartBarycentric() {
  return rasterWalmart("barycentric");
}

export async function rasterWalmartBarycentricOpacity() {
  return rasterWalmart("barycentric", true);
}

export async function rasterWalmartRandomWalk() {
  return rasterWalmart("random-walk");
}

export async function rasterWalmartWalkOpacity() {
  return rasterWalmart("random-walk", true);
}
