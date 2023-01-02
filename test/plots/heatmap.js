import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  return Plot.plot({
    color: {
      type: "diverging"
    },
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
    color: {
      type: "diverging"
    },
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

export async function heatmapLog() {
  return Plot.plot({
    height: 630,
    x: {ticks: 10, tickFormat: "+f", domain: [-2, 2]},
    y: {ticks: 10, tickFormat: "+f", domain: [-2.5, 1.5]},
    color: {type: "log", scheme: "magma"},
    marks: [
      Plot.raster({
        fill: (x, y) =>
          (1 + (x + y + 1) ** 2 * (19 - 14 * x + 3 * x ** 2 - 14 * y + 6 * x * y + 3 * y ** 2)) *
          (30 + (2 * x - 3 * y) ** 2 * (18 - 32 * x + 12 * x * x + 48 * y - 36 * x * y + 27 * y ** 2)),
        pixelRatio: 4
      }),
      Plot.ruleX([0], {strokeOpacity: 0.2}),
      Plot.ruleY([0], {strokeOpacity: 0.2}),
      Plot.frame()
    ]
  });
}

export async function heatmapAtan2() {
  return Plot.plot({axis: null, marks: [Plot.raster({fill: (x, y) => Math.atan2(y - 0.5, x - 0.5), pixelRatio: 2})]});
}
