import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/us-congress-members.csv", d3.autoType);
  const age = d => 2021 - d.birth;
  const ageRange = d3.extent(data, age);
  return Plot.plot({
    height: 300,
    x: {
      domain: d3.range(...ageRange.map((d, i) => d + i)),
      ticks: d3.ticks(...ageRange, 10),
      label: "Age →",
      labelAnchor: "right"
    },
    y: {
      grid: true,
      label: "↑ Frequency"
    },
    marks: [
      Plot.dotY(data, Plot.stackY2({x: age, fill: "currentColor", title: "full_name"})),
      Plot.ruleY([0])
    ]
  });
}
