import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function horizonIndustry() {
  const industries = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.plot({
    color: {
      scheme: "Viridis"
    },
    marks: [
      Plot.horizonY(industries, {x: "date", y: "unemployed", fy: "industry"}),
      Plot.ruleY([0])
    ]
  });
});
