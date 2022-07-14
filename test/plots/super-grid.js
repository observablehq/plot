import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  return Plot.plot({
    width: 510,
    height: 470,
    marks: [
      Plot.gridX(d3.range(0, 101), {
        stroke: (d) => d % 5 === 0 ? "steelblue" : "red",
        strokeWidth: (d) => d % 10 === 0 ? 1 : 0.5,
        strokeOpacity: (d) => d % 10 === 0 ? 0.5 : 0.1
      }),
      Plot.gridY(d3.range(0, 101), {
        stroke: (d, i) => i % 5 === 0 ? "steelblue" : "red",
        strokeWidth: (d, i) => i % 10 === 0 ? 1 : 0.5,
        strokeOpacity: (d, i) => i % 10 === 0 ? 0.5 : 0.2
      })
    ]
  });
}
