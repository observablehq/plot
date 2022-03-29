import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const M = [[0.3, 0.2, 0.5], [0.1, 0.7, 0.2], [0.1, 0.1, 0.8]];
  const centers = d3.range(M.length).map(i => d3.pointRadial((2 - i) * 2 * Math.PI / M.length, 100));
  return Plot.plot({
    width: 400,
    height: 380,
    inset: 100,
    axis: null,
    marks: [
      Plot.dot(centers, { r: 40 }),
      Plot.arrow(M.flatMap((row, i) => row.map((value, j) => ({i, j, value}))), {
        x1: ({i}) => centers[i][0],
        y1: ({i}) => centers[i][1],
        x2: ({j}) => centers[j][0],
        y2: ({j}) => centers[j][1],
        strokeOpacity: ({value}) => value,
        bend: true,
        inset: 55
      }),
      Plot.text(centers, {text: ["A", "B", "C"]})
    ]
  });
}
