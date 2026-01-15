import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function windowZ() {
  const random = d3.randomLcg(42);
  const data = d3.sort(
    ["a", "b", "c"].flatMap((type, i) =>
      d3.utcDay.range(new Date("2024-01-01"), new Date("2025-01-01"), [1, 7, 30][i]).map((date) => ({
        type,
        date,
        value: ((random() * 1000) | 0) + i * 1500
      }))
    ),
    (d) => d.date
  );

  return Plot.plot({
    y: {grid: true},
    marks: [
      Plot.dot(data, {
        x: "date",
        y: "value",
        fill: "type",
        r: 1.5
      }),
      Plot.lineY(
        data,
        Plot.windowY({
          x: "date",
          y: "value",
          anchor: "end",
          stroke: {value: "type"},
          k: 10,
          reduce: "mean",
          tip: true
        })
      )
    ]
  });
}
