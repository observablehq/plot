import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function athletesSortNullLimit() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.plot({
    color: {legend: true},
    marks: [Plot.dot(athletes, {x: "height", y: "weight", stroke: "nationality", sort: {color: null, limit: 10}})]
  });
}
