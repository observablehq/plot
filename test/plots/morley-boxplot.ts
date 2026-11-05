import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function morleyBoxplot() {
  const morley = await d3.csv<any>("data/morley.csv", d3.autoType);
  return Plot.boxX(morley, {x: "Speed", y: "Expt"}).plot({x: {grid: true, inset: 6}});
});
