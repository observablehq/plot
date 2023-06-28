import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function usStatePopulationChange() {
  const data = await d3.csv<any>("data/us-state-population-2010-2019.csv", d3.autoType);
  return Plot.plot({
    height: 800,
    marginLeft: 100,
    grid: true,
    x: {
      axis: "top",
      inset: 6,
      round: true,
      label: "← decrease · Change in population, 2010–2019 (millions) · increase →",
      transform: (x) => x / 1e6,
      labelAnchor: "center",
      tickFormat: "+f"
    },
    y: {
      label: null,
      domain: d3.sort(data, (d) => d[2010] - d[2019]).map((d) => d.State)
    },
    color: {
      range: ["#e15759", "#4e79a7"]
    },
    marks: [
      Plot.barX(data, {
        y: "State",
        x: (d) => d[2019] - d[2010],
        fill: (d) => Math.sign(d[2019] - d[2010])
      }),
      Plot.ruleX([0])
    ]
  });
}

export async function usStatePopulationChangeRelative() {
  const statepop = await d3.csv<any>("data/us-state-population-2010-2019.csv", d3.autoType);
  const change = new Map(statepop.map((d) => [d.State, (d[2019] - d[2010]) / d[2010]]));
  return Plot.plot({
    height: 800,
    label: null,
    x: {
      axis: "top",
      grid: true,
      label: "← decrease · Change in population, 2010–2019 (%) · increase →",
      labelAnchor: "center",
      tickFormat: "+",
      percent: true
    },
    color: {
      scheme: "PiYG",
      type: "ordinal"
    },
    marks: [
      Plot.barX(statepop, {
        y: "State",
        x: (d) => change.get(d.State),
        fill: (d) => Math.sign(change.get(d.State)),
        sort: {y: "x"}
      }),
      Plot.axisY({x: 0, filter: (d) => change.get(d) >= 0, anchor: "left"}),
      Plot.axisY({x: 0, filter: (d) => change.get(d) < 0, anchor: "right"}),
      Plot.gridX({stroke: "white", strokeOpacity: 0.5}),
      Plot.ruleX([0])
    ]
  });
}
