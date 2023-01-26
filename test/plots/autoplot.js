import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function autoHistogram() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.auto(athletes, {x: "weight"}).plot();
}
