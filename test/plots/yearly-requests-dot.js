import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

export default async function() {
  const requests = [
    [d3.isoParse("2002-01-01"), 9],
    [d3.isoParse("2003-01-01"), 17],
    [d3.isoParse("2005-01-01"), 5]
  ];
  return Plot.plot({
    label: null,
    x: {
      type: "utc",
      interval: d3.utcYear,
      inset: 40,
      grid: true
    },
    y: {
      zero: true
    },
    marks: [
      Plot.ruleY([0]),
      Plot.dot(requests)
    ]
  });
}
