import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const matrix = [[0.3, 0.2, 0.5], [0.1, 0.7, 0.2], [0.1, 0.1, 0.8]];
  const centers = matrix.map((m, i) => d3.pointRadial((2 - i) * 2 * Math.PI / matrix.length, 100));
  const factors = matrix.flatMap((m, i) => m.map((value, j) => ({i, j, value})));
  return Plot.plot({
    width: 400,
    height: 380,
    inset: 60,
    axis: null,
    marks: [
      Plot.dot(centers, {r: 40}),
      Plot.arrow(factors, {
        x1: ({i}) => centers[i][0],
        y1: ({i}) => centers[i][1],
        x2: ({j}) => centers[j][0],
        y2: ({j}) => centers[j][1],
        strokeOpacity: "value",
        bend: true,
        strokeWidth: 1,
        inset: 55
      }),
      Plot.text(centers, {text: ["A", "B", "C"], dy: 55}),
      Plot.text(factors, {
        x: ({i, j}) => (centers[i][0] + centers[j][0]) / 2 + (centers[i][1] - centers[j][1]) * 0.16,
        y: ({i, j}) => (centers[i][1] + centers[j][1]) / 2 - (centers[i][0] - centers[j][0]) * 0.16,
        text: "value"
      })
    ]
  });
}
