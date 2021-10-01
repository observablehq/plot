import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const stargazers = await d3.csv("data/stargazers.csv", d3.autoType);
  return Plot.plot({
    x: {
      label: "New stargazers per hour →"
    },
    y: {
      grid: true
    },
    marks: [
      Plot.barY(
        stargazers,
        Plot.groupX(
          {y: "count", title: "first"},
          Plot.binY(
            {
              x: d => d.length < 5 ? `${d.length}` : "5+",
              thresholds: d3.utcHour,
              title: "first"
            },
            {
              y: "date",
              fill: d => d.date.getUTCDay(),
              title: d => "SMTWTFS"[d.date.getUTCDay()]
            }
          )
        )
      ),
      Plot.ruleY([0])
    ]
  });
}
