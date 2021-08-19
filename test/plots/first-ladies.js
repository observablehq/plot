import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/first-ladies.csv", d3.autoType);
  const now = Date.UTC(2021, 7, 19);
  return Plot.plot({
    width: 940,
    marginRight: 120,
    y: { axis: null },
    marks: [
      Plot.barX(data, {
        x1: "birth",
        x2: d => d.death || now,
        y: "name",
        fill: "#ccc"
      }),
      Plot.barX(data, {
        x1: "tenure_start",
        x2: d => d.tenure_end || now,
        y: "name",
        sort: { y: { value: "x1", reduce: "min" } }
      }),
      Plot.text(data, {
        x: d => d.death || now,
        y: "name",
        text: "name",
        textAnchor: "start",
        dx: 5
      })
    ]
  });
}
