import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function differenceY() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const goog = await d3.csv<any>("data/goog.csv", d3.autoType);
  const x = aapl.map((d) => d.Date);
  const y1 = aapl.map((d, i, data) => d.Close / data[0].Close);
  const y2 = goog.map((d, i, data) => d.Close / data[0].Close);
  return Plot.plot({
    marks: [Plot.differenceY(aapl, {x, y1, y2})]
  });
}
