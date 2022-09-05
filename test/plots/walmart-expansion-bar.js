import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const parse = d3.utcParse("%m/%d/%Y");

export default async function () {
  const walmart = await d3.tsv("data/walmart.tsv", (d) => ({date: parse(d.date)}));
  return Plot.plot({
    width: 300,
    facet: {
      data: walmart,
      y: (d) => d.date.getUTCFullYear(),
      inset: 0
    },
    x: {percent: true},
    fy: {tickFormat: "d"},
    marks: [
      Plot.barX(
        walmart,
        Plot.groupZ(
          {x: "count"},
          {
            fill: (d) => d.date.getUTCFullYear(),
            facet: {y: (d) => d.date.getUTCFullYear(), yFilter: "lte"},
            stroke: "white",
            offset: "expand"
          }
        )
      )
    ]
  });
}
