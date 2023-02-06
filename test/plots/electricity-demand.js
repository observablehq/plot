import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function electricityDemand() {
  const electricity = await d3.csv("data/electricity-demand.csv", d3.autoType);
  return Plot.plot({
    width: 960,
    marginLeft: 50,
    x: {round: true, nice: d3.utcWeek},
    y: {insetTop: 6},
    marks: [
      Plot.frame({fill: "#efefef"}),
      Plot.ruleY([0]),
      Plot.axisX({ticks: d3.utcYear, tickSize: 28, tickPadding: -11, tickFormat: "  %Y", textAnchor: "start"}),
      Plot.axisX({ticks: d3.utcMonth, tickSize: 16, tickPadding: -11, tickFormat: "  %B", textAnchor: "start"}),
      Plot.gridX({ticks: d3.utcWeek, stroke: "#fff", strokeOpacity: 1, insetBottom: -0.5}),
      Plot.dot(electricity, {x: "date", y: "mwh", stroke: "red", strokeOpacity: 0.3}),
      Plot.line(electricity, Plot.windowY(24, {x: "date", y: "mwh"}))
    ]
  });
}
