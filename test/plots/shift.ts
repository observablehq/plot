import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function shiftX() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.arrow(aapl, Plot.shiftX("quarter", {x: "Date", y: "Close", bend: true})).plot();
}
