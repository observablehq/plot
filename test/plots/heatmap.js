import * as Plot from "@observablehq/plot";

export default async function () {
  const width = 580 >> 2;
  const height = 350 >> 2;
  const k = (4 * Math.PI) / width; // units per sample
  return Plot.plot({
    marks: [
      Plot.raster({
        fill: (x, y) => x * y * Math.sin(x) * Math.cos(y),
        x1: 0,
        y1: 0,
        x2: width * k,
        y2: height * k,
        width,
        height
      }),
      Plot.frame()
    ]
  });
}
