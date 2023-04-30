import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function groupInterval() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    x: {tickFormat: "%Y", interval: "5 years"},
    marks: [Plot.barY(olympians, Plot.groupX({y: "count"}, {x: "date_of_birth"}))]
  });
}
