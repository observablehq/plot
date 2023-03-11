import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function intervalWeekMonth() {
  const data = await d3.csv("data/bls-industry-unemployment.csv");
  return Plot.plot({
    marginLeft: 80,
    color: {type: "linear", scheme: "blues"},
    marks: [
      {label: "month", interval: "month" as Plot.TimeIntervalName},
      {label: "d3.utcMonth", interval: d3.utcMonth as Plot.IntervalImplementation<Date>},
      {label: "week", interval: "week" as Plot.TimeIntervalName},
      {label: "d3.utcWeek", interval: d3.utcWeek as Plot.IntervalImplementation<Date>}
    ].map(({label, interval}: {label: string; interval: Plot.Interval<Date>}) =>
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
