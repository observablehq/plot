import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/us-congress-members.csv", d3.autoType);
  return Plot.plot({
    y: { axis: null },
    x: {
      // a complicated way to get (min, max) inclusive
      domain: d3.range(...d3.extent(data, d => 2021 - d.birth).map((d, i) => d + i)),
      tickSize: 0,
      grid: true
    },
    marks: [
      Plot.ruleX([d3.median(data, d => 2021 - d.birth)], { strokeDasharray: [2, 2] }),
      Plot.stackBarY(data, {
        x: d => 2021 - d.birth,
        stroke: "white",
        strokeWidth: 2,
        title: "full_name"
      })
    ],
    height: 400,
    width: 950
  });
}
