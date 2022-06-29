import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

export default async function () {
  const requests = [
    [new Date("2002-01-01"), 9],
    [new Date("2003-01-01"), 17],
    [new Date("2005-01-01"), 5]
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
    marks: [Plot.ruleY([0]), Plot.dot(requests)]
  });
}
