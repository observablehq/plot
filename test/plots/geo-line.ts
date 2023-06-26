import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function geoLine() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.geo({type: "LineString", coordinates: aapl.map((d) => [d.Date, d.Close])}).plot();
}
