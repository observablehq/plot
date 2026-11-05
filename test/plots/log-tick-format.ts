import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function logTickFormatFunction() {
  return Plot.plot({x: {type: "log", domain: [1, 4200], tickFormat: Plot.formatNumber()}});
});

test(async function logTickFormatFunctionSv() {
  return Plot.plot({x: {type: "log", domain: [1, 4200], tickFormat: Plot.formatNumber("sv-SE")}});
});
