import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const cases = await d3.csv("data/sf-covid.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.ruleY([0]),
      Plot.lineY(cases, Plot.binX({
        y: "sum",
        filter: null
      }, {
        x: "specimen_collection_date",
        y: "case_count",
        filter: d => d.case_disposition === "Death",
        stroke: "transmission_category",
        curve: "step",
        thresholds: d3.utcWeek
      }))
    ]
  });
}
