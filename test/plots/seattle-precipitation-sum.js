import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const weather = (await d3.csv("data/seattle-weather.csv", d3.autoType)).slice(-28);
  const y = Plot.window({k: 7, strict: true, reduce: "sum", anchor: "end"});
  const text = Plot.window({k: 7, strict: true, reduce: (V) => Math.round(d3.sum(V)), anchor: "end"});
  return Plot.plot({
    x: {domain: d3.extent(weather.slice(6), (d) => d.date)},
    y: {insetTop: 10},
    marks: [
      Plot.rectY(weather, Plot.map({y}, {x: "date", y: "precipitation", interval: d3.utcDay})),
      Plot.textY(
        weather,
        Plot.map({y, text}, {x: "date", y: "precipitation", text: "precipitation", interval: d3.utcDay, dy: -6})
      ),
      Plot.ruleY([0])
    ]
  });
}
