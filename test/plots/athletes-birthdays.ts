import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function athletesBirthdays() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marginRight: 40,
    y: {
      tickFormat: Plot.formatMonth()
    },
    marks: [
      Plot.barX(athletes, Plot.groupY({x: "count"}, {y: (d) => d.date_of_birth.getUTCMonth()})),
      Plot.textX(
        athletes,
        Plot.groupY({x: "count", text: "count"}, {y: (d) => d.date_of_birth.getUTCMonth(), dx: 4, frameAnchor: "left"})
      ),
      Plot.ruleX([0])
    ]
  });
}
