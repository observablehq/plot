import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function yearFormat() {
  const raw = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  const data = d3
    .rollups(
      raw,
      (v) => d3.median(v, (d) => d.unemployed),
      (d) => d.date.getUTCFullYear(),
      (d) => d.industry
    )
    .flatMap(([year, industries]) => industries.map(([industry, unemployed]) => ({year, industry, unemployed})));
  return Plot.plot({
    marks: [Plot.line(data, {x: "year", y: "unemployed", stroke: "industry", marker: true, tip: true}), Plot.ruleY([0])]
  });
});
