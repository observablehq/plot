import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/metros.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    inset: 10,
    x: {
      type: "log",
      label: "Population →"
    },
    y: {
      label: "↑ Inequality"
    },
    color: {
      scheme: "BuRd",
      symmetric: false
    },
    marks: [
      Plot.arrow(data, {
        x1: "POP_1980",
        y1: "R90_10_1980",
        x2: "POP_2015",
        y2: "R90_10_2015",
        bend: true,
        stroke: d => d.R90_10_2015 - d.R90_10_1980
      }),
      Plot.text(data, {
        x: "POP_2015",
        y: "R90_10_2015",
        filter: "highlight",
        text: "nyt_display",
        fill: "currentColor",
        stroke: "white",
        dy: -8
      })
    ]
  });
}
