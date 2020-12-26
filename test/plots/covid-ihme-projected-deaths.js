import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/covid-ihme-projected-deaths.csv", autoType);
  const i = data.findIndex(d => d.projected) - 1;
  return Plot.plot({
    width: 960,
    height: 600,
    grid: true,
    x: {
      label: null
    },
    y: {
      type: "log",
      label: "↑ Deaths per day to COVID-19 (projected)",
      tickFormat: ",~f"
    },
    marks: [
      Plot.areaY(data, {
        x: "date",
        y1: d => Math.max(1, d.lower), // avoid zero
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
