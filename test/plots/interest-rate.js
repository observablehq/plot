import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const h15 = d3.csvParse((await d3.text("data/federal-funds.csv")).split("\n").slice(5).join("\n"), d3.autoType);
  return Plot.plot({
    marginLeft: 0,
    x: {label: null, insetLeft: 28}, // reserve space for inset labels
    y: {label: "↑ Federal funds rate (% per year)"},
    marks: [
      Plot.axisY({
        interval: 2, // every 2%
        tickSize: 0, // don’t draw ticks
        dx: 32, // offset right
        dy: -6, // offset up
        lineAnchor: "bottom", // draw labels above grid lines
        tickFormat: (d) => (d === 10 ? `${d}%` : `${d}   `)
      }),
      Plot.gridY({
        interval: 2, // every 2%
        strokeDasharray: "1.5,1.5", // dashed
        strokeOpacity: 0.4 // more opaque
      }),
      Plot.ruleY([0]),
      Plot.line(h15, {x: "Time Period", y: "RIFSPFF_N.BWAW", markerEnd: "dot"})
    ]
  });
}
