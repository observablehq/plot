import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function seattleTemperatureCell() {
  const seattle = await d3.csv<any>("data/seattle-weather.csv", d3.autoType);
  return Plot.plot({
    height: 300,
    padding: 0,
    y: {
      tickFormat: (i) => "JFMAMJJASOND"[i]
    },
    marks: [
      Plot.cell(
        seattle,
        Plot.group(
          {fill: "max"},
          {
            x: (d) => d.date.getUTCDate(),
            y: (d) => d.date.getUTCMonth(),
            fill: "temp_max",
            inset: 0.5
          }
        )
      )
    ]
  });
}
