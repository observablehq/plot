import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  return Plot.plot({
    marks: [
      Plot.raster({
        fill: (x, y) => x * y * Math.sin(x) * Math.cos(y),
        x1: 0,
        y1: 0,
        x2: 4 * Math.PI,
        y2: 4 * Math.PI * (350 / 580),
        pixelRatio: 3
      }),
      Plot.frame()
    ]
  });
}

export async function heatmapArray() {
  const x1 = 0;
  const y1 = 0;
  const x2 = 4 * Math.PI;
  const y2 = 4 * Math.PI * (350 / 580);
  const pixelRatio = 3;
  const width = Math.round(580 / pixelRatio);
  const height = Math.round(350 / pixelRatio);
  const x = (f => i => f.invert(i % width + 0.5))(d3.scaleLinear([x1, x2], [0, width])); // prettier-ignore
  const y = (f => i => f.invert(Math.floor(i / width) + 0.5))(d3.scaleLinear([y2, y1], [height, 0])); // prettier-ignore
  return Plot.plot({
    marks: [
      Plot.raster(d3.range(width * height), {
        fill: ((f) => (_, i) => f(x(i), y(i)))((x, y) => x * y * Math.sin(x) * Math.cos(y)), // prettier-ignore
        x,
        y,
        x1,
        y1,
        x2,
        y2,
        width,
        height
      }),
      Plot.frame()
    ]
  });
}
