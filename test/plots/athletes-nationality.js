import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  const top = new Set(d3.groupSort(athletes, g => -g.length, d => d.nationality).slice(0, 20));
  return Plot.plot({
    x: {
      grid: true
    },
    y: {
      domain: top,
      label: null
    },
    marks: [
      Plot.barX(athletes, Plot.groupY({x: "count"}, {filter: d => top.has(d.nationality), y: "nationality"})) // TODO remove filter
    ]
  });
}
