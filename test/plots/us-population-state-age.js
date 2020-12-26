import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  let data = await d3.csv("data/us-population-state-age.csv", d3.autoType);
  const ages = data.columns.slice(1);
  const totals = new Map(data.map(d => [d.name, d3.sum(ages, age => d[age])]));
  data = ages.flatMap(age => data.map(d => ({state: d.name, age, percent: d[age] * 100 / totals.get(d.name)})));
  return Plot.plot({
    marginLeft: 50,
    grid: true,
    y: {
      domain: ages,
      label: "Age"
    },
    x: {
      axis: "top",
      label: "Percent (%) →"
    },
    marks: [
      Plot.ruleX([0]),
      Plot.tickX(data, {x: "percent", y: "age"})
    ]
  });
}
