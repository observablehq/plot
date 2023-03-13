import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function athletesSportSex() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 100,
    x: {
      label: "Women (%) →",
      domain: [0, 100],
      ticks: 10,
      percent: true,
      grid: true
    },
    y: {
      label: null
    },
    marks: [Plot.barX(athletes, Plot.groupY({x: "mean"}, {x: (d) => d.sex === "female", y: "sport", sort: {y: "x"}}))]
  });
}
