import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.raster(data, {
        pixelRatio: 0.5,
        x1: new Date(2000, 1, 1),
        x2: new Date(2010, 1, 1),
        y1: 0,
        y2: 12000,
        x: "date",
        y: "unemployed",
        fill: "industry",
        imageRendering: "pixelated",
        interpolate: interpolateNearest // "nearest"
      }),
      Plot.ruleY([0])
    ]
  });
}

function interpolateNearest(index, canvas, {X, Y, R, G, B, FO}, {r, g, b, a}) {
  const {width, height} = canvas;
  const context = canvas.getContext("2d");
  const v = d3.Delaunay.from(
    index,
    (i) => X[i],
    (i) => Y[i]
  ).voronoi([0, 0, width, height]);
  for (let i = 0; i < index.length; ++i) {
    const j = index[i];
    context.fillStyle = `rgba(${R ? R[j] : r},${G ? G[j] : g},${B ? B[j] : b},${FO ? FO[j] : a})`;
    context.beginPath();
    v.renderCell(i, context);
    context.fill();
  }
}
