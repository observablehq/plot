import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/seattle-weather.csv", d3.autoType);
  const temp_extent = d => d.temp_max - d.temp_min;
  return Plot.plot({
    x: {label: "temp_min →", nice: true},
    y: {label: "↑ temp amplitude", zero: true},
    daspect: 1,
    color: {
        type: "ordinal",
        scheme: "sinebow",
        legend: true,
        tickFormat: Plot.formatMonth()
    },
    marks: [
      Plot.ruleY([0]),
      Plot.dot(data, {fill: d => d.date.getUTCMonth(), x: "temp_min", y: temp_extent, title: "date"}),
      Plot.dot(data, Plot.selectMaxY({x: "temp_min", y: temp_extent, r: 5.5})),
      Plot.text(data, Plot.selectMaxY({x: "temp_min", y: temp_extent, text: "date", dy: -11}))
    ]
  });
}
