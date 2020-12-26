import * as Plot from "@observablehq/plot";
import {descending, sort} from "d3-array";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/us-state-population-2010-2019.csv", autoType);
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
      domain: sort(data, (a, b) => descending(a[2019] - a[2010], b[2019] - b[2010])).map(d => d.State)
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
