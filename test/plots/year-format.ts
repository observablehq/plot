import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

async function getYearlyUnemployment() {
  return d3
    .rollups(
      await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType),
      (D) => d3.median(D, (d) => d.unemployed),
      (d) => d.date.getUTCFullYear(),
      (d) => d.industry
    )
    .flatMap(([year, industries]) => industries.map(([industry, unemployed]) => ({year, industry, unemployed})));
}

test(async function yearFormat() {
  const data = await getYearlyUnemployment();
  return Plot.plot({
    marks: [
      Plot.lineY(data, {x: "year", y: "unemployed", stroke: "industry", marker: true, tip: true}),
      Plot.ruleY([0])
    ]
  });
});

test(async function yearFormatOrdinal() {
  const data = await getYearlyUnemployment();
  return Plot.plot({
    marks: [
      Plot.barY(data, {x: "year", y: "unemployed", fill: "industry", tip: true}), //
      Plot.ruleY([0])
    ]
  });
});
