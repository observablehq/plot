import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function electricityDemand() {
  const electricity = await d3.csv<any>("data/electricity-demand.csv", d3.autoType);
  return Plot.plot({
    width: 960,
    marginLeft: 50,
    x: {round: true, nice: "week"},
    y: {insetTop: 6},
    marks: [
      Plot.frame({fill: "#efefef"}),
      Plot.ruleY([0]),
      Plot.axisX({ticks: "year", tickSize: 28, tickPadding: -11, tickFormat: "  %Y", textAnchor: "start"}),
      Plot.axisX({ticks: "month", tickSize: 16, tickPadding: -11, tickFormat: "  %B", textAnchor: "start"}),
      Plot.gridX({ticks: "week", stroke: "#fff", strokeOpacity: 1, insetBottom: -0.5}),
      Plot.dot(electricity, {x: "date", y: "mwh", stroke: "red", strokeOpacity: 0.3}),
      Plot.line(electricity, Plot.windowY(24, {x: "date", y: "mwh"}))
    ]
  });
}
