import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/metros.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    inset: 10,
    x: {
      type: "log",
      label: "Population →",
      tickFormat: "~s"
    },
    y: {
      label: "↑ Inequality"
    },
    color: {
      type: "diverging",
      reverse: true
    },
    marks: [
      Plot.link(data, {
        x1: "POP_1980",
        y1: "R90_10_1980",
        x2: "POP_2015",
        y2: "R90_10_2015",
        stroke: d => d.R90_10_2015 - d.R90_10_1980
      }),
      Plot.dot(data, {
        x: "POP_2015",
        y: "R90_10_2015",
        r: 1
      }),
      Plot.text(data, {
        x: "POP_2015",
        y: "R90_10_2015",
        text: d => d.highlight && d.nyt_display,
        dy: -6
      })
    ]
  });
}
