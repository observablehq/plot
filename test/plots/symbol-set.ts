import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function symbolSetFill() {
  return Plot.dotX(["circle", "cross", "diamond", "square", "star", "triangle", "wye"], {
    fill: "currentColor",
    symbol: Plot.indexOf
  }).plot();
});

test(async function symbolSetStroke() {
  return Plot.dotX(["circle", "cross", "diamond", "square", "star", "triangle", "wye"], {
    stroke: "currentColor",
    symbol: Plot.indexOf
  }).plot();
});

test(async function symbolSetFillColor() {
  return Plot.dotX(["circle", "cross", "diamond", "square", "star", "triangle", "wye"], {
    fill: Plot.indexOf,
    symbol: Plot.indexOf
  }).plot({symbol: {legend: true}});
});

test(async function symbolSetStrokeColor() {
  return Plot.dotX(["circle", "cross", "diamond", "square", "star", "triangle", "wye"], {
    stroke: Plot.indexOf,
    symbol: Plot.indexOf
  }).plot({symbol: {legend: true}});
});
