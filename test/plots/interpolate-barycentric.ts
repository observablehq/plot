import * as Plot from "@observablehq/plot";

export async function interpolateBarycentric4() {
  const I = [0, 1, 2, 3];
  const X = [297, 295, 80, 59];
  const Y = [269, 266, 275, 265];
  return Plot.plot({
    color: {scheme: "greys", domain: [-0.1, 8]},
    x: {domain: [53, 314]},
    y: {domain: [265, 276]},
    marks: [
      Plot.frame({fill: "red"}),
      Plot.raster(I, {pixelSize: 1, x: X, y: Y, fill: I, interpolate: "barycentric", imageRendering: "pixelated"}),
      Plot.delaunayMesh(I, {x: X, y: Y, stroke: "black"}),
      Plot.dot(I, {x: X, y: Y, r: 2, fill: "black"})
    ]
  });
}

export async function interpolateBarycentric4k() {
  const {x, y, v} = await fetch("data/4kpoints.json").then((d) => d.json());
  return Plot.plot({
    color: {scheme: "rdbu", range: [0.2, 0.8]},
    x: {domain: [0.5, 580.5]},
    y: {domain: [0, 350]},
    marks: [
      Plot.frame({fill: "black"}),
      Plot.raster({length: x.length}, {x, y, fill: v, interpolate: "barycentric", imageRendering: "pixelated"})
    ]
  });
}
