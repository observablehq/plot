import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function volcano() {
  const volcano = await d3.json("data/volcano.json");
  return Plot.plot({
    marks: [Plot.raster(volcano.values, {width: volcano.width, height: volcano.height}), Plot.frame()]
  });
}

export async function volcanoTerrain() {
  const volcano = await d3.json("data/volcano.json");
  return Plot.plot({
    color: {
      interpolate: d3.piecewise(d3.interpolateHsl, [
        d3.hsl(120, 1, 0.65 / 2),
        d3.hsl(60, 1, 0.9 / 2),
        d3.hsl(0, 0.4, 0.95)
      ])
    },
    marks: [
      Plot.raster(volcano.values, {width: volcano.width, height: volcano.height}),
      Plot.contour(volcano.values, {width: volcano.width, height: volcano.height, stroke: "white"}),
      Plot.frame()
    ]
  });
}

export async function volcanoContour() {
  const volcano = await d3.json("data/volcano.json");
  return Plot.plot({
    marks: [
      Plot.contour(volcano.values, {
        width: volcano.width,
        height: volcano.height,
        fill: Plot.identity,
        stroke: "currentColor"
      }),
      Plot.frame()
    ]
  });
}
