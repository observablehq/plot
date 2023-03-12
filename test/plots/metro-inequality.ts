import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function metroInequality() {
  const data = await d3.csv<any>("data/metros.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    inset: 10,
    x: {
      type: "log",
      label: "Population →"
    },
    y: {
      label: "↑ Inequality"
    },
    marks: [Plot.dot(data, {x: "POP_1980", y: "R90_10_1980"})]
  });
}
