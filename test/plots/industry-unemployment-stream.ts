import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function industryUnemploymentStream() {
  const data = await d3.csv<any>("data/bls-industry-unemployment.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 44,
    marks: [
      Plot.areaY(
        data,
        Plot.stackY({
          x: "date",
          y: "unemployed",
          fill: "industry",
          title: "industry",
          offset: "wiggle"
        })
      )
    ]
  });
});
