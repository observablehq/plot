import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function internFacetDate() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    fy: {interval: d3.utcYear.every(10)},
    marks: [Plot.dot(athletes, {x: "weight", y: "height", fy: "date_of_birth"})]
  });
}

export async function internFacetNaN() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    fy: {transform: (d) => (d ? Math.floor(d * 10) / 10 : NaN)},
    marks: [Plot.boxX(athletes, {x: "weight", y: "sex", fy: "height", stroke: "sex", r: 1})]
  });
}
