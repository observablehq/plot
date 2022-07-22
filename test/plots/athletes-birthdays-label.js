import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marginRight: 40,
    y: {
      tickFormat: Plot.formatMonth()
    },
    marks: [
      Plot.barX(athletes, Plot.groupY({x: "count"}, {y: (d) => d.date_of_birth.getUTCMonth()})),
      Plot.textX(
        athletes,
        Plot.groupY(
          {
            x: "count",
            text: "count",
            textAnchor: (data) => (data.length >= 1000 ? "end" : "start"),
            fill: (data) => (data.length >= 1000 ? "white" : "black"),
            dx: (data) => (data.length >= 1000 ? -4 : 4)
          },
          {y: (d) => d.date_of_birth.getUTCMonth()}
        )
      ),
      Plot.ruleX([0])
    ]
  });
}
