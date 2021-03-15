import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const states = await d3.csv("data/us-population-state-age.csv", d3.autoType);
  const ages = states.columns.slice(1);
  const stateage = ages.flatMap(age => states.map(d => ({state: d.name, age, population: d[age]})));
  const position = Plot.normalizeX({basis: "sum", z: "state", x: "population", y: "state"});
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
      scheme: "spectral",
      domain: stateage.ages
    },
    marks: [
      Plot.ruleX([0]),
      Plot.ruleY(stateage, Plot.reduceX({x1: "min", x2: "max"}, position)),
      Plot.dot(stateage, {...position, fill: "age"}),
      Plot.text(stateage, Plot.selectMinX({...position, textAnchor: "end", dx: -6, text: "state"}))
    ]
  });
}
