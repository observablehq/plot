import * as Plot from "@observablehq/plot";

export async function yearlyRequestsDot() {
  const requests = [
    [new Date("2002-01-01"), 9],
    [new Date("2003-01-01"), 17],
    [new Date("2005-01-01"), 5]
  ];
  return Plot.plot({
    x: {type: "point", interval: "year", grid: true},
    y: {zero: true},
    marks: [Plot.ruleY([0]), Plot.dot(requests)]
  });
}
