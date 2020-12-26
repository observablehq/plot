import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";
import {utcParse} from "d3-time-format";

const parseDate = utcParse("%b-%Y");

export default async function() {
  const data = await csv("data/us-retail-sales.csv", ({Date, ...d}) => ({Date: parseDate(Date), ...autoType(d)}));
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
