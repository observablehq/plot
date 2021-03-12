import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const states = await d3.csv("data/us-population-state-age.csv", d3.autoType);
  const ages = states.columns.slice(1);
  const stateage = ages.flatMap(age => states.map(d => ({state: d.name, age, population: d[age]})));
  return Plot.plot({
    marginLeft: 50,
    grid: true,
    x: {
      axis: "top",
      label: "Percent (%) →",
      transform: d => d * 100
    },
    y: {
      domain: ages,
      label: "Age"
    },
    marks: [
      Plot.ruleX([0]),
      Plot.tickX(stateage, Plot.normalizeX({basis: "sum", z: "state", x: "population", y: "age"}))
    ]
  });
}
