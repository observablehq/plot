import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function stackNaN() {
  const industries = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  for (const [i, [, D]] of d3.groups(industries, (d) => d.industry).entries()) {
    const lo = Date.UTC(2000 + i, 0, 1, 8);
    const hi = Date.UTC(2002 + i, 0, 1, 8);
    for (const d of D) {
      if (d.date >= lo && d.date < hi) {
        d.unemployed = NaN;
      }
    }
  }
  return Plot.plot({
    y: {grid: true, label: "Unemployed (thousands)", transform: (d) => d / 1000},
    marks: [
      Plot.areaY(industries, {x: "date", y: "unemployed", fill: "industry", fillOpacity: 0.5}),
      Plot.lineY(industries, Plot.stackY({x: "date", y: "unemployed", stroke: "industry"}))
    ]
  });
});
