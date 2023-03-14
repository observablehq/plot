import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function seattleTemperatureAmplitude() {
  const data = await d3.csv<any>("data/seattle-weather.csv", d3.autoType);
  const delta = (d) => d.temp_max - d.temp_min;
  return Plot.plot({
    x: {label: "Daily low temperature (°F) →", nice: true},
    y: {label: "↑ Daily temperature variation (Δ°F)", zero: true},
    aspectRatio: 1,
    color: {
      type: "cyclical",
      legend: true,
      tickFormat: Plot.formatMonth()
    },
    marks: [
      Plot.ruleY([0]),
      Plot.dot(data, {fill: (d) => d.date.getUTCMonth(), x: "temp_min", y: delta}),
      Plot.dot(data, Plot.selectMaxY({x: "temp_min", y: delta, r: 5})),
      Plot.text(data, Plot.selectMaxY({x: "temp_min", y: delta, text: "date", lineAnchor: "bottom", dy: -10}))
    ]
  });
}
