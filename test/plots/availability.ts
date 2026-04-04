import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function availability() {
  const data = await d3.csv<any>("data/availability.csv", d3.autoType);
  return Plot.plot({
    height: 180,
    marks: [
      Plot.areaY(data, {
        x: "date",
        y: "value",
        interval: "day",
        curve: "step",
        fill: "#f2f2fe",
        fillOpacity: 1,
        line: true
      }),
      Plot.ruleY([0])
    ]
  });
});
