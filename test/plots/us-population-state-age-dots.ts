import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function usPopulationStateAgeDots() {
  const states = await d3.csv<any>("data/us-population-state-age.csv", d3.autoType);
  const ages = states.columns.slice(1);
  const stateage = ages.flatMap((age) => states.map((d) => ({state: d.name, age, population: d[age]})));
  const position = Plot.normalizeX("sum", {z: "state", x: "population", y: "state"});
  return Plot.plot({
    height: 660,
    grid: true,
    x: {
      axis: "top",
      label: "Percent (%) →",
      transform: (d) => d * 100
    },
    y: {
      axis: null
    },
    color: {
      scheme: "spectral",
      domain: ages
    },
    marks: [
      Plot.ruleX([0]),
      Plot.ruleY(stateage, Plot.groupY({x1: "min", x2: "max"}, position)),
      Plot.dot(stateage, {...position, fill: "age"}),
      Plot.text(
        stateage,
        Plot.selectMinX({
          ...position,
          textAnchor: "end",
          dx: -6,
          text: "state",
          sort: {y: "x", reduce: "min", reverse: true}
        })
      )
    ]
  });
}
