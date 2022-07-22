import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/covid-ihme-projected-deaths.csv", d3.autoType);
  const i = data.findIndex((d) => d.projected) - 1;
  return Plot.plot({
    width: 960,
    height: 600,
    grid: true,
    y: {
      type: "log",
      label: "↑ Deaths per day to COVID-19 (projected)",
      tickFormat: ",~f"
    },
    marks: [
      Plot.areaY(data, {
        x: "date",
        y1: (d) => Math.max(1, d.lower), // avoid zero
        y2: "upper",
        title: () => "cone of uncertainty",
        fillOpacity: 0.2
      }),
      Plot.line(data.slice(0, i + 1), {
        x: "date",
        y: "mean",
        title: () => "actual data"
      }),
      Plot.line(data.slice(i), {
        x: "date",
        y: "mean",
        title: () => "projected values",
        strokeDasharray: "2,2"
      }),
      Plot.dot([data[i]], {
        x: "date",
        y: "mean",
        fill: "currentColor"
      }),
      Plot.text([data[i]], {
        x: "date",
        y: "mean",
        text: "mean",
        textAnchor: "start",
        dx: 6
      })
    ]
  });
}
