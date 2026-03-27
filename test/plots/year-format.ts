import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function yearFormat() {
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
}

export async function yearFormatExplicit() {
  return Plot.plot({
    x: {tickFormat: "year"},
    marks: [
      Plot.dot(
        [
          {x: 4000, y: 1},
          {x: 5000, y: 2},
          {x: 6000, y: 3}
        ],
        {x: "x", y: "y", tip: true}
      )
    ]
  });
}
