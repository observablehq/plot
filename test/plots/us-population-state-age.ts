import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function usPopulationStateAge() {
  const states = await d3.csv<any>("data/us-population-state-age.csv", d3.autoType);
  const ages = states.columns.slice(1);
  const stateage = ages.flatMap((age) => states.map((d) => ({state: d.name, age, population: d[age]})));
  return Plot.plot({
    marginLeft: 50,
    grid: true,
    x: {
      axis: "top",
      label: "Percent (%) →",
      transform: (d) => d * 100
    },
    y: {
      domain: ages,
      label: "Age"
    },
    marks: [Plot.ruleX([0]), Plot.tickX(stateage, Plot.normalizeX("sum", {z: "state", x: "population", y: "age"}))]
  });
}

export async function usPopulationStateAgeGrouped() {
  const states = await d3.csv<any>("data/us-population-state-age.csv", d3.autoType);
  const ages = states.columns.slice(1);
  const stateage = ages.flatMap((age) => states.map((d) => ({state: d.name, age, population: d[age]})));
  return Plot.plot({
    x: {
      axis: null,
      domain: ages
    },
    y: {
      grid: true,
      tickFormat: "s"
    },
    color: {
      domain: ages,
      scheme: "spectral"
    },
    fx: {
      label: null,
      tickSize: 6
    },
    marks: [
      Plot.barY(stateage, {
        fx: "state",
        x: "age",
        y: "population",
        fill: "age",
        title: "age",
        sort: {fx: "y", reverse: true, limit: 6}
      }),
      Plot.ruleY([0])
    ]
  });
}
