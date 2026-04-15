import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function ordinalOpacity() {
  return Plot.cellX(d3.range(10), {fill: "red", opacity: Plot.identity}).plot({opacity: {type: "ordinal"}});
});

test(async function ordinalOpacityImplicitZero() {
  return Plot.cellX(d3.range(2, 10), {fill: "red", opacity: Plot.identity}).plot({opacity: {type: "ordinal"}});
});

test(async function ordinalOpacityRamp() {
  return Plot.cellX(d3.range(10), {fill: "red", opacity: Plot.identity}).plot({
    opacity: {type: "ordinal", legend: "ramp"}
  });
});

test(async function ordinalOpacityThreshold() {
  return Plot.cellX(d3.range(10), {fill: "red", opacity: Plot.identity}).plot({
    opacity: {type: "threshold", legend: true, domain: [2, 5, 8], range: [0.2, 0.4, 0.6, 0.8]}
  });
});
