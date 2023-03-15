import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function dateIntervalWeekMonth() {
  const data = await d3.csv("data/bls-industry-unemployment.csv");
  return Plot.plot({
    marginLeft: 80,
    color: {type: "linear", scheme: "blues"},
    marks: (
      [
        {label: "month", interval: "month"},
        {label: "d3.utcMonth", interval: d3.utcMonth},
        {label: "week", interval: "week"},
        {label: "d3.utcWeek", interval: d3.utcWeek}
      ] as const
    ).map(({label, interval}) =>
      Plot.barX(data, {
        x: "date",
        filter: (d) => d.industry === "Construction",
        interval,
        fill: "unemployed",
        title: "unemployed",
        inset: 0,
        fy: () => label
      })
    )
  });
}
