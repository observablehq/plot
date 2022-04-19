import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// This example uses both an interval (to define an ordinal x-scale) and
// a custom transform to parse the dates from their string representation.
export default async function() {
  const IBM = await d3.csv("data/ibm.csv").then(data => data.slice(-20));
  return Plot.plot({
    marginBottom: 65,
    y: {
      transform: d => d / 1e6,
      label: "↑ Volume (USD, millions)",
      grid: true
    },
    x: {
      interval: d3.utcDay,
      transform: d => d3.utcDay.floor(d3.isoParse(d)),
      tickRotate: -40,
      label: null
    },
    marks: [
      Plot.barY(IBM, {x: "Date", y: "Volume"})
    ]
  });
}
