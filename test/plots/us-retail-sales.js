import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const parseDate = d3.utcParse("%b-%Y");

export default async function() {
  const data = await d3.csv("data/us-retail-sales.csv", ({Date, ...d}) => ({Date: parseDate(Date), ...d3.autoType(d)}));
  return Plot.plot({
    x: {
      label: null
    },
    y: {
      grid: true,
      label: "U.S. retail monthly sales (in billions, seasonally-adjusted)"
    },
    marks: [
      Plot.line(data, {
        x: "Date",
        y: d => d.Sales / 1e3,
        stroke: "#bab0ab"
      }),
      Plot.line(data, {
        x: "Date",
        y: d => d["Seasonally Adjusted Sales"] / 1e3
      }),
      Plot.ruleY([0])
    ]
  });
}
