import * as Plot from "@observablehq/plot";

export default async function () {
  const width = 580 >> 2;
  const height = 370 >> 2;
  const k = (4 * Math.PI) / width; // units per sample
  return Plot.plot({
    marks: [
      Plot.imageData({x2: width * k, y2: height * k, width, height, fill: (x, y) => Math.sin(x) * Math.cos(y)}),
      Plot.frame()
    ]
  });
}
