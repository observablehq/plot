import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const weather = (await d3.csv("data/seattle-weather.csv", d3.autoType)).slice(-28);
  const y = Plot.window({k: 7, reduce: "sum", anchor: "end"});
  const text = Plot.window({k: 7, reduce: V => Math.round(d3.sum(V)), anchor: "end"});
  return Plot.plot({
    marks: [
      Plot.rectY(weather, Plot.map({y}, {x: "date", y: "precipitation", interval: d3.utcDay})),
      Plot.textY(weather, Plot.map({y, text}, {x: "date", y: "precipitation", text: "precipitation", interval: d3.utcDay, frameAnchor: "bottom", dy: -3})),
      Plot.ruleY([0])
    ]
  });
}
