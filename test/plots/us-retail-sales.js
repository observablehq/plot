import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const parseDate = d3.utcParse("%b-%Y");

export default async function() {
  const data = await d3.csv("data/us-retail-sales.csv", ({Date, ...d}) => ({Date: parseDate(Date), ...d3.autoType(d)}));
  return Plot.plot({
    y: {
      grid: true,
      label: "U.S. retail monthly sales (in billions, seasonally-adjusted)",
      transform: y => y / 1e3 // convert millions to billions
    },
    marks: [
      Plot.line(data, {
        x: "Date",
        y: "Sales",
        stroke: "#bab0ab"
      }),
      Plot.line(data, {
        x: "Date",
        y: "Seasonally Adjusted Sales"
      }),
      Plot.ruleY([0])
    ]
  });
}
