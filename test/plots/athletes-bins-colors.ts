import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function athletesBinsColors() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.rectY(athletes, Plot.binX({fill: "x", y: "count"}, {x: "weight"})), Plot.ruleY([0])]
  });
}
