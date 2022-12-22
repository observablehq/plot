import * as Plot from "@observablehq/plot";

export default async function () {
  const width = 580 >> 2;
  const height = 370 >> 2;
  const scale = (4 * Math.PI) / width; // units per sample
  return Plot.plot({
    marks: [
      Plot.imageData({
        x2: width * scale,
        y2: height * scale,
        width,
        height,
        fill: Float64Array.from({length: width * height}, (_, i) => {
          const x = (i % width) * scale;
          const y = Math.floor(i / width) * scale;
          return Math.sin(x) * Math.cos(y);
        })
      }),
      Plot.frame()
    ]
  });
}
