import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// Test for floating point precision issue in interpolateBarycentric.
export async function rasterPrecision() {
  const data = d3.range(4).map((i) => {
    const x = i % 2;
    const y = Math.floor(i / 2);
    return [49.4 + 100 * (x + y), 150.4 + 100 * (x - y)];
  });
  return Plot.plot({
    x: {type: "identity"},
    y: {type: "identity"},
    color: {scheme: "Sinebow"},
    marks: [
      Plot.raster(data, {
        fill: (d, i) => i,
        interpolate: "barycentric"
      }),
      Plot.dot(data, {fill: (d, i) => i, stroke: "white"})
    ]
  });
}

export async function rasterFacet() {
  const points = d3.range(0, 2 * Math.PI, Math.PI / 10).map((d) => [Math.cos(d), Math.sin(d)]);
  return Plot.plot({
    aspectRatio: 1,
    inset: 100,
    color: {scheme: "Sinebow"},
    marks: [
      Plot.raster(points, {
        fill: "0",
        fx: (d, i) => i % 2,
        interpolate: "barycentric"
      }),
      Plot.dot(points, {fx: (d, i) => i % 2, fill: "0", stroke: "white"})
    ]
  });
}
