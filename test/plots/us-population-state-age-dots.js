import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const states = await d3.csv("data/us-population-state-age.csv", d3.autoType);
  const ages = states.columns.slice(1);
  const stateage = ages.flatMap(age => states.map(d => ({state: d.name, age, population: d[age]})));
  return Plot.plot({
    height: 660,
    grid: true,
    x: {
      axis: "top",
      label: "Percent (%) →",
      transform: d => d * 100
    },
    y: {
      domain: d3.groupSort(stateage, g => -g.find(d => d.age === "≥80").population / d3.sum(g, d => d.population), d => d.state),
      axis: null
    },
    color: {
      scheme: "spectral"
    },
    marks: [
      Plot.ruleX([0]),
      Plot.ruleY(stateage, Plot.reduceX({x1: "min", x2: "max"}, Plot.normalizeX({basis: "sum", x: "population", z: "state", y: "state"}))),
      Plot.dot(stateage, Plot.normalizeX({basis: "sum", z: "state", x: "population", y: "state", fill: "age"})),
      Plot.text(stateage, Plot.selectMinX(Plot.normalizeX({basis: "sum", z: "state", x: "population", y: "state", textAnchor: "end", dx: -6, text: "state"})))
    ]
  });
}
