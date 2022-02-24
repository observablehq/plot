import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const caltrain = await d3.csv("data/caltrain.csv");
  const times = d3.rollup(caltrain, v => v.map(d => new Date(Date.UTC(2000, 0, 1, d.hours, d.minutes))), d => d.orientation);
  return Plot.plot({
    width: 980,
    x: {tickFormat: "%I%p"},
    marks: [
      Plot.vectorX(times.get("N")),
      Plot.vectorX(times.get("S"), {rotate: 180})
    ]
  });
}
