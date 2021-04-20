import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
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
      domain: d3.groupSort(athletes, g => d3.mean(g, d => d.sex === "female"), d => d.sport),
      round: true
    },
    marks: [
      Plot.ruleX([.5], {strokeDasharray: [2, 2]}),
      Plot.dot(athletes, Plot.groupY({x: g => d3.mean(g, d => d === "female")}, {y: "sport", x: "sex", r: 2, fill: "black"})),
      Plot.ruleY(athletes, Plot.groupY({x: g => d3.mean(g, d => d === "female")}, {y: "sport", x: "sex", x1: () => .5}))
    ]
  });
}
