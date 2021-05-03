import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  const female = data => d3.mean(data, d => d.sex === "female");
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
      label: null,
      domain: d3.groupSort(athletes, female, d => d.sport)
    },
    marks: [
      Plot.barX(athletes, Plot.groupY({x: female}, {y: "sport"}))
    ]
  });
}
