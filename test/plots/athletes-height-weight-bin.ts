import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function athletesHeightWeightBin() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    round: true,
    grid: true,
    height: 640,
    y: {
      ticks: 10
    },
    color: {
      scheme: "YlGnBu"
    },
    marks: [Plot.rect(athletes, Plot.bin({fill: "count"}, {x: "weight", y: "height"}))]
  });
}
