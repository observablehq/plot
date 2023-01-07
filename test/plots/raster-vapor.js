import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

async function vapor() {
  return d3
    .csvParseRows(await d3.text("data/water-vapor.csv"), d3.autoType)
    .flat()
    .map((x) => (x === 99999 ? null : x));
}

export async function rasterVapor() {
  return Plot.plot({
    color: {scheme: "blues"},
    x: {transform: (x) => x - 180},
    y: {transform: (y) => 90 - y},
    marks: [Plot.raster({fill: await vapor(), width: 360, height: 180})]
  });
}

export async function rasterVaporEqualEarth() {
  return Plot.plot({
    projection: "equal-earth",
    color: {scheme: "blues"},
    marks: [
      Plot.raster(await vapor(), {
        fill: (d) => d,
        x: (d, i) => (i % 360) - 180,
        y: (d, i) => 90 - ((i / 360) | 0),
        rasterize: "random-walk",
        clip: "sphere"
      }),
      Plot.sphere()
    ]
  });
}
