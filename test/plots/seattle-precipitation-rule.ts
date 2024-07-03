import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function seattlePrecipitationRule() {
  const data = await d3.csv<any>("data/seattle-weather.csv", d3.autoType);
  return Plot.ruleX(data, {x: "date", strokeOpacity: "precipitation"}).plot();
}
