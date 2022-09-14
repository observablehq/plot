import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/riaa-us-revenue.csv", d3.autoType);
  return Plot.plot({
    width: 800,
    facet: {data, x: "year"},
    fx: {tickFormat: "%y"},
    y: {
      grid: true,
      label: "↑ Annual revenue (billions, adj.)",
      transform: (d) => d / 1000
    },
    marks: [Plot.barY(data, {y: "revenue", fill: "format"})]
  });
}
