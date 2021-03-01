import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/us-congress-members.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 50,
    marginRight: 150,
    x: { domain: [-11, 28], axis: null },
    y: {
      // a complicated way to get (min, max) inclusive
      domain: d3.range(...d3.extent(data, d => d.birth).map((d, i) => d + i)),
      tickSize: 0,
      grid: true
    },
    marks: [
      Plot.ruleY([d3.median(data, d => d.birth)], { strokeDasharray: [2, 2] }),
      Plot.stackBarX(data, {
        y: "birth",
        x: d => d.gender === "M" ? 1 : -1,
        fill: "gender",
        stroke: "white",
        title: "full_name"
      }),
      Plot.text(new Set(data.map(d => d.birth)), {
        x: () => 30, y: d => d,
        textAnchor: "start",
        text: d => `${2021 - d}${d === d3.median(data, d => d.birth) ? " years old (median age)" : ""}`
      })
    ],
    height: 700,
    width: 530
  });
}
