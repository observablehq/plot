import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function athletesHeightWeightSport() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    height: 640,
    marks: [Plot.dot(athletes, Plot.shuffle({seed: 42, x: "weight", y: "height", fill: "sport"}))]
  });
}
