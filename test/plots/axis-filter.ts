import * as Plot from "@observablehq/plot";

export async function axisFilter() {
  return Plot.plot({
    height: 100,
    marks: [
      Plot.dot([
        ["A", 0],
        ["B", 2],
        [0, 1]
      ]),
      Plot.gridX({filter: (d) => d}),
      Plot.gridY({filter: (d) => d}),
      Plot.axisX({filter: (d) => d}),
      Plot.axisY({filter: (d) => d})
    ]
  });
}
