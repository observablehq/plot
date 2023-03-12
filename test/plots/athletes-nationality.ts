import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function athletesNationality() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    x: {
      grid: true
    },
    y: {
      label: null
    },
    marks: [
      Plot.barX(athletes, Plot.groupY({x: "count"}, {y: "nationality", sort: {y: "x", reverse: true, limit: 20}}))
    ]
  });
}
