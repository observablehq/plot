import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function overlappingArea() {
  const industries = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.areaY(industries, {x: "date", y2: "unemployed", z: "industry", fillOpacity: 0.1}),
      Plot.lineY(industries, {x: "date", y: "unemployed", z: "industry", strokeWidth: 1})
    ]
  });
});
