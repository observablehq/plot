import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType)
    .then(data => data.filter(d => d.date_of_birth.getUTCFullYear() === 1990));
  return Plot.plot({
    marginRight: 20,
    marks: [
      Plot.rectX(
        athletes,
        Plot.groupY(
          { x: "count" },
          {
            y: (d) => d3.utcMonth.floor(d["date_of_birth"]),
            interval: d3.utcMonth,
            insetTop: 4,
            insetBottom: 4,
            stroke: "black",
            rx: 8
          }
        )
      ),
      Plot.textX(
        athletes,
        Plot.groupY(
          { x: "count", text: "count" },
          {
            y: d => d3.utcMonth.floor(d["date_of_birth"]),
            interval: d3.utcMonth,
            dx: 14
          }
        )
      ),
      Plot.textX(
        athletes,
        Plot.groupY(
          { x: data => data.length / 2, text: ([d]) => Plot.formatMonth()(d.getUTCMonth()) },
          {
            y: d => d3.utcMonth.floor(d["date_of_birth"]),
            interval: d3.utcMonth,
            text: d => d["date_of_birth"]
          }
        )
      )
    ],
    x: { axis: null },
    y: { reverse: true, axis: null }
  });
}
