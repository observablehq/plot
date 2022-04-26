import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

export default async function() {
  const requests = [[new Date(2002, 0, 1), 9], [new Date(2003, 0, 1), 17], [new Date(2005, 0, 1), 5]];
  return Plot.plot({
    x: {type: "utc", interval: d3.utcYear, label: null, inset: 40, grid: true},
    y: {label: null, zero: true},
    marks: [
      Plot.ruleY([0]),
      Plot.dot(requests, {fill: "#ccc", stroke:"#333"})
    ]
  });
}
