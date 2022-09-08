import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const parse = d3.utcParse("%m/%d/%Y");

export default async function () {
  const walmart = await d3.tsv("data/walmart.tsv", (d) => ({
    date: parse(d.date),
    year: parse(d.date).getUTCFullYear()
  }));
  return Plot.plot({
    width: 300,
    facet: {inset: 0, label: null},
    x: {percent: true},
    fy: {tickFormat: "d"},
    marks: [
      Plot.barX(
        walmart,
        Plot.groupZ(
          {x: "count"},
          {
            fill: "year",
            facet: {y: "year", yFilter: "lte"},
            stroke: "white",
            offset: "expand"
          }
        )
      )
    ]
  });
}
