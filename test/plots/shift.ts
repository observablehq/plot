import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function shiftX() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.arrow(aapl, Plot.shiftX("quarter", {x: "Date", y: "Close", bend: true})).plot();
});

test(async function shiftY() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.arrow(aapl, Plot.shiftY("quarter", {y: "Date", x: "Close", bend: true})).plot();
});
