import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function markerRuleX() {
  return Plot.ruleX([1, 2, 3], {marker: "arrow-reverse", inset: 3}).plot();
});

test(async function markerRuleY() {
  return Plot.ruleY([1, 2, 3], {marker: "arrow-reverse", inset: 3}).plot();
});

test(async function markerTickX() {
  return Plot.tickX([1, 2, 3], {marker: "arrow-reverse", inset: 3}).plot();
});

test(async function markerTickY() {
  return Plot.tickY([1, 2, 3], {marker: "arrow-reverse", inset: 3}).plot();
});
