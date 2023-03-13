import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function sfCovidDeaths() {
  const cases = await d3.csv<any>("data/sf-covid.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.areaY(
        cases,
        Plot.binX(
          {
            y: "sum",
            filter: null
          },
          {
            x: "specimen_collection_date",
            y: "case_count",
            filter: (d) => d.case_disposition === "Death",
            fill: "transmission_category",
            curve: "step",
            thresholds: "week"
          }
        )
      ),
      Plot.ruleY([0])
    ]
  });
}
