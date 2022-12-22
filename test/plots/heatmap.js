import * as Plot from "@observablehq/plot";

export default async function () {
  const width = 580 >> 2;
  const height = 370 >> 2;
  const k = width >> 4;
  return Plot.plot({
    marks: [
      Plot.imageData({
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
        width,
        height,
        fill: Float64Array.from(
          {length: width * height},
          (_, i) => Math.sin((i % width) / k) * Math.cos(Math.floor(i / width) / k)
        )
      }),
      Plot.frame()
    ]
  });
}
