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

export async function contourVapor() {
  return Plot.plot({
    width: 960,
    projection: "equal-earth",
    color: {scheme: "blues"},
    marks: [
      Plot.contour(await vapor(), {
        fill: Plot.identity,
        width: 360,
        height: 180,
        x1: -180,
        y1: 90,
        x2: 180,
        y2: -90,
        blur: 0.5,
        stroke: "currentColor",
        strokeWidth: 0.5,
        clip: "sphere"
      }),
      Plot.sphere()
    ]
  });
}

export async function rasterVaporSqrt() {
  return Plot.plot({
    color: {scheme: "blues"},
    y: {type: "sqrt"},
    marks: [
      Plot.raster(await vapor(), {
        fill: (d) => d,
        width: 360,
        height: 180,
        x1: -180,
        y1: 90,
        x2: 180,
        y2: -90,
        interpolate: "nearest"
      })
    ]
  });
}

export async function rasterVaporEqualEarth() {
  return Plot.plot({
    projection: "equal-earth",
    color: {scheme: "blues"},
    marks: [
      Plot.raster(await vapor(), {
        fill: (d) => d,
        width: 360,
        height: 180,
        x1: -180,
        y1: 90,
        x2: 180,
        y2: -90,
        interpolate: "random-walk",
        clip: "sphere"
      }),
      Plot.sphere()
    ]
  });
}

export async function rasterVaporEqualEarthBarycentric() {
  return Plot.plot({
    projection: "equal-earth",
    color: {scheme: "blues"},
    marks: [
      Plot.raster(await vapor(), {
        fill: (d) => d,
        width: 360,
        height: 180,
        x1: -180,
        y1: 90,
        x2: 180,
        y2: -90,
        interpolate: "barycentric",
        clip: "sphere"
      }),
      Plot.sphere()
    ]
  });
}
