import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const seattle = await d3.csv("data/seattle-weather.csv", d3.autoType);
  return Plot.plot({
    height: 300,
    padding: 0,
    y: {
      tickFormat: i => "JFMAMJJASOND"[i]
    },
    marks: [
      Plot.cell(seattle, {
        ...Plot.group({
          x: d => d.date.getUTCDate(),
          y: d => d.date.getUTCMonth()
        }),
        fill: d => d3.max(d, d => d.temp_max),
        inset: 0.5
      })
    ]
  });
}
