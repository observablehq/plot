import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function clamp() {
  const data = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.plot({
    clamp: true,
    x: {domain: [new Date(Date.UTC(2006, 0, 1)), new Date(Date.UTC(2008, 0, 1))], clamp: false},
    y: {domain: [0, 5000], axis: false},
    marks: [
      Plot.dot(
        data,
        Plot.stackY({
          x: "date",
          y: "unemployed",
          fill: "industry"
        })
      )
    ]
  });
}
