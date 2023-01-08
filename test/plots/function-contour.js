import * as Plot from "@observablehq/plot";

export async function functionContour() {
  return Plot.plot({
    color: {
      type: "diverging"
    },
    marks: [
      Plot.contour({
        value: (x, y) => x * y * Math.sin(x) * Math.cos(y),
        x1: 0,
        y1: 0,
        x2: 4 * Math.PI,
        y2: 4 * Math.PI * (350 / 580)
      })
    ]
  });
}
