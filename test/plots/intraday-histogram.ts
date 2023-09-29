import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function intradayHistogram() {
  const timestamps = await d3.csv<any>("data/timestamps.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.rectY(timestamps, Plot.binX({y: "count"}, {x: (d) => d.timestamp.getUTCHours(), interval: 1}))]
  });
}
