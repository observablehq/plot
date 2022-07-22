import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/first-ladies.csv", d3.autoType);
  const now = new Date("2021-07-19");
  return Plot.plot({
    width: 960,
    marginRight: 120,
    x: {
      axis: "top"
    },
    y: {
      axis: null
    },
    marks: [
      Plot.barX(data, {x1: "birth", x2: (d) => d.death ?? now, y: "name", fill: "#ccc"}),
      Plot.barX(data, {x1: "tenure_start", x2: (d) => d.tenure_end ?? now, y: "name", sort: {y: "x1", reduce: "min"}}),
      Plot.text(data, {x: (d) => d.death ?? now, y: "name", text: "name", textAnchor: "start", dx: 5})
    ]
  });
}
