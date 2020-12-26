import * as Plot from "@observablehq/plot";
import {sum} from "d3-array";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  let data = await csv("data/us-population-state-age.csv", autoType);
  const ages = data.columns.slice(1);
  const totals = new Map(data.map(d => [d.name, sum(ages, age => d[age])]));
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
