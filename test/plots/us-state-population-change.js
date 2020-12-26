import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/us-state-population-2010-2019.csv", d3.autoType);
  return Plot.plot({
    height: 800,
    marginLeft: 100,
    grid: true,
    x: {
      axis: "top",
      inset: 6,
      round: true,
      label: "← decrease · Change in population, 2010–2019 (millions) · increase →",
      labelAnchor: "center",
      tickFormat: "+f"
    },
    y: {
      label: null,
      domain: d3.sort(data, (a, b) => d3.descending(a[2019] - a[2010], b[2019] - b[2010])).map(d => d.State)
    },
    color: {
      range: ["#e15759", "#4e79a7"]
    },
    marks: [
      Plot.barX(data, {
        y: "State",
        x: d => (d[2019] - d[2010]) / 1e6,
        fill: d => Math.sign(d[2019] - d[2010])
      }),
      Plot.ruleX([0])
    ]
  });
}
